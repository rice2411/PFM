import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/gmail/service";

/**
 * API route để xử lý OAuth callback
 * GET /api/gmail/callback?code=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/?error=no_code", request.url)
      );
    }

    // Lấy access token và refresh token
    const accessToken = await getAccessToken(undefined, code);

    // TODO: Lưu refresh token vào database hoặc session
    // Ở đây tạm thời redirect về trang callback với token trong URL (không an toàn cho production)
    // Trong production, nên lưu vào database hoặc session

    // Redirect về trang callback client-side để lưu token vào localStorage
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(
      new URL(`/gmail/callback?token=${encodeURIComponent(accessToken)}`, baseUrl)
    );
  } catch (error) {
    console.error("Error in callback:", error);
    const baseUrl = new URL(request.url).origin;
    const errorMessage = error instanceof Error ? error.message : "callback_failed";
    return NextResponse.redirect(
      new URL(`/gmail/callback?error=${encodeURIComponent(errorMessage)}`, baseUrl)
    );
  }
}

