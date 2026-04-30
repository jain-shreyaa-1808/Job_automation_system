import clsx from "clsx";
import {
  Bot,
  BriefcaseBusiness,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Sparkles,
} from "lucide-react";
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

  return (
    <div className="min-h-screen px-4 py-5 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="panel h-fit overflow-hidden bg-ink text-white">
          <div className="mb-8 rounded-[24px] bg-white/10 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-ember/90 p-3 text-white">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-xl">JobPilot AI</p>
                <p className="text-sm text-white/70">
                  Autonomous search and outreach
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-white/80">
              Early-career workflow for discovery, resume tailoring, recruiter
              tracking, and controlled auto-apply.
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
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

          <div className="mt-6 border-t border-white/10 pt-4">
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
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
