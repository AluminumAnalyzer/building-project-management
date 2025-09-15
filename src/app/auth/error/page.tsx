"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Configuration: "서버 설정에 문제가 있습니다.",
  AccessDenied: "접근이 거부되었습니다.",
  Verification: "인증 토큰이 만료되었거나 이미 사용되었습니다.",
  Default: "인증 중 오류가 발생했습니다.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  const errorMessage = error && errorMessages[error] 
    ? errorMessages[error] 
    : errorMessages.Default;

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            인증 오류
          </h1>
          <p className="text-sm text-muted-foreground">
            {errorMessage}
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/auth/signin">
              다시 로그인하기
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              홈으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              로딩 중...
            </h1>
          </div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
