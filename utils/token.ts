/**
 * Utility functions để quản lý Gmail tokens
 */

/**
 * Lấy access token từ localStorage, tự động refresh nếu cần
 */
export async function getValidAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const accessToken = localStorage.getItem("gmail_access_token");
  const refreshToken = localStorage.getItem("gmail_refresh_token");

  if (!refreshToken) {
    return null;
  }

  // Nếu có access token, thử sử dụng nó trước
  if (accessToken) {
    // Kiểm tra xem token có còn hợp lệ không bằng cách gọi API
    // Nếu lỗi 401, sẽ refresh token
    try {
      const testResponse = await fetch(
        `/api/gmail/emails?accessToken=${encodeURIComponent(accessToken)}&maxResults=1`
      );
      
      if (testResponse.ok) {
        return accessToken;
      }
    } catch (error) {
      // Nếu có lỗi, tiếp tục refresh token
    }
  }

  // Nếu không có access token hoặc token hết hạn, refresh
  try {
    const response = await fetch("/api/gmail/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;

    // Lưu access token mới
    localStorage.setItem("gmail_access_token", newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Nếu refresh thất bại, xóa tokens và yêu cầu đăng nhập lại
    localStorage.removeItem("gmail_access_token");
    localStorage.removeItem("gmail_refresh_token");
    return null;
  }
}

