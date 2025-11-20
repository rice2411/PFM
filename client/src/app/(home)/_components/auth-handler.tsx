"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AuthService } from "@/services/auth.service";

export function AuthHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthSuccess = async () => {

      if (true) {
        const accessToken = AuthService.getAccessToken();

        if (accessToken) {
          try {
            console.log("🔑 Access Token:", accessToken);
            console.log("🔄 Refresh Token:", AuthService.getRefreshToken());
            console.log("📡 Đang lấy thông tin user từ backend...");

            const user = await AuthService.getUser(accessToken);

            // Console log thông tin user chi tiết
            console.log("✅ Đăng nhập thành công!");
            console.log("👤 Thông tin user hiện tại:");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("User ID:", user?.id);
            console.log("Email:", user?.email);
            console.log(
              "Name:",
              user?.user_metadata?.full_name ||
                user?.user_metadata?.name ||
                "N/A",
            );
            console.log(
              "Avatar:",
              user?.user_metadata?.avatar_url ||
                user?.user_metadata?.picture ||
                "N/A",
            );
            console.log("Provider:", user?.app_metadata?.provider || "N/A");
            console.log(
              "Created At:",
              user?.created_at
                ? new Date(user.created_at).toLocaleString()
                : "N/A",
            );
            console.log(
              "Last Sign In:",
              user?.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString()
                : "N/A",
            );
            console.log(
              "Email Verified:",
              user?.email_confirmed_at ? "✅ Đã xác thực" : "❌ Chưa xác thực",
            );
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(
              "📦 Full User Object:",
              JSON.stringify(user, null, 2),
            );

            // Lưu user vào localStorage
            const refreshToken = AuthService.getRefreshToken();
            if (refreshToken) {
              AuthService.saveAuthData(accessToken, refreshToken, user);
            }
          } catch (userError) {
            console.error("❌ Không thể lấy thông tin user:", userError);
            console.error("Error details:", userError);
          }
        }
      }
    };

    handleAuthSuccess();
  }, []);

  return null; // Component này không render gì
}

