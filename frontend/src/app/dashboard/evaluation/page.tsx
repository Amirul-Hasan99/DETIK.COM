"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { ClipboardCheck, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];
const LABELS = ["News", "Finance", "Sport", "Oto", "Health", "Travel"];

export default function EvaluationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEvaluation()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 h-80"><div className="skeleton-shimmer h-full w-full" /></div>
        ))}
      </div>
    );
  }

  const results = data?.results || [];
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ClipboardCheck className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Training Results</h3>
        <p className="text-muted-foreground">Train models first to see evaluation results.</p>
      </div>
    );
  }

  const chartData = results.map((r: any) => ({
    name: r.model_name.replace("Multinomial ", "").replace(" Regression", ""),
    Accuracy: +(r.accuracy * 100).toFixed(2),
    Precision: +(r.precision * 100).toFixed(2),
    Recall: +(r.recall * 100).toFixed(2),
    F1: +(r.f1_score * 100).toFixed(2),
  }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold gradient-text">Model Evaluation</h2>
        <p className="text-muted-foreground mt-1">Compare model performance with detailed metrics</p>
      </motion.div>

      {/* Metrics Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="font-semibold">Metrics Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Model</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Accuracy</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Precision</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Recall</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">F1-Score</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r: any) => (
                <tr key={r.model_name} className={`border-b border-border/30 ${r.is_best ? "bg-primary/5" : ""}`}>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    {r.model_name}
                    {r.is_best && <Trophy className="w-4 h-4 text-amber-500" />}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">{(r.accuracy * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-center font-mono">{(r.precision * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-center font-mono">{(r.recall * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-center font-mono">{(r.f1_score * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Bar Chart Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Legend />
              <Bar dataKey="Accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Line Chart Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Legend />
              <Line type="monotone" dataKey="Accuracy" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
              <Line type="monotone" dataKey="Precision" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} />
              <Line type="monotone" dataKey="Recall" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
              <Line type="monotone" dataKey="F1" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Confusion Matrices */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-lg font-semibold mb-4">Confusion Matrices</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {results.map((r: any) => (
            <div key={r.model_name} className="glass-card rounded-2xl p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                {r.model_name}
                {r.is_best && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs">Best</span>}
              </h4>
              {r.confusion_matrix && r.confusion_matrix.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="text-xs">
                    <thead>
                      <tr>
                        <th className="px-2 py-1"></th>
                        {LABELS.slice(0, r.confusion_matrix.length).map((l) => (
                          <th key={l} className="px-2 py-1 font-medium text-muted-foreground text-center">{l.slice(0, 3)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {r.confusion_matrix.map((row: number[], i: number) => (
                        <tr key={i}>
                          <td className="px-2 py-1 font-medium text-muted-foreground">{LABELS[i]?.slice(0, 3) || i}</td>
                          {row.map((val: number, j: number) => {
                            const maxVal = Math.max(...row);
                            const intensity = maxVal > 0 ? val / maxVal : 0;
                            return (
                              <td key={j} className="px-2 py-1 text-center font-mono" style={{
                                backgroundColor: i === j
                                  ? `rgba(16, 185, 129, ${0.1 + intensity * 0.5})`
                                  : val > 0 ? `rgba(239, 68, 68, ${0.05 + intensity * 0.3})` : "transparent"
                              }}>
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No confusion matrix available</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
