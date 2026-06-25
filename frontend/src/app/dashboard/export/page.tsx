"use client";

import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Database, History } from "lucide-react";

const exports = [
  {
    title: "Raw Dataset",
    description: "Export the original crawled dataset with all articles including date, title, URL, and category.",
    icon: Database,
    color: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/25",
    getUrl: () => api.exportRaw(),
  },
  {
    title: "Preprocessed Dataset",
    description: "Export the preprocessed dataset with cleaned titles, tokenization, and word counts.",
    icon: FileSpreadsheet,
    color: "from-violet-500 to-violet-600",
    shadow: "shadow-violet-500/25",
    getUrl: () => api.exportPreprocessed(),
  },
  {
    title: "Prediction History",
    description: "Export all prediction records including input text, predicted labels, and confidence scores.",
    icon: History,
    color: "from-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-500/25",
    getUrl: () => api.exportPredictions(),
  },
];

export default function ExportPage() {
  const handleExport = (title: string, getUrl: () => string) => {
    const url = getUrl();
    window.open(url, "_blank");
    toast.success(`${title} export started`);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold gradient-text">Export Data</h2>
        <p className="text-muted-foreground mt-1">Download datasets and prediction history as CSV files</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exports.map((exp, i) => (
          <motion.div
            key={exp.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-6 flex flex-col"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${exp.color} flex items-center justify-center mb-4 shadow-lg ${exp.shadow}`}>
              <exp.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{exp.title}</h3>
            <p className="text-sm text-muted-foreground mb-6 flex-1">{exp.description}</p>
            <button
              onClick={() => handleExport(exp.title, exp.getUrl)}
              className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${exp.color} text-white font-semibold shadow-lg ${exp.shadow} hover:opacity-90 transition-all flex items-center justify-center gap-2`}
            >
              <Download className="w-5 h-5" />
              Download CSV
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
