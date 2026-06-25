"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Wand2, Play, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function PreprocessingPage() {
  const [comparison, setComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [previewText, setPreviewText] = useState("");
  const [previewResult, setPreviewResult] = useState<any>(null);

  useEffect(() => {
    api.getPreprocessingComparison(15)
      .then((data) => setComparison(data.comparison || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRunPreprocessing = async () => {
    setProcessing(true);
    try {
      const data = await api.runPreprocessing();
      setResult(data);
      toast.success(`Preprocessed ${data.processed} articles!`);
      // Refresh comparison
      const comp = await api.getPreprocessingComparison(15);
      setComparison(comp.comparison || []);
    } catch (error: any) {
      toast.error(error.message || "Preprocessing failed");
    } finally {
      setProcessing(false);
    }
  };

  const handlePreview = async () => {
    if (!previewText.trim()) return;
    try {
      const data = await api.previewPreprocessing(previewText);
      setPreviewResult(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const pipelineSteps = [
    "Lowercase", "Remove URLs", "Remove Punctuation", "Remove Numbers",
    "Clean Whitespace", "Stopword Removal", "Stemming", "Tokenization"
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold gradient-text">Automatic Preprocessing</h2>
        <p className="text-muted-foreground mt-1">NLP preprocessing pipeline with Sastrawi for Indonesian text</p>
      </motion.div>

      {/* Pipeline Steps */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Pipeline Steps</h3>
        <div className="flex flex-wrap items-center gap-2">
          {pipelineSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{step}</span>
              {i < pipelineSteps.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <button onClick={handleRunPreprocessing} disabled={processing} className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 flex items-center gap-2">
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          {processing ? "Processing..." : "Run Preprocessing"}
        </button>

        {result && (
          <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Successfully preprocessed {result.processed} articles.
            </p>
          </div>
        )}
      </motion.div>

      {/* Preview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Preview Preprocessing</h3>
        <div className="flex gap-3">
          <input
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Enter a news title to preview preprocessing..."
            className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
          />
          <button onClick={handlePreview} className="px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Preview
          </button>
        </div>

        {previewResult && (
          <div className="mt-4 space-y-2">
            {previewResult.steps?.map((step: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                <span className="shrink-0 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">{step.step}</span>
                <p className="text-sm break-all">{step.result || <span className="text-muted-foreground italic">empty</span>}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Comparison Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="font-semibold">Before / After Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Original</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Preprocessed</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Words</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="px-4 py-3"><div className="skeleton-shimmer h-4 w-8" /></td>
                    <td className="px-4 py-3"><div className="skeleton-shimmer h-4 w-48" /></td>
                    <td className="px-4 py-3"><div className="skeleton-shimmer h-4 w-40" /></td>
                    <td className="px-4 py-3"><div className="skeleton-shimmer h-4 w-8" /></td>
                  </tr>
                ))
              ) : comparison.length > 0 ? (
                comparison.map((item: any) => (
                  <tr key={item.id} className="border-b border-border/30 hover:bg-secondary/30">
                    <td className="px-4 py-3 text-muted-foreground">{item.id}</td>
                    <td className="px-4 py-3 max-w-[300px] truncate">{item.original}</td>
                    <td className="px-4 py-3 max-w-[300px] truncate text-primary">{item.preprocessed}</td>
                    <td className="px-4 py-3 text-center">{item.word_count}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No preprocessed data. Run preprocessing first.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
