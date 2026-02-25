/**
 * Geo restriction helpers.
 *
 * The application restricts voting to users located in Antioquia (Colombia).
 * On Vercel, the `x-vercel-ip-country-region` header is available for free.
 * For local dev or custom deployments we fall back to the geojs.io public API.
 *
 * Set GEO_RESTRICT=false in .env.local to disable the check during development.
 */

const RESTRICTED_REGION = "ANT"; // ISO 3166-2 subdivision code for Antioquia
const BLOCKED_REGION_LEGACY = "Bogota D.C."; // legacy geojs.io fallback

export interface GeoCheckResult {
  allowed: boolean;
  region?: string;
}

export async function checkGeo(
  /** Next.js request headers (from NextRequest.headers or headers()) */
  headers: Headers
): Promise<GeoCheckResult> {
  if (process.env.GEO_RESTRICT === "false") return { allowed: true };

  // ── Vercel edge header (free, no extra API call) ──────────────────────────
  const vercelRegion = headers.get("x-vercel-ip-country-region");
  if (vercelRegion) {
    return {
      allowed: vercelRegion === RESTRICTED_REGION,
      region: vercelRegion,
    };
  }

  // ── Fallback: geojs.io (used in self-hosted / local dev) ─────────────────
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "";

  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    // Local → allow
    return { allowed: true };
  }

  try {
    const res = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`, {
      next: { revalidate: 3600 },
    });
    const data: { region?: string } = await res.json();
    const region = data.region ?? "";
    // Legacy behaviour: block only Bogotá
    return { allowed: region !== BLOCKED_REGION_LEGACY, region };
  } catch {
    // On geo service failure → allow (fail open)
    return { allowed: true };
  }
}
