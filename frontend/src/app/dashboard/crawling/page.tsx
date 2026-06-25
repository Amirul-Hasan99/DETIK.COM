"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Globe, Play, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const CATEGORIES = ["News", "Finance", "Sport", "Oto", "Health", "Travel"];

export default function CrawlingPage() {
  const [config, setConfig] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map((c) => [c, 200]))
  );
  const [crawling, setCrawling] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  const handleImportCSV = async () => {
    setImporting(true);
    setResult(null);
    try {
      const data = await api.importCSV();
      setResult(data);
      if (data.success) {
        toast.success(`Successfully imported ${data.imported} articles!`);
      } else {
        toast.error("Import failed: " + data.errors.join(", "));
      }
    } catch (error: any) {
      toast.error(error.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleStartCrawl = async () => {
    setCrawling(true);
    setProgress([]);
    setResult(null);
    toast.info("Crawling started...");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${API_BASE}/crawl/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: config }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              setProgress((prev) => [...prev.slice(-50), data]);

              if (data.type === "final") {
                setResult({ total: data.total_articles });
                toast.success(`Crawling complete! ${data.total_articles} articles collected.`);
              }
            } catch {}
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Crawling failed");
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold gradient-text">Dynamic Crawling</h2>
        <p className="text-muted-foreground mt-1">
          Configure and crawl news articles from detik.com or import from existing CSV
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import CSV Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold">Import from CSV</h3>
              <p className="text-xs text-muted-foreground">Load existing dataset files</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Import data from <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">dataset_detik_multiclass_update_sekali.csv</code> and its preprocessed version.
          </p>
          <button
            onClick={handleImportCSV}
            disabled={importing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {importing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {importing ? "Importing..." : "Import CSV Dataset"}
          </button>
        </motion.div>

        {/* Crawl Config Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Live Crawling</h3>
              <p className="text-xs text-muted-foreground">Crawl from detik.com</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-2">
                <label htmlFor={`input-${cat}`} className="text-sm font-medium min-w-[60px]">{cat}</label>
                <input
                  id={`input-${cat}`}
                  type="number"
                  min={0}
                  max={1000}
                  value={config[cat]}
                  onChange={(e) =>
                    setConfig({ ...config, [cat]: parseInt(e.target.value) || 0 })
                  }
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-center focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleStartCrawl}
            disabled={crawling}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {crawling ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            {crawling ? "Crawling..." : "Start Crawling"}
          </button>
        </motion.div>
      </div>

      {/* Progress / Results */}
      {(progress.length > 0 || result) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">
            {crawling ? "Crawling Progress" : "Result"}
          </h3>

          {result && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {result.success !== false ? "Import Successful!" : "Completed"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.imported
                    ? `${result.imported} articles imported. Total: ${result.total_count}`
                    : `${result.total} articles collected`}
                </p>
              </div>
            </div>
          )}

          {progress.length > 0 && (
            <div className="max-h-60 overflow-y-auto scrollbar-thin space-y-1 font-mono text-xs">
              {progress.slice(-20).map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    p.type === "error"
                      ? "bg-red-500/10 text-red-500"
                      : p.type === "completed"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-secondary/50"
                  }`}
                >
                  {p.type === "article" && (
                    <>
                      <span className="text-blue-500">[{p.progress?.category}]</span>
                      <span className="text-muted-foreground">
                        {p.progress?.current}/{p.progress?.total}
                      </span>
                      <span className="truncate">{p.data?.judul_berita}</span>
                    </>
                  )}
                  {p.type === "status" && <span>{p.message}</span>}
                  {p.type === "error" && (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>{p.message}</span>
                    </>
                  )}
                  {p.type === "completed" && (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{p.category}: {p.total_collected} articles</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
