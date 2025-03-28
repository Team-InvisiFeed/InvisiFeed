import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/user/:path*", "/sign-in", "/register", "/", "/verify/:path*"],
};

export async function middleware(request) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  console.log("Middleware triggered for:", request.nextUrl.pathname);

  // Check if tokens are expired
  if (token) {
    console.log("refreshToken: ", token.refreshToken);
    if (Date.now() > token.accessTokenExpiry) {
      const now = Date.now();
      // If refresh token is expired, redirect to login
      if (now > token.refreshTokenExpiry) {
        const response = NextResponse.redirect(
          new URL("/sign-in", request.url)
        );
        // Clear all cookies
        response.cookies.delete("next-auth.session-token");
        response.cookies.delete("next-auth.csrf-token");
        response.cookies.delete("next-auth.callback-url");
        return response;
      }
    }
  }

  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/register") ||
      url.pathname.startsWith("/verify"))
  ) {
    return NextResponse.redirect(
      new URL(`/user/${token.username}`, request.url)
    );
  }

  if (token) {
    if (
      Date.now() > token.refreshTokenExpiry &&
      url.pathname.startsWith("/user")
    ) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}
