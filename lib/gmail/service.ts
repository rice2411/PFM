import { google } from "googleapis";
import { gmailConfig } from "./config";
import { BANK_NAMES } from "@/constant/bank";

/**
 * Service để lấy email từ Gmail API
 */

export interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  body: string;
}

/**
 * Lấy access token và refresh token từ authorization code
 */
export async function getTokensFromCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
}> {
  const oauth2Client = new google.auth.OAuth2(
    gmailConfig.clientId,
    gmailConfig.clientSecret,
    gmailConfig.redirectUri,
  );

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  return {
    accessToken: tokens.access_token || "",
    refreshToken: tokens.refresh_token || null,
  };
}

/**
 * Lấy access token mới từ refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    gmailConfig.clientId,
    gmailConfig.clientSecret,
    gmailConfig.redirectUri,
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error("Không thể refresh access token");
  }

  return credentials.access_token;
}

/**
 * Khởi tạo Gmail client với access token
 */
export function getGmailClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    gmailConfig.clientId,
    gmailConfig.clientSecret,
    gmailConfig.redirectUri,
  );

  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

/**
 * Lấy danh sách email với pagination
 */
export async function listEmails(
  accessToken: string,
  maxResults: number = 10,
  query?: string,
  pageToken?: string,
): Promise<{
  emails: EmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}> {
  const gmail = getGmailClient(accessToken);

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: query || "is:unread", // Mặc định lấy email chưa đọc
    pageToken: pageToken || undefined,
  });

  const messages = response.data.messages || [];
  const nextPageToken = response.data.nextPageToken;
  const resultSizeEstimate = response.data.resultSizeEstimate;

  // Lấy chi tiết từng email
  const emailPromises = messages.map(async (message) => {
    if (!message.id) return null;
    return getEmailDetails(accessToken, message.id);
  });

  const emails = await Promise.all(emailPromises);
  const validEmails = emails.filter(
    (email): email is EmailMessage =>
      email !== null &&
      BANK_NAMES.some((b) =>
        email.from.toLowerCase().includes(b.toLowerCase()),
      ),
  );

  return {
    emails: validEmails,
    nextPageToken,
    resultSizeEstimate,
  };
}

/**
 * Lấy chi tiết một email cụ thể
 */
export async function getEmailDetails(
  accessToken: string,
  messageId: string,
): Promise<EmailMessage | null> {
  try {
    const gmail = getGmailClient(accessToken);

    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const message = response.data;
    const headers = message.payload?.headers || [];

    const getHeader = (name: string) => {
      return (
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
          ?.value || ""
      );
    };

    // Parse body
    let body = "";
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, "base64").toString();
    } else if (message.payload?.parts) {
      // Tìm phần text/plain hoặc text/html
      const textPart = message.payload.parts.find(
        (part) =>
          part.mimeType === "text/plain" || part.mimeType === "text/html",
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, "base64").toString();
      }
    }

    return {
      id: message.id || "",
      threadId: message.threadId || "",
      snippet: message.snippet || "",
      subject: getHeader("Subject"),
      from: getHeader("From"),
      to: getHeader("To"),
      date: new Date(parseInt(message.internalDate || "0")),
      body,
    };
  } catch (error) {
    console.error("Error getting email details:", error);
    return null;
  }
}

/**
 * Parse thông tin giao dịch từ email body
 * Có thể tùy chỉnh logic này dựa trên format email của ngân hàng
 */
export function parseTransactionFromEmail(email: EmailMessage): {
  description: string;
  bank: string;
  amount: number;
  date: Date;
  type: "income" | "expense";
} | null {
  const body = email.body.toLowerCase();
  const subject = email.subject.toLowerCase();

  // Tìm số tiền (ví dụ: 500.000 VND, 500000, etc.)
  const amountMatch =
    body.match(/(\d{1,3}(?:[.,]\d{3})*)\s*(?:vnd|đ|dong)/i) ||
    body.match(/(\d{1,3}(?:[.,]\d{3})*)/);

  if (!amountMatch) return null;

  const amountStr = amountMatch[1].replace(/[.,]/g, "");
  const amount = parseInt(amountStr);

  // Xác định loại giao dịch (thu/chi)
  const isIncome =
    /(nhan|thu|tien vao|credit|deposit)/i.test(body) ||
    /(chuyen khoan den|tien den)/i.test(subject);
  const isExpense =
    /(chi|tien ra|debit|withdraw|thanh toan)/i.test(body) ||
    /(chuyen khoan di|tien di)/i.test(subject);

  // Tìm ngân hàng
  const bankMatch = body.match(
    /(vietcombank|techcombank|bidv|vietinbank|acb|mbbank|vpbank|tpbank)/i,
  );
  const bank = bankMatch ? bankMatch[1] : "Unknown";

  // Tìm mô tả
  const descriptionMatch = body.match(
    /(?:noi dung|mo ta|description)[:]\s*(.+?)(?:\n|$)/i,
  );
  const description = descriptionMatch
    ? descriptionMatch[1].trim()
    : email.snippet.substring(0, 50);

  return {
    description,
    bank,
    amount: isIncome ? amount : -amount,
    date: email.date,
    type: isIncome ? "income" : "expense",
  };
}
