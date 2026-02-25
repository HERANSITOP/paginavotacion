import { createHmac, createHash } from "crypto";

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Produces a 64-char hex voter identifier.
 * If HASH_PEPPER is set → HMAC-SHA256(SHA256(email), pepper)
 * Otherwise → SHA256(email)
 *
 * This is identical to the PHP HashService so existing voter records remain valid.
 */
export function hashEmail(email: string): string {
  const normalized = normalize(email);
  const legacy = createHash("sha256").update(normalized).digest("hex");
  const pepper = process.env.HASH_PEPPER ?? "";
  if (!pepper) return legacy;
  return createHmac("sha256", pepper).update(legacy).digest("hex");
}
