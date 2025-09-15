import { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/signin-form";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "로그인 | BuildPro",
  description: "BuildPro 건설 프로젝트 관리 시스템에 로그인하세요.",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-6">
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">홈으로 돌아가기</span>
        </Link>
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">BuildPro</span>
        </Link>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* 로고 및 제목 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              로그인
            </h1>
            <p className="text-gray-600">
              BuildPro 계정으로 로그인하여 프로젝트 관리를 시작하세요
            </p>
          </div>

          {/* 로그인 폼 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <SignInForm />
            
            {/* 회원가입 링크 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                아직 계정이 없으신가요?{" "}
                <Link 
                  href="/auth/signup" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              로그인하면 BuildPro의{" "}
              <Link href="/terms" className="underline hover:no-underline">
                서비스 약관
              </Link>
              {" "}및{" "}
              <Link href="/privacy" className="underline hover:no-underline">
                개인정보 처리방침
              </Link>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="p-6 text-center">
        <p className="text-xs text-gray-500">
          © 2024 BuildPro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
