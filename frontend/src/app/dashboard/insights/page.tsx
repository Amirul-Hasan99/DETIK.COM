"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Sparkles, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const typeConfig: Record<string, { icon: any; border: string; bg: string }> = {
  info: { icon: Info, border: "border-blue-500/20", bg: "bg-blue-500/5" },
  success: { icon: CheckCircle2, border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
  warning: { icon: AlertTriangle, border: "border-amber-500/20", bg: "bg-amber-500/5" },
  error: { icon: XCircle, border: "border-red-500/20", bg: "bg-red-500/5" },
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInsights()
      .then((data) => setInsights(data.insights || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 h-24"><div className="skeleton-shimmer h-full w-full" /></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold gradient-text">Automatic Insights</h2>
        <p className="text-muted-foreground mt-1">AI-generated insights from your data and model performance</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => {
          const config = typeConfig[insight.type] || typeConfig.info;
          const Icon = config.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card rounded-2xl p-5 border ${config.border} ${config.bg}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icon}</span>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {insights.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Insights Yet</h3>
          <p className="text-muted-foreground">Import data and train models to generate insights.</p>
        </div>
      )}
    </div>
  );
}
