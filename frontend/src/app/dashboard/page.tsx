"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import {
  Newspaper,
  Layers,
  Brain,
  Target,
  Database,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

const kpiConfig = [
  { key: "total_news", label: "Total News", icon: Newspaper, gradient: "kpi-gradient-1", color: "text-blue-500" },
  { key: "total_categories", label: "Categories", icon: Layers, gradient: "kpi-gradient-2", color: "text-emerald-500" },
  { key: "best_model", label: "Best Model", icon: Brain, gradient: "kpi-gradient-3", color: "text-violet-500" },
  { key: "best_accuracy", label: "Accuracy (%)", icon: Target, gradient: "kpi-gradient-4", color: "text-amber-500" },
  { key: "preprocessed_count", label: "Preprocessed", icon: Database, gradient: "kpi-gradient-5", color: "text-rose-500" },
];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getDashboard();
        setData(result);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-32">
              <div className="skeleton-shimmer h-4 w-20 mb-3" />
              <div className="skeleton-shimmer h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 h-80">
            <div className="skeleton-shimmer h-full w-full" />
          </div>
          <div className="glass-card rounded-2xl p-6 h-80">
            <div className="skeleton-shimmer h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  const kpi = data?.kpi || {};

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiConfig.map((config, i) => (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card ${config.gradient} rounded-2xl p-5 group hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {config.label}
              </p>
              <config.icon className={`w-5 h-5 ${config.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            </div>
            <p className="text-2xl font-bold">
              {config.key === "best_model"
                ? kpi[config.key] || "—"
                : typeof kpi[config.key] === "number"
                ? kpi[config.key].toLocaleString()
                : kpi[config.key] || "—"}
            </p>
            {config.key === "best_accuracy" && kpi[config.key] > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-500 font-medium">
                  {kpi[config.key] > 90 ? "Excellent" : kpi[config.key] > 80 ? "Good" : "Fair"}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          {data?.category_distribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.category_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.category_distribution.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No data available. Import dataset first.</p>
            </div>
          )}
        </motion.div>

        {/* Category Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Articles per Category</h3>
          {data?.category_distribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.category_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {data.category_distribution.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No data available. Import dataset first.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
            <div className={`w-3 h-3 rounded-full ${kpi.total_news > 0 ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
            <div>
              <p className="text-sm font-medium">Dataset</p>
              <p className="text-xs text-muted-foreground">
                {kpi.total_news > 0 ? `${kpi.total_news.toLocaleString()} articles loaded` : "No data imported"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
            <div className={`w-3 h-3 rounded-full ${kpi.preprocessed_count > 0 ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
            <div>
              <p className="text-sm font-medium">Preprocessing</p>
              <p className="text-xs text-muted-foreground">
                {kpi.preprocessed_count > 0 ? `${kpi.preprocessed_count.toLocaleString()} preprocessed` : "Not processed"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
            <div className={`w-3 h-3 rounded-full ${kpi.model_ready ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
            <div>
              <p className="text-sm font-medium">Model</p>
              <p className="text-xs text-muted-foreground">
                {kpi.model_ready ? "Ready for prediction" : "Not trained yet"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
