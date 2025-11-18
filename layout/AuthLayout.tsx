"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isChecking } = useAuth(false);

  // Hiển thị loading trong lúc kiểm tra
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Đang kiểm tra đăng nhập...
          </div>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
}
