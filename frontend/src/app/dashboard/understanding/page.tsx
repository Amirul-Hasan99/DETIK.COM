"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Layers, Hash, AlertTriangle, Type, BarChart2, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

export default function UnderstandingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDataUnderstanding()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-28"><div className="skeleton-shimmer h-full w-full" /></div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Rows", value: data?.total_rows?.toLocaleString() || "0", icon: Layers, color: "text-blue-500", bg: "kpi-gradient-1" },
    { label: "Duplicates", value: data?.duplicate_count?.toLocaleString() || "0", icon: Hash, color: "text-amber-500", bg: "kpi-gradient-4" },
    { label: "Null Values", value: data?.null_count?.toLocaleString() || "0", icon: AlertTriangle, color: "text-rose-500", bg: "kpi-gradient-5" },
    { label: "Avg Title Length", value: `${data?.avg_title_length || 0} chars`, icon: Type, color: "text-violet-500", bg: "kpi-gradient-3" },
  ];

  const categoryData = Object.entries(data?.category_distribution || {}).map(([name, value]) => ({ name, value }));
  const wordData = data?.top_frequent_words || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold gradient-text">Automatic Data Understanding</h2>
        <p className="text-muted-foreground mt-1">Computed statistics and data quality metrics</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`glass-card ${s.bg} rounded-2xl p-5`}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <s.icon className={`w-5 h-5 ${s.color} opacity-60`} />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-primary" /> Category Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {categoryData.map((_: any, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Frequent Words */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Top Frequent Words</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={wordData.slice(0, 15)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis dataKey="word" type="category" width={80} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
