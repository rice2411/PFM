"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.services";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Đang xử lý đăng nhập...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash.substring(1); 
        const params = new URLSearchParams(hash);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const error = params.get("error");
        const errorDescription = params.get("error_description");

        if (error) {
          setStatus("error");
          setMessage(
            errorDescription || error || "Đăng nhập thất bại. Vui lòng thử lại.",
          );
          setTimeout(() => {
            router.push("/auth/sign-in?error=" + encodeURIComponent(error));
          }, 2000);
          return;
        }

        if (accessToken && refreshToken) {
          try {
            const user = await AuthService.getUser(accessToken);
            AuthService.saveAuthData(accessToken, refreshToken, user);
          } catch (userError) {
            console.error("Không thể lấy thông tin user:", userError);
          }

          setStatus("success");
          setMessage("Đăng nhập thành công! Đang chuyển hướng...");

          window.history.replaceState(null, "", window.location.pathname);

          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          setStatus("error");
          setMessage("Không nhận được token. Vui lòng thử lại.");
          setTimeout(() => {
            router.push("/auth/sign-in?error=no_token");
          }, 2000);
        }
      } catch (error) {
        console.error("Error handling callback:", error);
        setStatus("error");
        setMessage("Có lỗi xảy ra. Vui lòng thử lại.");
        setTimeout(() => {
          router.push("/auth/sign-in?error=callback_failed");
        }, 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === "loading" && (
          <div className="mb-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        )}
        {status === "success" && (
          <div className="mb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}
        {status === "error" && (
          <div className="mb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        )}
        <div className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          {message}
        </div>
        {status === "loading" && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Vui lòng đợi trong giây lát
          </div>
        )}
      </div>
    </div>
  );
}