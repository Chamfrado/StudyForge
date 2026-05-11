"use client";

import { LogOut, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { logout } from "@/lib/auth";
import type { User } from "@/lib/types";

type TopbarProps = {
  user: User | null;
};

export function Topbar({ user }: TopbarProps) {
  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SF";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <h1 className="text-lg font-semibold text-slate-950">
              {user?.full_name || "Student"}
            </h1>
          </div>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
            <Search className="h-4 w-4" />
            <span>Search coming soon...</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">
              {user?.full_name || "User"}
            </p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
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