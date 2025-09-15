import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// 보호된 라우트 정의
const protectedRoutes = [
  "/dashboard",
  "/projects",
  "/teams",
  "/materials",
  "/reports",
  "/settings",
];

// 인증이 필요하지 않은 라우트 정의
const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
];

// API 라우트 중 보호된 라우트
const protectedApiRoutes = [
  "/api/projects",
  "/api/teams",
  "/api/materials",
  "/api/users",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // API 라우트 처리
  if (nextUrl.pathname.startsWith("/api")) {
    // 인증 API는 항상 허용
    if (nextUrl.pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // 보호된 API 라우트 확인
    const isProtectedApiRoute = protectedApiRoutes.some(route =>
      nextUrl.pathname.startsWith(route)
    );

    if (isProtectedApiRoute && !isLoggedIn) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // 공개 라우트는 항상 허용
  if (publicRoutes.includes(nextUrl.pathname)) {
    return NextResponse.next();
  }

  // 보호된 라우트 확인
  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  );

  // 로그인하지 않은 사용자가 보호된 라우트에 접근하려는 경우
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // 로그인한 사용자가 인증 페이지에 접근하려는 경우
  if (isLoggedIn && nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
