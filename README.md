# Niti-Setu 🌾 
#** Depolyed website link: https://niti-setu-sand.vercel.app/**
### RAG-Powered Government Scheme Eligibility Engine

Eligibility decisions are made by retrieving relevant chunks from real official government PDFs and reasoning over them with **Google Gemini 2.5 Flash** — not from hardcoded rules. Every result includes a direct citation from the document.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  HomeScreen → VoiceScreen / FormScreen → ResultsScreen → Detail │
└───────────────────────┬─────────────────────────────────────────┘
                        │  POST /api/eligibility { profile }
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js / Express)                  │
│                                                                 │
│  1. profileToQuery()   → natural language query from profile    │
│  2. embedQuery()       → Xenova/all-MiniLM-L6-v2 (local, 384d)  │
│  3. $vectorSearch      → MongoDB Atlas finds top-6 chunks       │
│  4. runRAGChain()      → Gemini 2.5 Flash reasons & decides     │
│  5. Returns JSON       → { eligible, proof, reasons, citation } │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MONGODB ATLAS                                 │
│   Collection: chunks   (text + 384-dim embedding vectors)       │
│   Collection: schemes  (display metadata)                       │
│   Index: vector_index  (cosine similarity search)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Supported Schemes

| Emoji | ID           | Scheme Name                                     | Benefit                            |
|-------|--------------|-------------------------------------------------|------------------------------------|
| 🌾    | `pmkisan`    | Pradhan Mantri Kisan Samman Nidhi               | ₹6,000 / year                      |
| 🛡️    | `pmfby`      | Pradhan Mantri Fasal Bima Yojana                | Full crop insurance                |
| 💳    | `kcc`        | Kisan Credit Card Scheme                        | Credit up to ₹3 lakh @ 4% p.a.     |
| 💧    | `pmksy`      | Pradhan Mantri Krishi Sinchayee Yojana          | Irrigation & water efficiency      |
| 🍀    | `pkvy`       | Paramparagat Krishi Vikas Yojana                | ₹50,000 / ha for 3 years (organic) |
| 📊    | `agribudget` | Demand for Grants Analysis 2026-27: Agriculture | Policy & funding insights          |

---

## Project Structure

```
niti-setu/
├── package.json                   Root manager — runs both client & server
├── server/                        ← RAG Backend (Node.js / Express)
│   ├── index.js                   Express server entry point
│   ├── db.js                      MongoDB connection singleton
│   ├── .env                       API keys (see Step 2)
│   ├── package.json
│   ├── pdfs/                      ← Drop your PDF files here
│   │   ├── pmkisan.pdf
│   │   ├── pmfby.pdf
│   │   ├── kcc.pdf
│   │   ├── Pradhan Mantri Krishi Sichai Yojana.pdf
│   │   ├── paramparagat-krishi-vikas-yojana.pdf
│   │   └── DfG_Analysis_2026-27-Agriculture.pdf
│   ├── rag/
│   │   ├── ingest.js              PDF → chunks → embeddings → MongoDB
│   │   ├── retriever.js           Query embedding + vector search
│   │   └── ragChain.js            Assemble context + call Gemini
│   ├── routes/
│   │   ├── eligibility.js         POST /api/eligibility
│   │   └── schemes.js             GET/POST /api/schemes
│   └── middleware/
│       └── errorHandler.js
│
└── client/                        ← Frontend (React)
    └── src/
        ├── App.jsx                Router + state (uses RAG API)
        ├── utils/
        │   ├── ragApi.js          API client for backend
        │   └── parseVoice.js      NLP parser for voice/text input
        ├── data/
        │   ├── schemes.js         Scheme definitions (UI + rules)
        │   └── fields.js          Form fields + voice chips
        ├── hooks/
        │   ├── useVoice.js        Web Speech API hook
        │   └── useParticles.js
        ├── components/
        │   ├── layout/            Header, ParticleBackground
        │   ├── ui/                Spinner, AnimatedNumber, etc.
        │   └── screens/           All screen components
        └── styles/
            └── global.css         Design tokens + animations
```

---

## Setup Guide

### Step 1 — MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Create a database named **`nitisetu`**
3. Enable **Atlas Vector Search** on your cluster
4. Create a **Search Index** on the `chunks` collection:

   - Index name: `vector_index`
   - JSON config:
   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "embedding",
         "numDimensions": 384,
         "similarity": "cosine"
       },
       {
         "type": "filter",
         "path": "schemeId"
       }
     ]
   }
   ```
   > ⚠️ **numDimensions must be 384** — this matches the local `all-MiniLM-L6-v2` embedding model.
5. Go to **Network Access** → Add your current IP (or `0.0.0.0/0` for development)
6. Copy your connection string for the `.env` file

---

### Step 2 — Environment Variables

Create `server/.env` with the following:
```
GOOGLE_API_KEY=...               # from aistudio.google.com/app/apikey
MONGODB_URI=mongodb+srv://...    # from MongoDB Atlas
PORT=5000
```

> **Note:** The project uses Google Gemini 2.5 Flash for reasoning. No Anthropic key is required.

---

### Step 3 — Install Dependencies

```bash
# In the root directory:
npm install

# Then in the server directory:
cd server && npm install

# Then in the client directory:
cd ../client && npm install
```

---

### Step 4 — Add PDFs

Download official scheme PDFs and place them in `server/pdfs/`:

| File name                                      | Scheme       | Official source       |
|------------------------------------------------|--------------|-----------------------|
| `pmkisan.pdf`                                  | PM-KISAN     | pmkisan.gov.in        |
| `pmfby.pdf`                                    | PMFBY        | pmfby.gov.in          |
| `kcc.pdf`                                      | KCC          | nabard.org            |
| `Pradhan Mantri Krishi Sichai Yojana.pdf`      | PMKSY        | pmksy.gov.in          |
| `paramparagat-krishi-vikas-yojana.pdf`         | PKVY         | pgsindia-ncof.gov.in  |
| `DfG_Analysis_2026-27-Agriculture.pdf`         | Agri Budget  | prsindia.org          |

---

### Step 5 — Ingest PDFs

```bash
# From the root directory:
npm run ingest

# Or from the server directory:
cd server && npm run ingest
```

This will:
- Connect to MongoDB Atlas
- Extract text from each PDF
- Split into 500-word chunks with 100-word overlap
- Generate local embeddings using `Xenova/all-MiniLM-L6-v2`
- Store everything in MongoDB Atlas
- Upsert scheme metadata

Expected output:
```
🚀 Niti-Setu RAG Ingestion Pipeline

✅ Connected to MongoDB Atlas
📋 Upserting scheme metadata...
   ✅ 6 schemes saved

📄 Ingesting PM-KISAN from pmkisan.pdf...
   11 chunks created
   ✅ 11 chunks stored for PM-KISAN
...
🎉 Ingestion complete — 82 total chunks stored
```

---

### Step 6 — Run the Project

```bash
# Start both client and server from the root:
npm run dev

# Or start them separately:
npm start --prefix server   # backend on http://localhost:5000
npm start --prefix client   # frontend on http://localhost:3000
```

---

## Troubleshooting

### `querySrv ECONNREFUSED` on Windows
On some Windows machines, Node.js may fail to resolve MongoDB's SRV DNS records even when the cluster is reachable. This is a known issue with local DNS resolver configurations.

**Fix (already applied in this project):** The server and ingest script both include a DNS override at startup:
```js
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
```
This forces Node.js to use Google's Public DNS for resolution.

### `EADDRINUSE: port 5000`
Another server process is already using port 5000. Find and kill it:
```powershell
netstat -ano | findstr :5000
taskkill /F /PID <PID>
```

---

## How RAG Works (step by step)

When a farmer submits their profile:

```
1. profileToQuery()
   { age: 45, landSize: 1.2, income: 90000, landOwner: true }
   → "Eligibility criteria for PM-KISAN. Farmer age 45 years.
      Owns 1.2 hectares. Annual income ₹90,000..."

2. embedQuery() — local model, no API call needed
   → [0.023, -0.041, 0.187, ...] (384-dimensional vector)

3. MongoDB $vectorSearch
   → Top 6 chunks from the PM-KISAN PDF most similar to the query
   e.g. "Section 4: Eligible farmer families shall be those who
         are land holding cultivators with a combined holding
         of up to 2 hectares..."

4. Gemini 2.5 Flash receives:
   - The 6 retrieved PDF chunks as context
   - The farmer profile
   - Instructions to reason about eligibility from the documents

5. Gemini returns structured JSON:
   {
     "eligible": true,
     "confidence": "high",
     "proof": [{ "label": "Land ≤ 2 ha", "msg": "...", "citation": "Section 4.1" }],
     "reasons": [],
     "aiExplanation": "Based on the official PM-KISAN guidelines...",
     "retrievedSnippet": "land holding cultivators with a combined holding of up to 2 hectares"
   }
```

---

## API Reference

### `POST /api/eligibility`
```json
// Request
{ "profile": { "age": 45, "landSize": 1.2, "landOwner": true, "income": 90000 } }

// Response
{
  "results": [
    {
      "scheme": { "id": "pmkisan", "name": "PM-KISAN", ... },
      "eligible": true,
      "confidence": "high",
      "proof": [{ "label": "Land Ownership", "msg": "...", "citation": "Sec 4.1" }],
      "reasons": [],
      "aiExplanation": "You are eligible for PM-KISAN...",
      "retrievedSnippet": "...",
      "chunksUsed": 6,
      "topChunkScore": 0.92
    }
  ]
}
```

### `GET /api/schemes`
Returns all scheme metadata from MongoDB.

### `POST /api/schemes/upload`
Upload a new PDF scheme (multipart/form-data).
Triggers automatic ingestion.

### `GET /api/health`
Returns `{ "status": "ok", "timestamp": "..." }`.

---

## Adding a New Scheme

1. Get the official PDF and put it in `server/pdfs/newscheme.pdf`
2. Add an entry to `SCHEME_METADATA` in `server/rag/ingest.js`
3. Add matching UI definition to `SCHEMES` in `client/src/data/schemes.js`
4. Run `npm run ingest` — done.

Or use the upload API to trigger ingestion via HTTP:
```bash
curl -X POST http://localhost:5000/api/schemes/upload \
  -F "file=@newscheme.pdf" \
  -F "id=newscheme" \
  -F "name=New Scheme" \
  -F "fullName=Full Scheme Name" \
  -F "benefit=₹X per year" \
  -F "ministry=Ministry Name"
```

---

## Tech Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Frontend     | React 18, CSS Custom Properties               |
| Voice        | Web Speech API                                |
| Backend      | Node.js 24, Express 4                         |
| Embeddings   | Xenova/all-MiniLM-L6-v2 (local, 384-dim)      |
| LLM          | Google Gemini 2.5 Flash                       |
| Vector DB    | MongoDB Atlas Vector Search                   |
| PDF Parsing  | pdf-parse                                     |
