# HAM10000 Vectorization Server

This server vectorizes the HAM10000 skin lesion dataset using Hugging Face models and stores embeddings in Pinecone for RAG (Retrieval Augmented Generation).

## Setup

1. **Place your dataset** in one of these locations:
   - `./data/HAM10000/` (extracted)
   - Or set `HAM10000_PATH` in `.env`

2. **Dataset structure should be:**
   ```
   HAM10000/
     ├── HAM10000_images/
     │   ├── ISIC_0024306.jpg
     │   ├── ISIC_0024307.jpg
     │   └── ... (10,015 images)
     └── HAM10000_metadata.csv
   ```

## Configuration

The `.env` file contains:
- `PINECONE_API_KEY` - Your Pinecone API key
- `PINECONE_INDEX_NAME` - Index name (default: `ham10000-medical`)
- `HAM10000_PATH` - Path to extracted dataset
- `HAM10000_ZIP_PATH` - Path to zip file (optional)

## Usage

### Vectorize the dataset

```bash
npm run vectorize
```

This will:
1. Load the Hugging Face Swin Transformer model (1024 dimensions)
2. Process all 10,015 images
3. Generate embeddings for each image
4. Upload to Pinecone index `ham10000-medical`

### Expected Output

```
🔄 Loading Hugging Face model...
✅ Model loaded successfully
📖 Reading metadata CSV...
✅ Loaded 10015 records from metadata

🔗 Connecting to Pinecone index: ham10000-medical...
📊 Index stats: { totalVectorCount: 0 }

🚀 Starting vectorization...

📦 Processing batch 1/501 (1-20 of 10015)
✅ Uploaded 20 vectors (20/10015 total processed)
...

🎉 Vectorization complete!
✅ Successfully processed: 10015
```

## Time Estimate

- First run: ~2-4 hours (includes model download)
- Subsequent runs: ~1-2 hours
- Processing speed: ~5-10 images/second

## Notes

- The model uses `microsoft/swin-base-patch4-window7-224` which outputs 1024-dimensional embeddings
- Images are resized to 224x224 before processing
- Embeddings are normalized and use cosine similarity
- The Pinecone index is created automatically if it doesn't exist

