"use client";

import { signIn } from "next-auth/react";

/**
 * Triggers the Google OAuth flow directly via NextAuth v5.
 * Uses signIn("google") which sends a proper POST with CSRF token
 * to /api/auth/signin/google and then redirects to Google.
 */
export default function LoginButton() {
  return (
    <button
      type="button"
      className="btn"
      onClick={() => signIn("google", { callbackUrl: "/vote" })}
    >
      Iniciar con Google
    </button>
  );
}
