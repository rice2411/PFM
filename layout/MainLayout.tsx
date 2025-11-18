"use client";

import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isChecking } = useAuth(true);

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

  return (
    <>
      <Navbar />
      <div className="flex w-full flex-col gap-4 px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        {children}
      </div>
    </>
  );
}
