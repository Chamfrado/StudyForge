"use client";

import { LogOut, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { logout } from "@/lib/auth";
import type { User } from "@/lib/types";

type TopbarProps = {
  user: User | null;
  onMenuClick: () => void;
};

export function Topbar({ user, onMenuClick }: TopbarProps) {
  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SF";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-700">Welcome back</p>
            <h1 className="truncate text-lg font-semibold text-slate-950">
              {user?.full_name || "Student"}
            </h1>
          </div>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
            <Search className="h-4 w-4" />
            <span>Search coming soon...</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-950">
              {user?.full_name || "User"}
            </p>
            <p className="text-xs font-medium text-slate-600">{user?.email}</p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {initials}
          </div>

          <Button variant="ghost" onClick={logout} className="hidden sm:flex">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}