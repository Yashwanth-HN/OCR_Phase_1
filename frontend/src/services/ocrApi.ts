export interface OcrApiResponse {
  text: string;
  confidence: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function uploadOcrImage(file: File): Promise<OcrApiResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/ocr/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "OCR request failed";
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") {
        message = body.detail;
      }
    } catch {
      // Keep fallback message when response is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<OcrApiResponse>;
}
