import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * - /vote        → must be authenticated (Google)
 * - /admin       → public page but protected by password entered client-side
 * - /api/admin/* → protected by Bearer token in API route handlers
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect /vote — redirect unauthenticated users to sign-in
  if (pathname.startsWith("/vote")) {
    if (!req.auth) {
      const loginUrl = new URL("/api/auth/signin", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/vote", "/vote/:path*", "/admin", "/admin/:path*"],
};
