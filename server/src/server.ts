import express from 'express';
import cors from 'cors';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import multer from 'multer';
import sharp from 'sharp';
import { runMultiAgentConsultation } from './agents/consultationAgents';
import type { DiagnosisResult, PatientContext } from './agents/types';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Pinecone setup
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_INDEX_NAME || 'ham10000-medical');

// Load embedding model
let embeddingModel: any = null;

async function loadEmbeddingModel() {
    if (embeddingModel) return embeddingModel;
    
    console.log('🔄 Loading embedding model...');
    const { pipeline } = await import('@xenova/transformers');
    
    embeddingModel = await pipeline(
        'image-feature-extraction',
        'Xenova/clip-vit-base-patch32'
    );
    
    console.log('✅ Model loaded successfully');
    return embeddingModel;
}

// Generate embedding from image buffer
async function generateEmbedding(imageBuffer: Buffer): Promise<number[]> {
    const model = await loadEmbeddingModel();
    
    // Process image with sharp to ensure it's in the right format
    const processedBuffer = await sharp(imageBuffer)
        .resize(224, 224)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    
    // Create RawImage directly from buffer data
    const { data, info } = processedBuffer;
    const RawImage = (await import('@xenova/transformers')).RawImage;
    const image = new RawImage(new Uint8ClampedArray(data), info.width, info.height, info.channels);
    
    const output = await model(image, {
        pooling: 'mean',
        normalize: true
    });
    
    let embedding: number[];
    if ((output as any).data) {
        embedding = Array.from((output as any).data);
    } else if (Array.isArray(output)) {
        embedding = output.flat();
    } else {
        embedding = Object.values(output).flat() as number[];
    }
    
    // Project 512 -> 1024 dimensions
    if (embedding.length === 512) {
        const projected = [...embedding];
        const variation = embedding.map(v => v * 0.1);
        embedding = [...projected, ...variation];
    }
    
    // Ensure exactly 1024 dimensions
    if (embedding.length < 1024) {
        return [...embedding, ...new Array(1024 - embedding.length).fill(0)];
    } else if (embedding.length > 1024) {
        return embedding.slice(0, 1024);
    }
    
    return embedding;
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Similarity search endpoint
app.post('/api/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }
        
        console.log('📸 Received image for analysis:', req.file.size, 'bytes');
        
        // Generate embedding from uploaded image
        const embedding = await generateEmbedding(req.file.buffer);
        console.log('✅ Generated embedding:', embedding.length, 'dimensions');
        
        // Query Pinecone for similar images
        const queryResponse = await index.query({
            vector: embedding,
            topK: 5,
            includeMetadata: true
        });
        
        console.log('🔍 Found', queryResponse.matches?.length, 'similar cases');
        
        if (!queryResponse.matches || queryResponse.matches.length === 0) {
            return res.json({
                diagnosis: 'Unable to determine',
                confidence: 0,
                color: '#gray-500',
                recommendation: 'No similar cases found in database. Please consult a dermatologist.',
                similarCases: []
            });
        }
        
        // Get the top match
        const topMatch = queryResponse.matches[0];
        const similarity = topMatch.score || 0;
        const confidence = Math.round(similarity * 100);
        
        // Diagnosis mapping
        const diagnosisMap: Record<string, { name: string; color: string; recommendation: string }> = {
            'nv': {
                name: 'Melanocytic Nevus (Benign)',
                color: '#10b981',
                recommendation: 'Common benign mole. Monitor for changes in size, shape, or color. Regular skin checks recommended.'
            },
            'bkl': {
                name: 'Benign Keratosis',
                color: '#3b82f6',
                recommendation: 'Benign lesion, typically age-related. No immediate concern, but regular monitoring advised.'
            },
            'df': {
                name: 'Dermatofibroma',
                color: '#8b5cf6',
                recommendation: 'Benign fibrous growth. Generally harmless but can be removed if bothersome.'
            },
            'vasc': {
                name: 'Vascular Lesion',
                color: '#ec4899',
                recommendation: 'Benign vascular growth. Consult dermatologist for cosmetic concerns or if changes occur.'
            },
            'bcc': {
                name: 'Basal Cell Carcinoma',
                color: '#f59e0b',
                recommendation: '⚠️ Most common skin cancer. Schedule immediate dermatologist appointment for biopsy and treatment.'
            },
            'akiec': {
                name: 'Actinic Keratosis',
                color: '#f97316',
                recommendation: '⚠️ Precancerous lesion. Requires dermatologist evaluation and treatment to prevent progression.'
            },
            'mel': {
                name: 'Melanoma',
                color: '#ef4444',
                recommendation: '⚠️⚠️ Potentially serious. IMMEDIATE dermatologist consultation required. Early detection is critical.'
            }
        };
        
        const metadata = topMatch.metadata as any;
        const diagnosisCode = metadata?.diagnosis || 'nv';
        const diagnosisInfo = diagnosisMap[diagnosisCode] || diagnosisMap['nv'];
        
        // Get similar cases for reference
        const similarCases = queryResponse.matches.slice(0, 5).map(match => ({
            imageId: match.id,
            similarity: Math.round((match.score || 0) * 100),
            diagnosis: (match.metadata as any)?.diagnosis,
            age: (match.metadata as any)?.age,
            sex: (match.metadata as any)?.sex,
            localization: (match.metadata as any)?.localization
        }));
        
        res.json({
            diagnosis: diagnosisInfo.name,
            confidence: confidence,
            color: diagnosisInfo.color,
            recommendation: diagnosisInfo.recommendation,
            similarCases: similarCases,
            metadata: {
                topMatchId: topMatch.id,
                diagnosisCode: diagnosisCode,
                similarity: similarity
            }
        });
        
    } catch (error) {
        console.error('❌ Analysis error:', error);
        res.status(500).json({ 
            error: 'Analysis failed', 
            message: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
});

// Alternative endpoint for base64 images
app.post('/api/analyze-base64', async (req, res) => {
    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }
        
        // Remove data URL prefix if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        console.log('📸 Received base64 image:', imageBuffer.length, 'bytes');
        
        // Generate embedding
        const embedding = await generateEmbedding(imageBuffer);
        console.log('✅ Generated embedding:', embedding.length, 'dimensions');
        
        // Query Pinecone
        const queryResponse = await index.query({
            vector: embedding,
            topK: 5,
            includeMetadata: true
        });
        
        console.log('🔍 Found', queryResponse.matches?.length, 'similar cases');
        
        if (!queryResponse.matches || queryResponse.matches.length === 0) {
            return res.json({
                diagnosis: 'Unable to determine',
                confidence: 0,
                color: '#gray-500',
                recommendation: 'No similar cases found in database. Please consult a dermatologist.',
                similarCases: []
            });
        }
        
        const topMatch = queryResponse.matches[0];
        const similarity = topMatch.score || 0;
        const confidence = Math.round(similarity * 100);
        
        const diagnosisMap: Record<string, { name: string; color: string; recommendation: string }> = {
            'nv': { name: 'Melanocytic Nevus (Benign)', color: '#10b981', recommendation: 'Common benign mole. Monitor for changes in size, shape, or color. Regular skin checks recommended.' },
            'bkl': { name: 'Benign Keratosis', color: '#3b82f6', recommendation: 'Benign lesion, typically age-related. No immediate concern, but regular monitoring advised.' },
            'df': { name: 'Dermatofibroma', color: '#8b5cf6', recommendation: 'Benign fibrous growth. Generally harmless but can be removed if bothersome.' },
            'vasc': { name: 'Vascular Lesion', color: '#ec4899', recommendation: 'Benign vascular growth. Consult dermatologist for cosmetic concerns or if changes occur.' },
            'bcc': { name: 'Basal Cell Carcinoma', color: '#f59e0b', recommendation: '⚠️ Most common skin cancer. Schedule immediate dermatologist appointment for biopsy and treatment.' },
            'akiec': { name: 'Actinic Keratosis', color: '#f97316', recommendation: '⚠️ Precancerous lesion. Requires dermatologist evaluation and treatment to prevent progression.' },
            'mel': { name: 'Melanoma', color: '#ef4444', recommendation: '⚠️⚠️ Potentially serious. IMMEDIATE dermatologist consultation required. Early detection is critical.' }
        };
        
        const metadata = topMatch.metadata as any;
        const diagnosisCode = metadata?.diagnosis || 'nv';
        const diagnosisInfo = diagnosisMap[diagnosisCode] || diagnosisMap['nv'];
        
        const similarCases = queryResponse.matches.slice(0, 5).map(match => ({
            imageId: match.id,
            similarity: Math.round((match.score || 0) * 100),
            diagnosis: (match.metadata as any)?.diagnosis,
            age: (match.metadata as any)?.age,
            sex: (match.metadata as any)?.sex,
            localization: (match.metadata as any)?.localization
        }));
        
        res.json({
            diagnosis: diagnosisInfo.name,
            confidence: confidence,
            color: diagnosisInfo.color,
            recommendation: diagnosisInfo.recommendation,
            similarCases: similarCases,
            metadata: {
                topMatchId: topMatch.id,
                diagnosisCode: diagnosisCode,
                similarity: similarity
            }
        });
        
    } catch (error) {
        console.error('❌ Analysis error:', error);
        res.status(500).json({ 
            error: 'Analysis failed', 
            message: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
});

// Multi-agent consultation endpoint
app.post('/api/consultation', async (req, res) => {
    try {
        const { diagnosisResult, patientContext } = req.body;
        
        if (!diagnosisResult) {
            return res.status(400).json({ error: 'Diagnosis result required' });
        }
        
        console.log('🤖 Starting multi-agent consultation...');
        console.log('📋 Diagnosis:', diagnosisResult.diagnosis);
        
        // Run multi-agent consultation
        const consultation = await runMultiAgentConsultation(
            diagnosisResult as DiagnosisResult,
            patientContext as PatientContext
        );
        
        console.log('✅ Consultation complete');
        console.log(`👥 ${consultation.specialists.length} specialists consulted`);
        console.log(`🎯 Agreement score: ${consultation.agreementScore}%`);
        console.log(`⏱️  Processing time: ${consultation.processingTime}ms`);
        
        res.json(consultation);
        
    } catch (error) {
        console.error('❌ Consultation error:', error);
        res.status(500).json({ 
            error: 'Consultation failed', 
            message: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 DermaVision API server running on port ${PORT}`);
    console.log(`📊 Pinecone index: ${process.env.PINECONE_INDEX_NAME || 'ham10000-medical'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔬 Analysis endpoint: http://localhost:${PORT}/api/analyze`);
    console.log(`🖼️  Base64 endpoint: http://localhost:${PORT}/api/analyze-base64`);
    console.log(`🤖 Consultation endpoint: http://localhost:${PORT}/api/consultation`);
});

export default app;
