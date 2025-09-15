"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // 로딩 중일 때 처리
  if (status === "loading") {
    return (
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              BuildPro
            </Link>
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        </div>
      </nav>
    );
  }

  // 로그아웃 처리
  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                BuildPro
              </span>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === "/"
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              홈
            </Link>

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    pathname === "/dashboard"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  대시보드
                </Link>
                <Link
                  href="/dashboard/projects"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    pathname === "/dashboard/projects"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  프로젝트
                </Link>
                <Link
                  href="/dashboard/materials"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    pathname.startsWith("/dashboard/materials")
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  자재 관리
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium transition-colors duration-200 ${
                      pathname === "/admin"
                        ? "text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    관리자
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/features"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    pathname === "/features"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  기능
                </Link>
                <Link
                  href="/pricing"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    pathname === "/pricing"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  가격
                </Link>
              </>
            )}
          </div>

          {/* 사용자 메뉴 */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <UserCircleIcon className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {session.user.name}
                  </span>
                </button>

                {/* 드롭다운 메뉴 */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserCircleIcon className="w-4 h-4 mr-2" />
                      프로필
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-2" />
                      설정
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  시작하기
                </Link>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <Link
              href="/"
              className={`block text-sm font-medium transition-colors duration-200 ${
                pathname === "/"
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              홈
            </Link>

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block text-sm font-medium transition-colors duration-200 ${
                    pathname === "/dashboard"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  대시보드
                </Link>
                <Link
                  href="/projects"
                  className={`block text-sm font-medium transition-colors duration-200 ${
                    pathname === "/projects"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  프로젝트
                </Link>
                <Link
                  href="/dashboard/materials"
                  className={`block text-sm font-medium transition-colors duration-200 ${
                    pathname.startsWith("/dashboard/materials")
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  자재 관리
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={`block text-sm font-medium transition-colors duration-200 ${
                      pathname === "/admin"
                        ? "text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    관리자
                  </Link>
                )}
                <hr className="my-3" />
                <div className="flex items-center space-x-3 py-2">
                  <UserCircleIcon className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {session.user.name}님
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/features"
                  className={`block text-sm font-medium transition-colors duration-200 ${
                    pathname === "/features"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  기능
                </Link>
                <Link
                  href="/pricing"
                  className={`block text-sm font-medium transition-colors duration-200 ${
                    pathname === "/pricing"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  가격
                </Link>
                <hr className="my-3" />
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/auth/signin"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    시작하기
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
