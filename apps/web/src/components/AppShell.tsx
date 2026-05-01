import clsx from "clsx";
import {
  Bot,
  BriefcaseBusiness,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Job Listings", icon: BriefcaseBusiness },
  { to: "/resume", label: "Resume Upload", icon: FileSpreadsheet },
  { to: "/optimizer", label: "Resume Optimizer", icon: Sparkles },
  { to: "/outreach", label: "HR Outreach", icon: Mail },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebar = (
    <>
      <div className="mb-8 rounded-[24px] bg-white/10 p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-2xl bg-ember/90 p-3 text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-xl">JobPilot AI</p>
            <p className="text-sm text-white/70">
              Autonomous search &amp; outreach
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-white text-ink"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <p className="mb-2 truncate px-4 text-xs text-white/50">
          {user?.email}
        </p>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen px-4 py-5 md:px-8">
      {/* Mobile header */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-ink p-2 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold text-ink">
            JobPilot AI
          </span>
        </div>
        <button
          type="button"
          className="rounded-xl border border-ink/10 bg-white p-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-4 right-4 top-20 z-50 flex max-h-[80vh] flex-col overflow-y-auto rounded-[28px] bg-ink p-6 text-white shadow-panel">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <aside className="panel sticky top-5 hidden h-fit max-h-[calc(100vh-40px)] flex-col overflow-hidden bg-ink text-white lg:flex">
          {sidebar}
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
