"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MessageSquareText, Send, Loader2, Tag, Gauge, History, Sparkles } from "lucide-react";

const LABEL_COLORS: Record<string, string> = {
  News: "from-blue-500 to-blue-600",
  Finance: "from-emerald-500 to-emerald-600",
  Sport: "from-amber-500 to-amber-600",
  Oto: "from-violet-500 to-violet-600",
  Health: "from-rose-500 to-rose-600",
  Travel: "from-cyan-500 to-cyan-600",
};

export default function PredictionPage() {
  const [input, setInput] = useState("");
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.getPredictionHistory(20)
      .then((data) => setHistory(data.data || []))
      .catch(console.error);
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Please enter a news title");
      return;
    }

    setPredicting(true);
    try {
      const data = await api.predict(input);
      setResult(data);
      toast.success(`Predicted: ${data.predicted_label}`);
      // Refresh history
      const hist = await api.getPredictionHistory(20);
      setHistory(hist.data || []);
    } catch (error: any) {
      toast.error(error.message || "Prediction failed");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold gradient-text">News Category Prediction</h2>
        <p className="text-muted-foreground mt-1">Enter a news title to predict its category</p>
      </motion.div>

      {/* Input Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
        <form onSubmit={handlePredict} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">News Title</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Timnas Indonesia Menang Telak 5-0 Atas Singapura di Piala AFF"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            />
          </div>
          <button type="submit" disabled={predicting} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {predicting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {predicting ? "Predicting..." : "Predict Category"}
          </button>
        </form>
      </motion.div>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Prediction Result</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <Tag className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground mb-1">Predicted Category</p>
              <span className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${LABEL_COLORS[result.predicted_label] || "from-gray-500 to-gray-600"} text-white font-bold text-lg shadow-lg`}>
                {result.predicted_label}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <Gauge className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground mb-1">Confidence</p>
              <p className="text-2xl font-bold">
                {result.confidence !== null ? `${(result.confidence * 100).toFixed(1)}%` : "N/A"}
              </p>
              {result.confidence !== null && (
                <div className="mt-2 w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-1000" style={{ width: `${result.confidence * 100}%` }} />
                </div>
              )}
            </div>
            <div className="p-4 rounded-xl bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-2">Preprocessed Text</p>
              <p className="text-sm font-mono break-all">{result.preprocessed_text || "—"}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="font-semibold flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Prediction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Input</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Predicted</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Confidence</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Model</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map((p: any) => (
                <tr key={p.id} className="border-b border-border/30 hover:bg-secondary/30">
                  <td className="px-4 py-3 max-w-[300px] truncate">{p.input_text}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      { News: "bg-blue-500/10 text-blue-500", Finance: "bg-emerald-500/10 text-emerald-500", Sport: "bg-amber-500/10 text-amber-500", Oto: "bg-violet-500/10 text-violet-500", Health: "bg-rose-500/10 text-rose-500", Travel: "bg-cyan-500/10 text-cyan-500" }[p.predicted_label] || "bg-secondary text-foreground"
                    }`}>{p.predicted_label}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono">{p.confidence ? `${(p.confidence * 100).toFixed(1)}%` : "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.model_used || "—"}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No predictions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
