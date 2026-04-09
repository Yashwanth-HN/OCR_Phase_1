# Kannada OCR (CRNN) - Full Stack Project

This project performs Kannada OCR from uploaded images using a CRNN model.

## Project Structure

- `frontend/` - React + TypeScript + Vite UI
- `backend/` - FastAPI inference server (PyTorch)
- `other/notebooks/` - training notebook and notes

## How It Works

1. User uploads an image in the frontend.
2. Frontend sends a `multipart/form-data` request to backend endpoint `POST /ocr/upload`.
3. Backend preprocesses image to grayscale `32x256`, runs CRNN model inference, and decodes with CTC.
4. Backend returns JSON with recognized text and confidence score.
5. Frontend shows OCR text + confidence percentage.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind
- Backend: FastAPI, Uvicorn, PyTorch, Pillow, NumPy
- Model: CRNN (CNN + BiLSTM + CTC decode)

## Prerequisites

- Node.js 18+
- Python 3.11+

## Required Model Files

Put these files in `backend/models/`:

- `crnn_base.pth` (trained model weights)
- `charset.txt` (one character per line, decode mapping)

Note: model binary files are ignored by `.gitignore` and should be added locally.

## Run Locally

### 1) Start backend

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --app-dir "C:\Users\QC\OneDrive\Desktop\ocr_project\OCR\backend" --host 127.0.0.1 --port 8000
```

Health check:

```powershell
curl http://127.0.0.1:8000/health
```

### 2) Start frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:8080` or `http://localhost:5173`).

## API

### `GET /health`

Returns:

```json
{ "status": "ok" }
```

### `POST /ocr/upload`

- Content-Type: `multipart/form-data`
- Field name: `file`

Returns:

```json
{ "text": "...", "confidence": 0.0 }
```

## Training Notebook

Notebook used for model training:

- `other/notebooks/new_kannada_ocr.ipynb`


