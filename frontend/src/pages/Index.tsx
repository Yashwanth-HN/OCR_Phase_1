import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import ImageUpload from "@/components/ImageUpload";
import RecentHistory, { HistoryItem } from "@/components/RecentHistory";
import heroPattern from "@/assets/hero-pattern.jpg";
import { Languages } from "lucide-react";
import { uploadOcrImage } from "@/services/ocrApi";

const Index = () => {
  const [ocrText, setOcrText] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [ocrError, setOcrError] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: "1",
      type: "search",
      query: "ನಮಸ್ಕಾರ",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      type: "search",
      query: "ಕರ್ನಾಟಕ",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "3",
      type: "upload",
      query: "Scanned document — 12 words detected",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
    },
  ]);

  const addHistoryItem = useCallback((type: "search" | "upload", query: string, thumbnail?: string) => {
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      type,
      query,
      timestamp: new Date(),
      thumbnail,
    };
    setHistory((prev) => [item, ...prev].slice(0, 20));
  }, []);

  const handleSearch = (query: string) => {
    addHistoryItem("search", query);
  };

  const handleUpload = async (file: File, preview: string) => {
    setOcrLoading(true);
    setOcrError("");
    setOcrText("");
    setOcrConfidence(null);

    try {
      const result = await uploadOcrImage(file);
      const text = result.text || "(No text detected)";
      setOcrText(text);
      setOcrConfidence(result.confidence);
      addHistoryItem("upload", `${text} (${Math.round(result.confidence * 100)}%)`, preview);
    } catch (error) {
      const message = error instanceof Error ? error.message : "OCR failed";
      setOcrError(message);
      addHistoryItem("upload", `Upload failed — ${file.name}`, preview);
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroPattern}
            alt=""
            width={1920}
            height={600}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="p-2.5 rounded-xl gradient-hero">
              <Languages className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              ಕನ್ನಡ <span className="font-kannada">OCR</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center text-muted-foreground mb-8 max-w-md mx-auto"
          >
            Optical Character Recognition for Kannada script.
            Search words or upload images to extract text.
          </motion.p>

          {/* Search & Upload */}
          <SearchBar onSearch={handleSearch} />
          <ImageUpload
            onUpload={handleUpload}
            isProcessing={ocrLoading}
            resultText={ocrText}
            resultConfidence={ocrConfidence}
            errorText={ocrError}
          />
        </div>
      </div>

      {/* History */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <RecentHistory
          items={history}
          onClear={() => setHistory([])}
          onItemClick={(item) => console.log("Clicked:", item)}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Kannada OCR — Machine Learning Project
        </p>
      </footer>
    </div>
  );
};

export default Index;
