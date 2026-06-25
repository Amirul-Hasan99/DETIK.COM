"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { BarChart3, Cloud, AlignLeft, Hash } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

export default function EDAPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEDA()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-80"><div className="skeleton-shimmer h-full w-full" /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold gradient-text">Exploratory Data Analysis</h2>
        <p className="text-muted-foreground mt-1">Visual exploration of the news dataset</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Category Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data?.category_distribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" nameKey="name">
                {(data?.category_distribution || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Word Cloud (as bar chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Cloud className="w-5 h-5 text-primary" /> Word Cloud (Top Words)</h3>
          <div className="flex flex-wrap gap-2 h-[280px] overflow-y-auto content-start">
            {(data?.word_cloud_data || []).slice(0, 50).map((w: any, i: number) => {
              const size = Math.max(12, Math.min(32, 12 + (w.value / (data?.word_cloud_data?.[0]?.value || 1)) * 20));
              return (
                <span key={i} style={{ fontSize: `${size}px` }} className={`font-semibold px-2 py-1 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-default`}
                  title={`${w.text}: ${w.value}`}>
                  {w.text}
                </span>
              );
            })}
          </div>
        </motion.div>

        {/* Title Length Histogram */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlignLeft className="w-5 h-5 text-primary" /> Title Length Histogram</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data?.title_length_histogram || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Tokens */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Hash className="w-5 h-5 text-primary" /> Top Frequent Tokens</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={(data?.top_tokens || []).slice(0, 15)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis dataKey="token" type="category" width={80} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Dataset Preview */}
      {data?.dataset_preview?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h3 className="font-semibold">Dataset Preview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {Object.keys(data.dataset_preview[0]).map((key) => (
                    <th key={key} className="text-left px-4 py-3 font-semibold text-muted-foreground capitalize">{key.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.dataset_preview.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-secondary/30">
                    {Object.values(row).map((val: any, j: number) => (
                      <td key={j} className="px-4 py-3 max-w-[200px] truncate">{String(val)}</td>
                    ))}
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
