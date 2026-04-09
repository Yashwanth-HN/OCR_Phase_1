from __future__ import annotations

import os
import importlib
from pathlib import Path
from typing import Any, Tuple

import numpy as np
from PIL import Image


def _build_crnn_model(torch: Any, num_classes: int) -> Any:
    nn = torch.nn

    class CRNN(nn.Module):
        def __init__(self, n_classes: int) -> None:
            super().__init__()
            self.cnn = nn.Sequential(
                nn.Conv2d(1, 64, 3, 1, 1),
                nn.ReLU(),
                nn.MaxPool2d(2, 2),
                nn.Conv2d(64, 128, 3, 1, 1),
                nn.ReLU(),
                nn.MaxPool2d(2, 2),
            )
            self.rnn = nn.LSTM(
                input_size=128 * 8,
                hidden_size=256,
                bidirectional=True,
                batch_first=True,
            )
            self.fc = nn.Linear(256 * 2, n_classes)

        def forward(self, x: Any) -> Any:
            x = self.cnn(x)
            b, c, h, w = x.size()
            x = x.permute(0, 3, 1, 2)
            x = x.contiguous().view(b, w, c * h)
            x, _ = self.rnn(x)
            x = self.fc(x)
            return x

    return CRNN(num_classes)


class CRNNOCRService:
    """Loads CRNN artifacts and predicts text using notebook-compatible decode logic."""

    def __init__(self, model_path: str, charset_path: str) -> None:
        self.model_path = Path(model_path)
        self.charset_path = Path(charset_path)
        self.torch: Any | None = None
        self.model = None
        self.load_error = ""
        self.idx_to_char = self._load_charset()
        self._try_load_model()

    def _load_charset(self) -> dict[int, str]:
        if not self.charset_path.exists():
            return {}

        mapping: dict[int, str] = {}
        with self.charset_path.open("r", encoding="utf-8") as f:
            raw_lines = [line.rstrip("\n") for line in f if line.strip()]

        # Supported formats:
        # 1) one character per line (implies index starts from 1)
        # 2) idx\tchar
        # 3) char\tidx
        for i, raw in enumerate(raw_lines, start=1):
            if "\t" not in raw:
                mapping[i] = raw
                continue

            left, right = raw.split("\t", 1)
            if left.isdigit():
                mapping[int(left)] = right
            elif right.isdigit():
                mapping[int(right)] = left
            else:
                mapping[i] = raw

        return mapping

    def _try_load_model(self) -> None:
        if not self.model_path.exists():
            return
        if not self.idx_to_char:
            return

        try:
            self.torch = importlib.import_module("torch")
            num_classes = max(self.idx_to_char.keys()) + 1
            self.model = _build_crnn_model(self.torch, num_classes=num_classes)

            artifact = self.torch.load(self.model_path, map_location="cpu")
            if isinstance(artifact, dict) and "state_dict" in artifact:
                state_dict = artifact["state_dict"]
            else:
                state_dict = artifact

            self.model.load_state_dict(state_dict, strict=False)
            self.model.eval()
            self.load_error = ""
        except Exception as exc:
            self.load_error = f"Failed loading model artifact: {exc}"
            self.torch = None
            self.model = None

    def _preprocess(self, image: Image.Image) -> Any:
        assert self.torch is not None

        # Notebook preprocessing: grayscale -> resize(256,32) -> normalize -> shape(1,1,32,256)
        gray = image.convert("L").resize((256, 32), Image.Resampling.BILINEAR)
        arr = np.array(gray, dtype=np.float32) / 255.0
        tensor = self.torch.tensor(arr, dtype=self.torch.float32).unsqueeze(0).unsqueeze(0)
        return tensor

    def _decode_ctc(self, outputs: Any) -> tuple[str, float]:
        assert self.torch is not None

        probs = outputs.softmax(2)[0]  # (T, C)
        pred_ids = probs.argmax(1).cpu().numpy().tolist()

        decoded_chars: list[str] = []
        token_confidences: list[float] = []
        prev = 0

        for t, idx in enumerate(pred_ids):
            if idx == 0:
                prev = idx
                continue
            if idx == prev:
                continue

            ch = self.idx_to_char.get(idx, "")
            if ch:
                decoded_chars.append(ch)
                token_confidences.append(float(probs[t, idx].item()))
            prev = idx

        text = "".join(decoded_chars)
        confidence = float(sum(token_confidences) / len(token_confidences)) if token_confidences else 0.0
        return text, confidence

    def predict(self, image: Image.Image) -> Tuple[str, float]:
        if self.model is None or self.torch is None:
            if self.load_error:
                return (self.load_error, 0.0)
            return (
                "Model not loaded. Place model in backend/models and charset in backend/models/charset.txt",
                0.0,
            )
        if not self.idx_to_char:
            return ("Charset not loaded. Add backend/models/charset.txt", 0.0)

        with self.torch.no_grad():
            img_tensor = self._preprocess(image)
            outputs = self.model(img_tensor)
            text, confidence = self._decode_ctc(outputs)

        if not text:
            return ("", confidence)

        return text, confidence


def build_service_from_env() -> CRNNOCRService:
    backend_root = Path(__file__).resolve().parent.parent

    model_path = Path(os.getenv("CRNN_MODEL_PATH", "models/crnn_base.pth"))
    charset_path = Path(os.getenv("CRNN_CHARSET_PATH", "models/charset.txt"))

    if not model_path.is_absolute():
        model_path = backend_root / model_path
    if not charset_path.is_absolute():
        charset_path = backend_root / charset_path

    return CRNNOCRService(model_path=model_path, charset_path=charset_path)
