from __future__ import annotations

import io
import os

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from app.inference import build_service_from_env
from app.schemas import HealthResponse, OcrResponse

app = FastAPI(title="Kannada OCR Backend", version="0.1.0")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:8080")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ocr_service = build_service_from_env()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/ocr/upload", response_model=OcrResponse)
async def upload_image(file: UploadFile = File(...)) -> OcrResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")

    raw = await file.read()
    try:
        image = Image.open(io.BytesIO(raw))
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="Invalid image file") from exc

    text, confidence = ocr_service.predict(image)
    return OcrResponse(text=text, confidence=confidence)
