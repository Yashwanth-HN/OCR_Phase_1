# Integrate Colab Notebook into This Project

Notebook imported:
- `other/notebooks/new_kannada_ocr.ipynb`

## Goal
Use your trained CRNN from notebook training in `backend/app/inference.py`.

## Step 1: Add export cell in notebook
Open `new_kannada_ocr.ipynb` and add a final cell like this:

```python
import torch
from pathlib import Path

export_dir = Path('/content/ocr_export')
export_dir.mkdir(parents=True, exist_ok=True)

# Save state dict
torch.save(model.state_dict(), export_dir / 'crnn_best.pt')

# Save charset (one char per line)
with open(export_dir / 'charset.txt', 'w', encoding='utf-8') as f:
    for ch in idx_to_char:
        f.write(ch + '\n')

print('Exported to', export_dir)
```

If your notebook does not use `idx_to_char`, export your equivalent mapping in model decode order.

## Step 2: Download artifacts from Colab
Download:
- `crnn_best.pt`
- `charset.txt`

## Step 3: Place artifacts in backend
Copy into:
- `backend/models/crnn_best.pt`
- `backend/models/charset.txt`

## Step 4: Implement real inference
Update `backend/app/inference.py`:
- Build CRNN architecture class (same as training)
- Load `state_dict`
- Apply same image preprocessing used in notebook
- Run model inference
- Apply CTC decode using `charset.txt`
- Return `(text, confidence)`

## Step 5: Run backend
```bash
cd backend
python -m venv .venv
# Windows
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Test endpoint:
- `POST http://localhost:8000/ocr/upload` with form field `file`
