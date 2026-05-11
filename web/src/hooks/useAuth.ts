"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getUser, isAuthenticated, logout } from "@/lib/auth";
import type { User } from "@/lib/types";

type UseAuthOptions = {
  redirectIfUnauthenticated?: boolean;
};

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectIfUnauthenticated = true } = options;

  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const authenticated = isAuthenticated();

    if (!authenticated) {
      setUser(null);
      setIsCheckingAuth(false);

      if (redirectIfUnauthenticated) {
        router.replace("/login");
      }

      return;
    }

    setUser(getUser());
    setIsCheckingAuth(false);
  }, [redirectIfUnauthenticated, router]);

  return {
    user,
    isCheckingAuth,
    isAuthenticated: Boolean(user),
    logout,
  };
}