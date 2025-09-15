import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CreateMaterialColorRequest } from "@/types/material";
import { Prisma } from "@prisma/client";

// GET /api/material-colors - 자재 색상 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const finishType = searchParams.get("finishType") || "";
    const includeFiles = searchParams.get("includeFiles") === "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: Prisma.MaterialColorWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { finishType: { contains: search } },
      ];
    }

    if (finishType) {
      where.finishType = finishType;
    }

    // 정렬 옵션 구성
    const orderBy: Prisma.MaterialColorOrderByWithRelationInput = {};
    if (sortBy === "name") orderBy.name = sortOrder as "asc" | "desc";
    else if (sortBy === "code") orderBy.code = sortOrder as "asc" | "desc";
    else orderBy.createdAt = sortOrder as "asc" | "desc";

    const [materialColors, total] = await Promise.all([
      prisma.materialColor.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          materials: {
            select: {
              id: true,
              size: true,
              finishType: true,
              materialBase: {
                select: {
                  code: true,
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
          files: includeFiles
            ? {
                include: {
                  file: {
                    select: {
                      id: true,
                      fileName: true,
                      originalName: true,
                      mimeType: true,
                      size: true,
                      thumbnailUrl: true,
                      url: true,
                      extension: true,
                    },
                  },
                },
                orderBy: { order: "asc" },
              }
            : false,
          _count: {
            select: {
              materials: true,
            },
          },
        },
      }),
      prisma.materialColor.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: materialColors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("자재 색상 목록 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "자재 색상 목록을 조회하는 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/material-colors - 자재 색상 등록
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body: CreateMaterialColorRequest = await request.json();

    // 필수 필드 검증
    if (!body.code || !body.name) {
      return NextResponse.json(
        { error: "색상 코드와 이름은 필수입니다." },
        { status: 400 }
      );
    }

    // 색상 코드 중복 확인
    const existingColor = await prisma.materialColor.findUnique({
      where: { code: body.code },
    });

    if (existingColor) {
      return NextResponse.json(
        {
          success: false,
          error: "이미 존재하는 색상 코드입니다.",
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    const materialColor = await prisma.materialColor.create({
      data: {
        code: body.code,
        name: body.name,
        finishType: body.finishType,
        colorImage: body.colorImage,
      },
      include: {
        _count: {
          select: {
            materials: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: materialColor,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("자재 색상 등록 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "자재 색상을 등록하는 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
