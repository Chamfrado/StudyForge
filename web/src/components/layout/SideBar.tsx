"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Brain,
  FileText,
  Home,
  Layers3,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";

type SidebarProps = {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
};

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Subjects",
    href: "/dashboard/subjects",
    icon: BookOpen,
  },
  {
    label: "Materials",
    href: "/dashboard/materials",
    icon: FileText,
  },
  {
    label: "Flashcards",
    href: "/dashboard/flashcards",
    icon: Layers3,
  },
  {
    label: "Quizzes",
    href: "/dashboard/quizzes",
    icon: Brain,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="mb-8 flex items-center gap-3 px-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>

        <div>
          <p className="text-lg font-bold tracking-tight text-slate-950">
            StudyForge
          </p>
          <p className="text-xs font-medium text-slate-600">
            AI study assistant
          </p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => {
          onNavigate?.();
          logout();
        }}
        className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </>
  );
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-white px-4 py-6 lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <div
        onClick={onMobileClose}
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden",
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-80 max-w-[85vw] flex-col border-r border-slate-200 bg-white px-4 py-6 shadow-2xl transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 flex items-center justify-end">
          <button
            type="button"
            onClick={onMobileClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <SidebarContent onNavigate={onMobileClose} />
      </aside>
    </>
  );
}