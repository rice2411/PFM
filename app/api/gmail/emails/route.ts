import { NextRequest, NextResponse } from "next/server";
import { listEmails, parseTransactionFromEmail, refreshAccessToken } from "@/lib/gmail/service";

/**
 * API route để lấy danh sách email
 * GET /api/gmail/emails?accessToken=...&refreshToken=...&query=...&fetchAll=true
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const query = searchParams.get("query") || undefined;
    const fetchAll = searchParams.get("fetchAll") === "true";

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: "Access token or refresh token is required" },
        { status: 401 }
      );
    }

    // Nếu có refresh token, thử refresh access token trước
    if (refreshToken) {
      try {
        accessToken = await refreshAccessToken(refreshToken);
      } catch (error) {
        console.error("Error refreshing token:", error);
        return NextResponse.json(
          { error: "Failed to refresh token", details: String(error) },
          { status: 401 }
        );
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 401 }
      );
    }

    let allEmails: any[] = [];
    let nextPageToken: string | undefined = undefined;
    const maxResultsPerPage = 500; // Gmail API cho phép tối đa 500

    // Fetch tất cả emails nếu fetchAll = true
    if (fetchAll) {
      do {
        const result = await listEmails(
          accessToken,
          maxResultsPerPage,
          query,
          nextPageToken
        );

        allEmails = allEmails.concat(result.emails);
        nextPageToken = result.nextPageToken;

        // Giới hạn số lượng để tránh timeout (có thể điều chỉnh)
        if (allEmails.length >= 10000) {
          console.warn("Reached maximum email limit (10000)");
          break;
        }
      } while (nextPageToken);
    } else {
      // Fetch một trang duy nhất (backward compatibility)
      const result = await listEmails(accessToken, 10, query);
      allEmails = result.emails;
      nextPageToken = result.nextPageToken;
    }

    // Parse thành transactions
    const transactions = allEmails
      .map((email) => parseTransactionFromEmail(email))
      .filter((t): t is NonNullable<typeof t> => t !== null);

    return NextResponse.json({
      emails: allEmails,
      transactions,
      count: allEmails.length,
      accessToken, // Trả về access token mới nếu đã refresh
    });
  } catch (error: any) {
    console.error("Error fetching emails:", error);
    
    // Nếu lỗi 401, có thể token đã hết hạn
    if (error.code === 401 || error.message?.includes("401")) {
      return NextResponse.json(
        { error: "Token expired. Please refresh token.", details: String(error) },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch emails", details: String(error) },
      { status: 500 }
    );
  }
}

