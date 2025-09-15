"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

const signUpSchema = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다."),
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
  };
}

export function SignUpForm() {
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: Omit<SignUpFormData, "confirmPassword">) => {
      const response = await axios.post<SignUpResponse>("/api/auth/register", data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...signUpData } = data;
    signUpMutation.mutate(signUpData);
  };

  const getErrorMessage = (error: AxiosError<{ message: string }> | Error): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
    }
    return error.message || "회원가입 중 오류가 발생했습니다.";
  };

  if (success) {
    return (
      <div className="grid gap-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              autoComplete="name"
              disabled={signUpMutation.isPending}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={signUpMutation.isPending}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              disabled={signUpMutation.isPending}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              disabled={signUpMutation.isPending}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          {signUpMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {getErrorMessage(signUpMutation.error)}
              </AlertDescription>
            </Alert>
          )}
          <Button disabled={signUpMutation.isPending} type="submit">
            {signUpMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            회원가입
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            또는
          </span>
        </div>
      </div>
      <div className="text-center text-sm">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/auth/signin"
          className="underline underline-offset-4 hover:text-primary"
        >
          로그인
        </Link>
      </div>
    </div>
  );
}
