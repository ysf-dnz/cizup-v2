import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/", "/login", "/register"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("cizup_token")?.value;
  const { pathname } = req.nextUrl;

  if (!token && !PUBLIC.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
