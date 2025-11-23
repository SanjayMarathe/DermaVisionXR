import { Pinecone } from '@pinecone-database/pinecone';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Use require for sharp due to CommonJS export
const sharp = require('sharp');

// Load environment variables
dotenv.config();

// Configuration
const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'ham10000-medical';
const HAM10000_PATH = process.env.HAM10000_PATH || './data/HAM10000';

if (!PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY is required in .env file');
  process.exit(1);
}

const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

interface HAM10000Record {
  image_id: string;
  lesion_id: string;
  dx: string;
  dx_type: string;
  age: string;
  sex: string;
  localization: string;
}

// Load Hugging Face model (runs locally)
let embeddingModel: any = null;
let modelLoadingPromise: Promise<any> | null = null;

async function loadEmbeddingModel(): Promise<any> {
  // If model is already loaded, return it
  if (embeddingModel) {
    return embeddingModel;
  }
  
  // If model is currently loading, wait for that promise
  if (modelLoadingPromise) {
    return modelLoadingPromise;
  }
  
  // Start loading the model
  modelLoadingPromise = (async () => {
    console.log('🔄 Loading Hugging Face model (this may take a minute on first run)...');
    
    // Dynamic import for ES module
    const { pipeline } = await import('@xenova/transformers');
    
    // Using CLIP model - more reliable and outputs 512 dims, we'll project to 1024
    // CLIP is more stable and less likely to hit rate limits
    let model;
    let retries = 3;
    let delay = 5000; // 5 seconds
    
    while (retries > 0) {
      try {
        model = await pipeline(
          'image-feature-extraction',
          'Xenova/clip-vit-base-patch32'
        );
        break; // Success, exit retry loop
      } catch (error: any) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          console.log(`⚠️  Rate limit hit, retrying in ${delay/1000} seconds... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw error; // Non-rate-limit error, throw immediately
        }
      }
    }
    
    console.log('✅ Model loaded successfully');
    embeddingModel = model;
    modelLoadingPromise = null; // Clear the loading promise
    return model;
  })();
  
  return modelLoadingPromise;
}

// Generate 1024-dim embedding for an image
async function generateEmbedding(imagePath: string): Promise<number[]> {
  const model = await loadEmbeddingModel();
  
  try {
    // CLIP accepts file paths directly - no need to preprocess
    // The model will handle image loading and preprocessing internally
    const output = await model(imagePath, {
      pooling: 'mean',
      normalize: true
    });
    
    // Extract embedding values
    let embedding: number[];
    if ((output as any).data) {
      embedding = Array.from((output as any).data);
    } else if (Array.isArray(output)) {
      embedding = output.flat();
    } else {
      embedding = Object.values(output).flat() as number[];
    }
    
    // CLIP outputs 512 dimensions, project to 1024
    // Simple projection: duplicate and add variation
    if (embedding.length === 512) {
      // Project 512 -> 1024 by duplicating with slight variation
      const projected = [...embedding];
      const variation = embedding.map(v => v * 0.1); // Small variation
      embedding = [...projected, ...variation];
    }
    
    // Ensure exactly 1024 dimensions
    if (embedding.length === 1024) {
      return embedding;
    } else if (embedding.length < 1024) {
      // Pad with zeros if still less than 1024
      return [...embedding, ...new Array(1024 - embedding.length).fill(0)];
    } else {
      // Truncate if more than 1024
      return embedding.slice(0, 1024);
    }
  } catch (error) {
    console.error(`❌ Error processing ${imagePath}:`, error);
    throw error;
  }
}

// Process and upload dataset
async function vectorizeHAM10000() {
  const imagesPath = path.join(HAM10000_PATH, 'HAM10000_images');
  const metadataPath = path.join(HAM10000_PATH, 'HAM10000_metadata.csv');

  // Check if dataset exists
  if (!fs.existsSync(imagesPath) || !fs.existsSync(metadataPath)) {
    console.error(`❌ Dataset not found at: ${HAM10000_PATH}`);
    console.error('   Expected structure:');
    console.error('   HAM10000/');
    console.error('     ├── HAM10000_images/');
    console.error('     └── HAM10000_metadata.csv');
    console.error(`\n   Please set HAM10000_PATH in .env or place dataset in ./data/HAM10000`);
    process.exit(1);
  }

  // Read and parse CSV metadata
  console.log('📖 Reading metadata CSV...');
  const csvContent = fs.readFileSync(metadataPath, 'utf-8');
  const records: HAM10000Record[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    cast: false,
    trim: true
  }) as HAM10000Record[];

  console.log(`✅ Loaded ${records.length} records from metadata\n`);

  // Initialize Pinecone index
  console.log(`🔗 Connecting to Pinecone index: ${PINECONE_INDEX_NAME}...`);
  
  // Check if index exists, create if not
  const indexes = await pc.listIndexes();
  const indexExists = indexes.indexes?.some(idx => idx.name === PINECONE_INDEX_NAME);
  
  if (!indexExists) {
    console.log(`📦 Creating new Pinecone index: ${PINECONE_INDEX_NAME}...`);
    await pc.createIndex({
      name: PINECONE_INDEX_NAME,
      dimension: 1024,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1' // Change to your preferred region
        }
      }
    });
    console.log('✅ Index created. Waiting for it to be ready...');
    // Wait a bit for index to be ready
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  const index = pc.index(PINECONE_INDEX_NAME);
  
  // Check index stats
  try {
    const stats = await index.describeIndexStats();
    console.log(`📊 Index stats:`, stats);
  } catch (error) {
    console.log('⚠️  Could not get index stats (index may still be initializing)');
  }

  // Process in batches
  const BATCH_SIZE = 20; // Adjust based on your system
  let processed = 0;
  let failed = 0;
  let skipped = 0;

  console.log(`\n🚀 Starting vectorization...\n`);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(records.length / BATCH_SIZE);
    
    console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, records.length)} of ${records.length})`);

    const vectors = await Promise.all(
      batch.map(async (record) => {
        const imagePath = path.join(imagesPath, `${record.image_id}.jpg`);
        
        if (!fs.existsSync(imagePath)) {
          console.warn(`⚠️  Image not found: ${record.image_id}`);
          skipped++;
          return null;
        }

        try {
          // Generate 1024-dim embedding
          const embedding = await generateEmbedding(imagePath);
          
          // Verify dimensions
          if (embedding.length !== 1024) {
            console.error(`❌ Wrong dimensions for ${record.image_id}: ${embedding.length}`);
            failed++;
            return null;
          }

          // Prepare metadata
          const metadata = {
            image_id: record.image_id,
            lesion_id: record.lesion_id,
            diagnosis: record.dx,
            diagnosis_type: record.dx_type,
            age: record.age || 'unknown',
            sex: record.sex || 'unknown',
            localization: record.localization || 'unknown'
          };

          return {
            id: record.image_id,
            values: embedding,
            metadata: metadata
          };
        } catch (error) {
          console.error(`❌ Error processing ${record.image_id}:`, error);
          failed++;
          return null;
        }
      })
    );

    // Filter out nulls and upload to Pinecone
    const validVectors = vectors.filter(v => v !== null) as any[];
    
    if (validVectors.length > 0) {
      try {
        await index.upsert(validVectors);
        processed += validVectors.length;
        console.log(`✅ Uploaded ${validVectors.length} vectors (${processed}/${records.length} total processed)`);
      } catch (error) {
        console.error(`❌ Error uploading batch:`, error);
        failed += validVectors.length;
      }
    }

    // Small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n🎉 Vectorization complete!`);
  console.log(`✅ Successfully processed: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📊 Total records: ${records.length}`);
  
  // Final index stats
  try {
    const finalStats = await index.describeIndexStats();
    console.log(`\n📊 Final index stats:`, finalStats);
  } catch (error) {
    console.log('⚠️  Could not get final stats');
  }
}

// Run the script
vectorizeHAM10000().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

