import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import { UserRole } from "@/types/enums";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "인증이 필요합니다.",
        },
        { status: 401 }
      );
    }

    // 관리자만 사용자 목록 조회 가능
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "권한이 없습니다.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const query = searchParams.get("query") || "";
    const role = searchParams.get("role") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: {
      OR?: Array<{
        name?: { contains: string; mode: string };
        email?: { contains: string; mode: string };
      }>;
      role?: string;
      active?: boolean;
    } = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }

    if (role && Object.values(UserRole).includes(role as UserRole)) {
      where.role = role;
    }

    // 총 개수 조회
    const total = await prisma.user.count({ where });

    // 사용자 목록 조회
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<(typeof users)[0]> = {
      items: users,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<(typeof users)[0]>>>(
      {
        success: true,
        data: response,
      }
    );
  } catch (error) {
    console.error("Users fetch error:", error);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "사용자 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
