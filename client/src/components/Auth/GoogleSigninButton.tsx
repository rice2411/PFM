"use client";

import { GoogleIcon } from "@/assets/icons";
import { AuthService } from "@/services/auth.services";
import { useState } from "react";

export default function GoogleSigninButton({ text }: { text: string }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Lấy URL đăng nhập Google từ backend
      const authUrl = await AuthService.getGoogleAuthUrl();
      
      // Redirect đến URL đăng nhập
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error initiating Google sign in:", error);
      alert("Không thể đăng nhập với Google. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray-2 p-[15px] font-medium hover:bg-opacity-50 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <GoogleIcon />
      {loading ? "Đang xử lý..." : `${text} with Google`}
    </button>
  );
}
