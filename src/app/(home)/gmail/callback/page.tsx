"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function GmailCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (error) {
      // Nếu có lỗi, redirect về trang home với thông báo lỗi
      router.push(`/home?error=${encodeURIComponent(error)}`);
      return;
    }

    if (accessToken && refreshToken) {
      // Lưu cả access token và refresh token vào localStorage
      localStorage.setItem("gmail_access_token", accessToken);
      localStorage.setItem("gmail_refresh_token", refreshToken);
      // Redirect về trang home với thông báo thành công
      router.push("/home?gmail_connected=true");
    } else {
      // Nếu không có token, redirect về trang home với thông báo lỗi
      router.push("/home?error=no_token");
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

