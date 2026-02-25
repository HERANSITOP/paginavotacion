"use client";

import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  variant?: "default" | "ghost";
}

export default function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  return (
    <button
      type="button"
      className={`btn${variant === "ghost" ? " btn-ghost" : ""}`}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Cerrar sesión
    </button>
  );
}
