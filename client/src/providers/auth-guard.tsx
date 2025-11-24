"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";

type AuthGuardProps = {
  children: React.ReactNode;
};

/**
 * HOC để bảo vệ các route cần authentication
 * Kiểm tra authentication âm thầm ở background, không block UI
 * Chỉ redirect khi token thực sự không hợp lệ
 */
export function AuthGuard({ children }: AuthGuardProps) {
  // Hook kiểm tra authentication âm thầm, không block UI
  useAuthGuard();

  // Luôn render children, không hiển thị loading
  return <>{children}</>;
}

