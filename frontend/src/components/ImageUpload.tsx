import { Upload, ImageIcon, X } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  onUpload: (file: File, preview: string) => Promise<void>;
  isProcessing?: boolean;
  resultText?: string;
  resultConfidence?: number | null;
  errorText?: string;
}

const ImageUpload = ({ onUpload, isProcessing = false, resultText = "", resultConfidence = null, errorText = "" }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      await onUpload(file, url);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) await handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) await handleFile(e.target.files[0]);
  };

  const clearPreview = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-2xl mx-auto mt-6"
    >
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden border border-border shadow-card bg-card"
          >
            <img src={preview} alt="Uploaded" className="w-full max-h-64 object-contain p-4" />
            <button
              onClick={clearPreview}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground">
                {isProcessing
                  ? "Processing image..."
                  : resultText
                    ? `Predicted text: ${resultText}${resultConfidence !== null ? ` (Confidence: ${Math.round(resultConfidence * 100)}%)` : ""}`
                    : "Image uploaded. Click X to try another image."}
              </p>
              {!!errorText && (
                <p className="text-sm text-destructive mt-2">
                  {errorText}
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { void handleDrop(e); }}
            onClick={() => { if (!isProcessing) inputRef.current?.click(); }}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
              dragActive
                ? "border-primary bg-primary/5 shadow-elevated"
                : "border-border hover:border-primary/40 hover:bg-card"
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                {dragActive ? (
                  <ImageIcon className="h-8 w-8 text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {dragActive ? "Drop image here" : "Upload an image"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag & drop or click to browse — supports PNG, JPG, WEBP
                </p>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => { void handleChange(e); }}
              className="hidden"
              disabled={isProcessing}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImageUpload;
