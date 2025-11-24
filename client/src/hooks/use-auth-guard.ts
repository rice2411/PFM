"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthService } from "@/services/auth.services";

// Config mặc định
const DEFAULT_REDIRECT_TO = "/auth/sign-in";
const DEFAULT_SKIP_PATHS = ["/auth"];

/**
 * Hook để kiểm tra authentication âm thầm ở background
 * Không block UI, chỉ redirect khi token thực sự không hợp lệ
 */
export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // Bỏ qua kiểm tra cho các trang auth
    if (DEFAULT_SKIP_PATHS.some((path) => pathname.startsWith(path))) {
      return;
    }

    // Tránh kiểm tra nhiều lần cùng lúc
    if (isCheckingRef.current) {
      return;
    }

    const checkAuth = async () => {
      isCheckingRef.current = true;

      try {
        // Bước 1: Kiểm tra localStorage có data về user không
        const user = AuthService.getUserFromStorage();
        const accessToken = AuthService.getAccessToken();

        if (!user || !accessToken) {
          // Không có user hoặc token trong localStorage
          // Chỉ redirect nếu đang ở trang protected
          router.push(DEFAULT_REDIRECT_TO);
          return;
        }

        // Bước 2: Kiểm tra token có hợp lệ không (âm thầm ở background)
        try {
          await AuthService.getUser(accessToken);
          // Token hợp lệ, không làm gì cả
        } catch (error) {
          // Token không hợp lệ hoặc đã hết hạn
          console.warn("Token không hợp lệ, đang thử refresh...", error);

          // Thử refresh token nếu có refresh token
          const refreshToken = AuthService.getRefreshToken();
          if (refreshToken) {
            try {
              const newTokens = await AuthService.refreshToken(refreshToken);
              // Refresh thành công, lưu tokens mới
              const updatedUser = await AuthService.getUser(
                newTokens.access_token,
              );
              AuthService.saveAuthData(
                newTokens.access_token,
                newTokens.refresh_token,
                updatedUser,
              );
              // Token đã được refresh thành công, không cần redirect
            } catch (refreshError) {
              // Refresh token cũng không hợp lệ
              console.error("Refresh token không hợp lệ, đăng xuất...", refreshError);
              
              // Xóa tất cả data
              if (accessToken) {
                AuthService.signOut(accessToken).catch(() => {
                  // Nếu signOut API fail, vẫn xóa localStorage
                  localStorage.removeItem("auth_access_token");
                  localStorage.removeItem("auth_refresh_token");
                  localStorage.removeItem("auth_user");
                });
              } else {
                localStorage.removeItem("auth_access_token");
                localStorage.removeItem("auth_refresh_token");
                localStorage.removeItem("auth_user");
              }
              
              // Redirect về trang đăng nhập
              router.push(DEFAULT_REDIRECT_TO);
            }
          } else {
            // Không có refresh token, xóa data và redirect
            localStorage.removeItem("auth_access_token");
            localStorage.removeItem("auth_refresh_token");
            localStorage.removeItem("auth_user");
            router.push(DEFAULT_REDIRECT_TO);
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra authentication:", error);
        // Chỉ redirect nếu có lỗi nghiêm trọng
        const accessToken = AuthService.getAccessToken();
        if (!accessToken) {
          router.push(DEFAULT_REDIRECT_TO);
        }
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Delay nhỏ để không block render
    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      isCheckingRef.current = false;
    };
  }, [pathname, router]);
}

