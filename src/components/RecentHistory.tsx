import { Clock, Search, ImageIcon, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface HistoryItem {
  id: string;
  type: "search" | "upload";
  query: string;
  timestamp: Date;
  thumbnail?: string;
}

interface RecentHistoryProps {
  items: HistoryItem[];
  onClear: () => void;
  onItemClick: (item: HistoryItem) => void;
}

const RecentHistory = ({ items, onClear, onItemClick }: RecentHistoryProps) => {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full max-w-2xl mx-auto mt-10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Recent History
          </h2>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onItemClick(item)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-secondary/60 border border-border hover:border-primary/20 transition-all shadow-sm hover:shadow-card text-left group"
            >
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                {item.type === "search" ? (
                  <Search className="h-4 w-4 text-primary" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate font-kannada">
                  {item.query}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {" · "}
                  {item.type === "search" ? "Text search" : "Image upload"}
                </p>
              </div>
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt=""
                  className="h-10 w-10 rounded-md object-cover border border-border"
                />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RecentHistory;
