"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Globe,
  Database,
  Search,
  Wand2,
  BarChart3,
  GraduationCap,
  ClipboardCheck,
  Sparkles,
  MessageSquareText,
  Download,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Newspaper,
  ChevronRight,
  User as UserIcon,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/crawling", label: "Crawling", icon: Globe },
  { href: "/dashboard/dataset", label: "Dataset", icon: Database },
  { href: "/dashboard/understanding", label: "Data Understanding", icon: Search },
  { href: "/dashboard/preprocessing", label: "Preprocessing", icon: Wand2 },
  { href: "/dashboard/eda", label: "EDA", icon: BarChart3 },
  { href: "/dashboard/training", label: "Training", icon: GraduationCap },
  { href: "/dashboard/evaluation", label: "Evaluation", icon: ClipboardCheck },
  { href: "/dashboard/prediction", label: "Prediction", icon: MessageSquareText },
  { href: "/dashboard/insights", label: "Insights", icon: Sparkles },
  { href: "/dashboard/export", label: "Export", icon: Download },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) {
      router.push("/");
      return;
    }
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setMounted(true);
  }, [router]);

  if (!mounted) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="min-h-screen page-gradient flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        className={`fixed top-0 left-0 h-screen z-50 glass-sidebar flex flex-col transition-all duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border/50 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h2 className="font-bold text-sm gradient-text">News Mining</h2>
                <p className="text-[10px] text-muted-foreground">Analytics System</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
                title={item.label}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border/50 p-3 space-y-2 shrink-0">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {sidebarOpen && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          {user && sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
                {user.role === "admin" ? (
                  <Shield className="w-4 h-4 text-white" />
                ) : (
                  <UserIcon className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{user.username}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[72px]"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 glass-card border-b border-border/50 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
              title="Open Menu"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-xl hover:bg-secondary transition-colors"
              title="Toggle Sidebar"
              aria-label="Toggle Sidebar"
            >
              <ChevronRight
                className={`w-5 h-5 transition-transform duration-300 ${
                  sidebarOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div>
              <h1 className="text-lg font-semibold">
                {navItems.find((n) => n.href === pathname)?.label || "Dashboard"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
