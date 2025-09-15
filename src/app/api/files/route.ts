import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileSearchParams, FileSearchResponse } from "@/types/file";
import type { ApiResponse } from "@/types/api";
import type { Prisma } from "@prisma/client";

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

    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱
    const params: FileSearchParams = {
      query: searchParams.get("query") || undefined,
      category: searchParams.get("category") || undefined,
      mimeType: searchParams.get("mimeType") || undefined,
      uploadedById: searchParams.get("uploadedById") || undefined,
      isPublic:
        searchParams.get("isPublic") === "true"
          ? true
          : searchParams.get("isPublic") === "false"
          ? false
          : undefined,
      tags:
        searchParams
          .get("tags")
          ?.split(",")
          .map((tag) => tag.trim()) || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      minSize: searchParams.get("minSize")
        ? parseInt(searchParams.get("minSize")!)
        : undefined,
      maxSize: searchParams.get("maxSize")
        ? parseInt(searchParams.get("maxSize")!)
        : undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      sortBy:
        (searchParams.get("sortBy") as FileSearchParams["sortBy"]) ||
        "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    // WHERE 조건 구성
    const where: Prisma.FileWhereInput = {};

    // 텍스트 검색
    if (params.query) {
      where.OR = [
        { originalName: { contains: params.query } },
        { description: { contains: params.query } },
        { tags: { contains: params.query } },
      ];
    }

    // 카테고리 필터
    if (params.category) {
      where.category = params.category;
    }

    // MIME 타입 필터
    if (params.mimeType) {
      where.mimeType = params.mimeType;
    }

    // 업로더 필터
    if (params.uploadedById) {
      where.uploadedById = params.uploadedById;
    }

    // 공개 여부 필터
    if (params.isPublic !== undefined) {
      where.isPublic = params.isPublic;
    }

    // 태그 필터
    if (params.tags && params.tags.length > 0) {
      where.AND = params.tags.map((tag) => ({
        tags: { contains: tag },
      }));
    }

    // 날짜 범위 필터
    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) {
        where.createdAt.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.createdAt.lte = new Date(params.dateTo);
      }
    }

    // 파일 크기 필터
    if (params.minSize || params.maxSize) {
      where.size = {};
      if (params.minSize) {
        where.size.gte = params.minSize;
      }
      if (params.maxSize) {
        where.size.lte = params.maxSize;
      }
    }

    // 권한 체크 - 본인 파일이거나 공개 파일만 조회 가능
    if (session.user.role !== "ADMIN") {
      where.OR = [{ uploadedById: session.user.id }, { isPublic: true }];
    }

    // 정렬 옵션
    const orderBy: Prisma.FileOrderByWithRelationInput = {
      [params.sortBy!]: params.sortOrder,
    };

    // 페이지네이션 계산
    const skip = (params.page! - 1) * params.limit!;

    // 파일 조회
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy,
        skip,
        take: params.limit,
      }),
      prisma.file.count({ where }),
    ]);

    const totalPages = Math.ceil(total / params.limit!);

    const response: FileSearchResponse = {
      files,
      total,
      page: params.page!,
      limit: params.limit!,
      totalPages,
    };

    return NextResponse.json<ApiResponse<FileSearchResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("File search error:", error);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "파일 검색 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
