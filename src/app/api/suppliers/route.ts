import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CreateSupplierRequest } from "@/types/material";
import { Prisma } from "@prisma/client";

// GET /api/suppliers - 거래처 목록 조회
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
    const type = searchParams.get("type") || "";
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: Prisma.SupplierWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          // materials: {
          //   include: {
          //     transactions: true
          //   }
          // }, // MaterialSupplier에 transactions 관계 없음
          _count: {
            select: {
              materials: true,
              transactions: true,
            },
          },
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: suppliers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("거래처 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "거래처 목록을 조회하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/suppliers - 거래처 등록
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body: CreateSupplierRequest = await request.json();

    // 필수 필드 검증
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: "거래처 이름과 유형은 필수입니다." },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: body.name,
        address: body.address,
        contactPerson: body.contactPerson,
        phone: body.phone,
        email: body.email,
        fax: body.fax,
        type: body.type,
        businessLicense: body.businessLicense,
        description: body.description,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(
      { success: true, data: supplier },
      { status: 201 }
    );
  } catch (error) {
    console.error("거래처 등록 오류:", error);
    return NextResponse.json(
      { error: "거래처를 등록하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
