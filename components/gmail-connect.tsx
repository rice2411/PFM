"use client";

import { useState } from "react";

export default function GmailConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Lấy authorization URL
      const response = await fetch("/api/gmail/auth");
      const data = await response.json();

      if (data.authUrl) {
        // Redirect đến Google OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error("Không thể lấy authorization URL");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setIsConnecting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Kết nối Gmail
      </h3>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Kết nối Gmail để tự động lấy thông tin giao dịch từ email ngân hàng
      </p>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
      >
        {isConnecting ? "Đang kết nối..." : "Kết nối Gmail"}
      </button>
    </div>
  );
}

