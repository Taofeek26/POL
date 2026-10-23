// Thin client for the POL API, used by server components (public data) and client components
// (anything signed in). Auth: in dev mode the chosen test user goes in x-dev-user; with Cognito
// the ID token goes in Authorization (sign-in UI comes next, see README).
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_MODE ?? "cognito";

const DEV_USER_KEY = "pol-dev-user";
const WARD_KEY = "pol-home-ward";

function safeGet(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* private mode: ignore */
  }
}

export const devUser = {
  get: () => safeGet(DEV_USER_KEY),
  set: (v: string | null) => {
    safeSet(DEV_USER_KEY, v);
    window.dispatchEvent(new Event("pol-auth"));
  },
};

export const homeWard = {
  get: () => safeGet(WARD_KEY),
  set: (v: string) => safeSet(WARD_KEY, v),
};

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  if (AUTH_MODE === "dev") {
    const u = devUser.get();
    return u ? { "x-dev-user": u } : {};
  }
  const token = safeGet("pol-id-token");
  return token ? { authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T = any>(path: string, init: RequestInit & { revalidate?: number } = {}): Promise<T> {
  const { revalidate, ...rest } = init;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(rest.body ? { "content-type": "application/json" } : {}),
      ...authHeaders(),
      ...(rest.headers as Record<string, string> | undefined),
    },
    // Server components cache public data briefly; client calls are always fresh.
    ...(typeof window === "undefined" ? { next: { revalidate: revalidate ?? 30 } } : { cache: "no-store" as const }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  return res.json();
}

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function yearsInOffice(start: string) {
  const months = Math.max(0, Math.round((Date.now() - new Date(start).getTime()) / (30.44 * 86_400_000)));
  return months < 12 ? `${months} months` : `${(months / 12).toFixed(1)} years`;
}
