// Resolves the caller to a POL user.
//   AUTH_MODE=cognito (AWS): verifies a Cognito ID token from "Authorization: Bearer <token>".
//   AUTH_MODE=dev (local only): trusts the x-dev-user header as the Cognito sub.
import type { Context, MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { VerificationLevel } from "@pol/shared";
import { one } from "./db.js";

export interface AuthUser {
  id: string;
  role: "citizen" | "editor" | "admin";
  verificationLevel: VerificationLevel;
  homeWardId: string | null;
  language: string;
}

export type AppEnv = { Variables: { user: AuthUser | null } };

interface Identity {
  sub: string;
  phoneVerified: boolean;
  groups: string[];
}

let verifier: { verify: (token: string) => Promise<Record<string, unknown>> } | undefined;

async function cognitoIdentity(header: string | undefined): Promise<Identity | null> {
  if (!header?.startsWith("Bearer ")) return null;
  if (!verifier) {
    const { CognitoJwtVerifier } = await import("aws-jwt-verify");
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID!,
      clientId: process.env.COGNITO_CLIENT_ID!,
      tokenUse: "id",
    }) as any;
  }
  try {
    const claims = await verifier!.verify(header.slice(7));
    return {
      sub: String(claims.sub),
      phoneVerified: claims.phone_number_verified === true,
      groups: (claims["cognito:groups"] as string[] | undefined) ?? [],
    };
  } catch {
    throw new HTTPException(401, { message: "Invalid token" });
  }
}

function devIdentity(c: Context): Identity | null {
  const sub = c.req.header("x-dev-user");
  return sub ? { sub, phoneVerified: false, groups: [] } : null;
}

export const authenticate: MiddlewareHandler<AppEnv> = async (c, next) => {
  const mode = process.env.AUTH_MODE ?? "cognito";
  const identity = mode === "dev" ? devIdentity(c) : await cognitoIdentity(c.req.header("authorization"));
  if (!identity) {
    c.set("user", null);
    return next();
  }

  let row;
  if (mode === "dev") {
    // Dev users (seeded) keep their stored role and verification level.
    row = await one<any>(
      `insert into users (cognito_sub) values (:sub)
       on conflict (cognito_sub) do update set cognito_sub = excluded.cognito_sub
       returning id, role, verification_level, home_ward_id, language`,
      { sub: identity.sub },
    );
  } else {
    // Cognito is the source of truth for role (groups) and phone verification.
    const role = identity.groups.includes("admins") ? "admin" : identity.groups.includes("editors") ? "editor" : "citizen";
    row = await one<any>(
      `insert into users (cognito_sub, role, verification_level) values (:sub, :role, :level)
       on conflict (cognito_sub) do update set role = excluded.role,
         verification_level = case when users.verification_level = 'kyc' then 'kyc' else excluded.verification_level end
       returning id, role, verification_level, home_ward_id, language`,
      { sub: identity.sub, role, level: identity.phoneVerified ? "phone" : "unverified" },
    );
  }
  c.set("user", {
    id: row.id,
    role: row.role,
    verificationLevel: row.verification_level,
    homeWardId: row.home_ward_id,
    language: row.language,
  });
  return next();
};

export function requireUser(c: Context<AppEnv>): AuthUser {
  const user = c.get("user");
  if (!user) throw new HTTPException(401, { message: "Sign in required" });
  return user;
}

export function requireEditor(c: Context<AppEnv>): AuthUser {
  const user = requireUser(c);
  if (user.role !== "editor" && user.role !== "admin") throw new HTTPException(403, { message: "Editors only" });
  return user;
}
