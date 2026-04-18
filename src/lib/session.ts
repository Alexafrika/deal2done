/**
 * JWT session helpers.
 * Token is stored in an httpOnly cookie so JS cannot read it.
 * Signing uses HS256 with JWT_SECRET from env.
 */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "deal2done_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env variable is not set");
  return new TextEncoder().encode(secret);
}

export interface SessionPayload extends JWTPayload {
  userId: string;
  role: string;
}

/** Sign a JWT for the given user and return the token string. */
export async function signToken(payload: Omit<SessionPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

/** Verify a JWT string and return its typed payload. Throws on invalid/expired token. */
export async function verifyToken(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as SessionPayload;
}

/** Read + verify the session token from the current request's cookies. Returns null if missing/invalid. */
export async function getSession(req?: NextRequest): Promise<SessionPayload | null> {
  try {
    let token: string | undefined;
    if (req) {
      token = req.cookies.get(COOKIE_NAME)?.value;
    } else {
      // Server component / Route Handler using next/headers
      const jar = await cookies();
      token = jar.get(COOKIE_NAME)?.value;
    }
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/** Attach a signed session cookie to a NextResponse. */
export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/** Clear the session cookie on a NextResponse. */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
