"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function GmailCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      // Nếu có lỗi, redirect về trang chủ với thông báo lỗi
      router.push(`/?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token) {
      // Lưu access token vào localStorage
      localStorage.setItem("gmail_access_token", token);
      // Redirect về trang chủ với thông báo thành công
      router.push("/?gmail_connected=true");
    } else {
      // Nếu không có token, redirect về trang chủ với thông báo lỗi
      router.push("/?error=no_token");
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Đang xử lý kết nối Gmail...
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Vui lòng đợi trong giây lát
        </div>
      </div>
    </div>
  );
}

