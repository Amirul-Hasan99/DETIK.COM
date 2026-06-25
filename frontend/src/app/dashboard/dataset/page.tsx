"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Database, Search, Filter, Download, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export default function DatasetPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [label, setLabel] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getDataset({ page, page_size: pageSize, search, label });
      setData(result);
    } catch (error: any) {
      toast.error(error.message || "Failed to load dataset");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, label]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    api.getCategories().then((c) => setCategories(c.categories || [])).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleExport = () => {
    const url = api.exportRaw();
    window.open(url, "_blank");
    toast.success("Download started");
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold gradient-text">Dataset Management</h2>
        <p className="text-muted-foreground mt-1">Browse, search, and filter crawled news articles</p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
      >
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search news titles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <select
            aria-label="Filter by category"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm focus:border-primary outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
            ))}
          </select>

          <button onClick={handleExport} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </motion.div>

      {/* Stats Badge */}
      {data && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="w-4 h-4" />
          <span>{data.total.toLocaleString()} total articles</span>
          <span>•</span>
          <span>Page {data.page} of {data.total_pages}</span>
        </div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">URL</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="px-4 py-3"><div className="skeleton-shimmer h-4 w-8" /></td>
                    <td className="px-4 py-3"><div className="skeleton-shimmer h-4 w-24" /></td>
                    <td className="px-4 py-3"><div className="skeleton-shimmer h-4 w-64" /></td>
                    <td className="px-4 py-3"><div className="skeleton-shimmer h-4 w-16" /></td>
                    <td className="px-4 py-3"><div className="skeleton-shimmer h-4 w-8" /></td>
                  </tr>
                ))
              ) : data?.data?.length > 0 ? (
                data.data.map((article: any, i: number) => (
                  <tr key={article.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{article.id}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap max-w-[120px] truncate">{article.tanggal}</td>
                    <td className="px-4 py-3 max-w-[400px]">
                      <p className="truncate font-medium">{article.judul_berita}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        ({ News: "bg-blue-500/10 text-blue-500", Finance: "bg-emerald-500/10 text-emerald-500", Sport: "bg-amber-500/10 text-amber-500", Oto: "bg-violet-500/10 text-violet-500", Health: "bg-rose-500/10 text-rose-500", Travel: "bg-cyan-500/10 text-cyan-500" } as Record<string, string>)[article.label] || "bg-secondary text-secondary-foreground"
                      }`}>
                        {article.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {article.url && (
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No articles found. Import dataset or adjust filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Showing {(data.page - 1) * pageSize + 1}-{Math.min(data.page * pageSize, data.total)} of {data.total}
            </p>
            <div className="flex items-center gap-1">
              <button aria-label="Previous page" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
                const p = Math.max(1, Math.min(data.total_pages - 4, page - 2)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                    {p}
                  </button>
                );
              })}
              <button aria-label="Next page" onClick={() => setPage(Math.min(data.total_pages, page + 1))} disabled={page >= data.total_pages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
