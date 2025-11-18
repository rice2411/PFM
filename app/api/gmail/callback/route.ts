import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/gmail/service";

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
    const { accessToken, refreshToken } = await getTokensFromCode(code);

    if (!refreshToken) {
      throw new Error("Không nhận được refresh token. Vui lòng đăng nhập lại.");
    }

    // Redirect về trang callback client-side để lưu tokens vào localStorage
    const baseUrl = new URL(request.url).origin;
    const params = new URLSearchParams({
      accessToken,
      refreshToken,
    });
    
    return NextResponse.redirect(
      new URL(`/gmail/callback?${params.toString()}`, baseUrl)
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

