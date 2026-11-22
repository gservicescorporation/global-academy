import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifySession } from "./lib/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const session = await verifySession(req.cookies.get(COOKIE)?.value);
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/"))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
