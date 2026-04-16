import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/types/permissions";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-trimids-2024"
);

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
  iat?: number;
  exp?: number;
}

export async function signToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("trimids_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(
  response: NextResponse,
  payload: Omit<TokenPayload, "iat" | "exp">
) {
  const token = await signToken(payload);
  response.cookies.set("trimids_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return token;
}

export async function clearSession(response: NextResponse) {
  response.cookies.delete("trimids_session");
}

export function getRoleRedirect(role: Role): string {
  const redirectMap: Record<Role, string> = {
    admin: "/admin",
    intern: "/intern",
    employee: "/employee",
    hr_manager: "/hr",
    finance_manager: "/finance",
    marketing_manager: "/marketing",
  };
  return redirectMap[role] || "/login";
}