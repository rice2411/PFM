import { google } from "googleapis";
import { gmailConfig } from "@/config/gmailConfig";
import { EmailMessageType } from "@/types/gmail-types";

export const GmailService = {
  getTokensFromCode: async (code: string) => {
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
  },

  refreshAccessToken: async (refreshToken: string): Promise<string> => {
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
  },

  getGmailClient: async (accessToken: string) => {
    const oauth2Client = new google.auth.OAuth2(
      gmailConfig.clientId,
      gmailConfig.clientSecret,
      gmailConfig.redirectUri,
    );

    oauth2Client.setCredentials({ access_token: accessToken });
    return google.gmail({ version: "v1", auth: oauth2Client });
  },

  listEmails: async (
    accessToken: string,
    maxResults: number = 10,
    query?: string,
    pageToken?: string,
  ) => {
    const gmail = await GmailService.getGmailClient(accessToken);

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      q: query,
      pageToken: pageToken || undefined,
    });

    const messages = response.data.messages || [];
    const nextPageToken = response.data.nextPageToken;
    const resultSizeEstimate = response.data.resultSizeEstimate;

    // Lấy chi tiết từng email
    const emailPromises = messages.map(async (message) => {
      if (!message.id) return null;
      return GmailService.getEmailDetails(accessToken, message.id);
    });

    const emails = await Promise.all(emailPromises);
    const validEmails = emails.filter(
      (email): email is EmailMessageType => email !== null,
    );

    return {
      emails: validEmails,
      nextPageToken: nextPageToken || undefined,
      resultSizeEstimate: resultSizeEstimate || undefined,
    };
  },

  getEmailDetails: async (accessToken: string, messageId: string) => {
    try {
      const gmail = await GmailService.getGmailClient(accessToken);

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
  },
};
