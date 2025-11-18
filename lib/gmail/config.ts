/**
 * Cấu hình Gmail API
 * 
 * HƯỚNG DẪN SETUP:
 * 
 * 1. Tạo Google Cloud Project:
 *    - Truy cập: https://console.cloud.google.com/
 *    - Tạo project mới hoặc chọn project có sẵn
 * 
 * 2. Bật Gmail API:
 *    - Vào "APIs & Services" > "Library"
 *    - Tìm "Gmail API" và bật nó
 * 
 * 3. Tạo OAuth 2.0 Credentials:
 *    - Vào "APIs & Services" > "Credentials"
 *    - Click "Create Credentials" > "OAuth client ID"
 *    - Chọn "Web application"
 *    - Thêm Authorized redirect URIs:
 *      - http://localhost:3000/api/gmail/callback (cho development)
 *      - https://yourdomain.com/api/gmail/callback (cho production)
 *    - Lưu Client ID và Client Secret
 * 
 * 4. Tạo file .env.local với các biến sau:
 *    GMAIL_CLIENT_ID=your_client_id_here
 *    GMAIL_CLIENT_SECRET=your_client_secret_here
 *    GMAIL_REDIRECT_URI=http://localhost:3000/api/gmail/callback
 *    NEXTAUTH_URL=http://localhost:3000
 *    NEXTAUTH_SECRET=your_random_secret_here
 * 
 * 5. Tạo thư mục credentials và đặt file credentials.json (nếu dùng service account)
 *    Hoặc sử dụng OAuth 2.0 flow như trong code này
 */

export const gmailConfig = {
  clientId: process.env.GMAIL_CLIENT_ID || "",
  clientSecret: process.env.GMAIL_CLIENT_SECRET || "",
  redirectUri: process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/api/gmail/callback",
  scopes: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
  ],
};

export const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: gmailConfig.clientId,
    redirect_uri: gmailConfig.redirectUri,
    response_type: "code",
    scope: gmailConfig.scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

