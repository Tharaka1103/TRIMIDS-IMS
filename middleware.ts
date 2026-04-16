import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { Role } from "@/types/permissions";

const PUBLIC_ROUTES = ["/login", "/api/auth/login"];

const ROLE_ROUTES: Record<string, Role[]> = {
  "/admin": ["admin"],
  "/intern": ["intern", "admin"],
  "/employee": ["employee", "admin"],
  "/hr": ["hr_manager", "admin"],
  "/finance": ["finance_manager", "admin"],
  "/marketing": ["marketing_manager", "admin"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check session
  const token = request.cookies.get("trimids_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifyToken(token);
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("trimids_session");
    return response;
  }

  // Check role-based route access
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(session.role)) {
        const redirectPath = getRoleBasePath(session.role);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
      break;
    }
  }

  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.userId);
  requestHeaders.set("x-user-role", session.role);
  requestHeaders.set("x-user-email", session.email);
  requestHeaders.set("x-user-name", session.name);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

function getRoleBasePath(role: Role): string {
  const paths: Record<Role, string> = {
    admin: "/admin",
    intern: "/intern",
    employee: "/employee",
    hr_manager: "/hr",
    finance_manager: "/finance",
    marketing_manager: "/marketing",
  };
  return paths[role] || "/login";
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};