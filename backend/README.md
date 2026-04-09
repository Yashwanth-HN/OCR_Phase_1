# Backend (CRNN OCR)

This backend exposes OCR APIs for your frontend and is designed to accept a CRNN model trained in Google Colab.

## 1) Export artifacts from Colab

From your Colab notebook, export:
- Model weights: `crnn_best.pt`
- Character set file: `charset.txt` (one character per line, same order used in decode)

Example in Colab:

```python
import torch

torch.save(model.state_dict(), "crnn_best.pt")
with open("charset.txt", "w", encoding="utf-8") as f:
    for ch in idx_to_char:
        f.write(ch + "\n")
```

Download both files and place them here:
- `backend/models/crnn_best.pt`
- `backend/models/charset.txt`

## 2) Install and run backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:
- `GET http://localhost:8000/health`

OCR endpoint:
- `POST http://localhost:8000/ocr/upload` with form-data key `file`

## 3) Add your actual CRNN inference

Update [app/inference.py](app/inference.py):
- Load model architecture + `state_dict`
- Apply the same preprocessing you used in training
- Run forward pass
- Apply CTC decode
- Return `(text, confidence)`

Current implementation has a placeholder response so API wiring can be tested first.

## 4) Connect frontend

Set frontend API base URL in `.env` inside frontend:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Then call `POST /ocr/upload` from the upload flow.

## Notes
- If your saved model is full model object (`torch.save(model, ...)`), adapt loading accordingly.
- If you trained with custom vocab/token rules, keep the same mapping in `charset.txt` and decoder.
