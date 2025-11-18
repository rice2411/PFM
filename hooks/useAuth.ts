"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return;

      const refreshToken = localStorage.getItem("gmail_refresh_token");
      const hasToken = !!refreshToken;

      setIsAuthenticated(hasToken);

      if (requireAuth && !hasToken) {
        // Nếu yêu cầu đăng nhập nhưng chưa có token, redirect về login
        router.push("/login");
        return;
      }

      if (!requireAuth && hasToken) {
        // Nếu không yêu cầu đăng nhập nhưng đã có token, redirect về home
        router.push("/home");
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [router, requireAuth]);

  return {
    isChecking,
    isAuthenticated,
  };
}
