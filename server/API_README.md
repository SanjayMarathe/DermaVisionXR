# DermaVision API Server

Real-time skin lesion analysis API using HAM10000 dataset and Pinecone vector similarity search.

## Features

- 🔬 **Similarity Search**: Find similar cases from 10,000+ dermatoscopic images
- 🧠 **AI Embeddings**: CLIP model for image feature extraction
- 📊 **Pinecone Integration**: Fast vector similarity search
- 🎯 **7 Diagnosis Types**: Melanoma, BCC, Keratosis, Nevus, and more
- 🔄 **Two Endpoints**: File upload and base64 image support

## Quick Start

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and add your Pinecone API key:
```env
PINECONE_API_KEY=your-api-key-here
PINECONE_INDEX_NAME=ham10000-medical
PORT=3001
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T..."
}
```

### Analyze Image (File Upload)
```bash
POST /api/analyze
Content-Type: multipart/form-data

{
  "image": <file>
}
```

### Analyze Image (Base64)
```bash
POST /api/analyze-base64
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

Response:
```json
{
  "diagnosis": "Melanocytic Nevus (Benign)",
  "confidence": 92,
  "color": "#10b981",
  "recommendation": "Common benign mole. Monitor for changes...",
  "similarCases": [
    {
      "imageId": "ISIC_0024306",
      "similarity": 92,
      "diagnosis": "nv",
      "age": "45",
      "sex": "male",
      "localization": "back"
    }
  ],
  "metadata": {
    "topMatchId": "ISIC_0024306",
    "diagnosisCode": "nv",
    "similarity": 0.92
  }
}
```

## Diagnosis Codes

| Code | Diagnosis | Severity |
|------|-----------|----------|
| `nv` | Melanocytic Nevus | Benign |
| `bkl` | Benign Keratosis | Benign |
| `df` | Dermatofibroma | Benign |
| `vasc` | Vascular Lesion | Benign |
| `bcc` | Basal Cell Carcinoma | ⚠️ Cancer |
| `akiec` | Actinic Keratosis | ⚠️ Pre-cancer |
| `mel` | Melanoma | ⚠️⚠️ Serious |

## How It Works

1. **Image Upload**: Receives image from frontend
2. **Preprocessing**: Resizes to 224x224 using Sharp
3. **Embedding**: Generates 1024-dim vector using CLIP model
4. **Search**: Queries Pinecone for top 5 similar cases
5. **Diagnosis**: Maps similarity to diagnosis with confidence
6. **Response**: Returns diagnosis + similar cases

## Integration with Frontend

Update `dermavisionxr/.env.local`:
```env
VITE_API_URL=http://localhost:3001
```

The ScanPage component will automatically call this API when analyzing images.

## Testing

### Using cURL
```bash
# Health check
curl http://localhost:3001/health

# Analyze (base64)
curl -X POST http://localhost:3001/api/analyze-base64 \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,..."}'

# Analyze (file upload)
curl -X POST http://localhost:3001/api/analyze \
  -F "image=@path/to/image.jpg"
```

### Using Frontend
1. Start API server: `npm run dev`
2. Start frontend: `cd ../dermavisionxr && npm run dev`
3. Open http://localhost:5176
4. Click "Initiate Scan" and capture image
5. API will automatically analyze

## Performance

- **First Request**: ~2-3 seconds (model loading)
- **Subsequent Requests**: ~500-800ms
- **Concurrent Requests**: Supported
- **Image Size**: Optimal < 5MB

## Requirements

- Node.js 18+
- Pinecone account with vectorized HAM10000 data
- At least 2GB RAM (for CLIP model)

## Vectorize Dataset First

Before using the API, vectorize the HAM10000 dataset:

```bash
npm run vectorize
```

This will:
1. Load HAM10000 images from `data/HAM10000/`
2. Generate embeddings for all 10,015 images
3. Upload to Pinecone index
4. Takes ~1-2 hours

See main README for dataset setup instructions.

## Security Notes

⚠️ **This is a demo API** - For production:

1. Add authentication/API keys
2. Rate limiting
3. Input validation & sanitization
4. HTTPS/TLS encryption
5. HIPAA compliance measures
6. Audit logging
7. Error handling improvements

## CORS Configuration

Currently allows all origins for development. Update for production:

```typescript
app.use(cors({
  origin: 'https://your-domain.com',
  credentials: true
}));
```

## License

ISC - For demonstration purposes only. Not for clinical use.
