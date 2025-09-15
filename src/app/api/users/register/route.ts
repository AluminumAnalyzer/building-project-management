import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types/api";

// 회원가입 요청 스키마
const registerSchema = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다."),
  email: z.string().email("유효한 이메일을 입력해주세요."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
});

type RegisterRequest = z.infer<typeof registerSchema>;

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();

    // 입력 데이터 검증
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "입력 데이터가 올바르지 않습니다.",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { name, email, password } = validationResult.data;

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "이미 사용 중인 이메일입니다.",
        },
        { status: 409 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await hash(password, 12);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // 기본 역할
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json<ApiResponse<typeof user>>(
      {
        success: true,
        data: user,
        message: "회원가입이 완료되었습니다.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "회원가입 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
