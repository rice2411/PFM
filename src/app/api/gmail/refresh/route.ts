import { NextRequest, NextResponse } from "next/server";
import { GmailService } from "@/services/gmail.services";

/**
 * API route để refresh access token
 * POST /api/gmail/refresh
 * Body: { refreshToken: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Refresh access token
    const accessToken = await GmailService.refreshAccessToken(refreshToken);

    return NextResponse.json({
      accessToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      { error: "Failed to refresh token", details: String(error) },
      { status: 500 }
    );
  }
}

