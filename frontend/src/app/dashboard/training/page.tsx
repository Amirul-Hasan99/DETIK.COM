"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { GraduationCap, Play, Loader2, Trophy, CheckCircle2, Settings } from "lucide-react";

export default function TrainingPage() {
  const [training, setTraining] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [config, setConfig] = useState({
    max_features: 10000,
    ngram_min: 1,
    ngram_max: 2,
    sublinear_tf: true,
    min_df: 2,
    max_df: 0.95,
  });

  const handleTrain = async () => {
    setTraining(true);
    setResults(null);
    try {
      const data = await api.runTraining(config);
      setResults(data);
      toast.success(`Training complete! Best model: ${data.best_model} (${(data.best_accuracy * 100).toFixed(2)}%)`);
    } catch (error: any) {
      toast.error(error.message || "Training failed");
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold gradient-text">Model Training</h2>
        <p className="text-muted-foreground mt-1">Train ML models with TF-IDF feature engineering</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TF-IDF Config */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> TF-IDF Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Max Features</label>
              <input type="number" aria-label="Max Features" value={config.max_features} onChange={(e) => setConfig({...config, max_features: parseInt(e.target.value) || 10000})} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">N-gram Range</label>
              <div className="flex gap-1 mt-1">
                <input type="number" aria-label="N-gram Minimum" value={config.ngram_min} onChange={(e) => setConfig({...config, ngram_min: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:border-primary outline-none" />
                <input type="number" aria-label="N-gram Maximum" value={config.ngram_max} onChange={(e) => setConfig({...config, ngram_max: parseInt(e.target.value) || 2})} className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:border-primary outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Min DF</label>
              <input type="number" aria-label="Min DF" value={config.min_df} onChange={(e) => setConfig({...config, min_df: parseInt(e.target.value) || 2})} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Max DF</label>
              <input type="number" aria-label="Max DF" step={0.01} value={config.max_df} onChange={(e) => setConfig({...config, max_df: parseFloat(e.target.value) || 0.95})} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:border-primary outline-none" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input type="checkbox" checked={config.sublinear_tf} onChange={(e) => setConfig({...config, sublinear_tf: e.target.checked})} id="sublinear" className="w-4 h-4 rounded border-border" />
            <label htmlFor="sublinear" className="text-sm">Sublinear TF</label>
          </div>
        </motion.div>

        {/* Models */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> Models to Train</h3>
          <div className="space-y-3">
            {["Multinomial Naive Bayes", "Logistic Regression", "Linear SVM", "Random Forest"].map((model, i) => (
              <div key={model} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500"][i]}`}>
                  {i + 1}
                </div>
                <span className="text-sm font-medium">{model}</span>
              </div>
            ))}
          </div>

          <button onClick={handleTrain} disabled={training} className="mt-4 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {training ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            {training ? "Training Models..." : "Start Training"}
          </button>
        </motion.div>
      </div>

      {/* Results */}
      {results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Best Model Badge */}
          <div className="flex items-center gap-3 p-4 rounded-2xl glass-card kpi-gradient-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Best Model</p>
              <p className="text-xl font-bold">{results.best_model}</p>
              <p className="text-sm text-emerald-500 font-medium">{(results.best_accuracy * 100).toFixed(2)}% Accuracy</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Model</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Accuracy</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Precision</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Recall</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">F1-Score</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((r: any) => (
                  <tr key={r.model_name} className={`border-b border-border/30 ${r.is_best ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-3 font-medium">{r.model_name}</td>
                    <td className="px-4 py-3 text-center font-mono">{(r.accuracy * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 text-center font-mono">{(r.precision * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 text-center font-mono">{(r.recall * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 text-center font-mono">{(r.f1_score * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 text-center">
                      {r.is_best ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                          <Trophy className="w-3 h-3" /> Best
                        </span>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
