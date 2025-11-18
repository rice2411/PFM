import { NextRequest, NextResponse } from "next/server";
import { listEmails, parseTransactionFromEmail } from "@/lib/gmail/service";

/**
 * API route để lấy danh sách email
 * GET /api/gmail/emails?accessToken=...&maxResults=10&query=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get("accessToken");
    const maxResults = parseInt(searchParams.get("maxResults") || "10");
    const query = searchParams.get("query") || undefined;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 401 }
      );
    }

    // Lấy danh sách email
    const emails = await listEmails(accessToken, maxResults, query);

    // Parse thành transactions
    const transactions = emails
      .map((email) => parseTransactionFromEmail(email))
      .filter((t): t is NonNullable<typeof t> => t !== null);

    return NextResponse.json({
      emails,
      transactions,
      count: emails.length,
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails", details: String(error) },
      { status: 500 }
    );
  }
}

