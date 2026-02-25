import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Votación UNAL · Sede Medellín",
  description: "Consulta estudiantil sobre mecanismos de movilización — UNAL Medellín",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <div className="bg-mesh" aria-hidden="true" />
        <SessionProvider>
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
