import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Only @unal.edu.co accounts are allowed (all UNAL seats share this domain).
// Sede Medellín is enforced at vote time via geo-IP (Antioquia / ANT).
const ALLOWED_DOMAIN = "unal.edu.co";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: ALLOWED_DOMAIN,
          prompt: "select_account",
          // Request only email + identity — no name, no photo
          scope: "openid email",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email ?? "";
      return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
    },

    async jwt({ token, profile }) {
      if (profile?.email) token.email = profile.email;
      return token;
    },

    async session({ session, token }) {
      if (token.email) session.user.email = token.email as string;
      return session;
    },
  },

  pages: {
    error: "/",
  },
});
