import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { CreateMaterialBaseRequest } from '@/types/api-requests';
import { Prisma } from '@prisma/client';

// GET /api/material-bases - 기본 자재 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: Prisma.MaterialBaseWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { specification: { contains: search } }
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [materialBases, total] = await Promise.all([
      prisma.materialBase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          materials: {
            include: {
              color: true,
              _count: {
                select: {
                  stocks: true,
                  transactions: true
                }
              }
            }
          },
          _count: {
            select: {
              materials: true
            }
          }
        }
      }),
      prisma.materialBase.count({ where })
    ]);

    return NextResponse.json({
      materialBases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('기본 자재 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '기본 자재 목록을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/material-bases - 기본 자재 등록
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body: CreateMaterialBaseRequest = await request.json();

    // 필수 필드 검증
    if (!body.code || !body.name || !body.unit) {
      return NextResponse.json(
        { error: '자재 코드, 이름, 단위는 필수입니다.' },
        { status: 400 }
      );
    }

    // 자재 코드 중복 확인
    const existingMaterialBase = await prisma.materialBase.findUnique({
      where: { code: body.code }
    });

    if (existingMaterialBase) {
      return NextResponse.json(
        { error: '이미 존재하는 자재 코드입니다.' },
        { status: 409 }
      );
    }

    const materialBase = await prisma.materialBase.create({
      data: {
        code: body.code,
        name: body.name,
        category: body.category,
        specification: body.specification,
        unit: body.unit,
        unitPrice: body.unitPrice,
        description: body.description,
        createdById: session.user.id,
        // suppliers 관계 생성
        suppliers: body.suppliers ? {
          create: body.suppliers.map((supplierId: string) => ({
            supplierId,
            createdById: session.user.id
          }))
        } : undefined
      },
      include: {
        materials: true,
        suppliers: {
          include: {
            supplier: true
          }
        },
        _count: {
          select: {
            materials: true,
            suppliers: true
          }
        }
      }
    });

    return NextResponse.json(materialBase, { status: 201 });
  } catch (error) {
    console.error('기본 자재 등록 오류:', error);
    return NextResponse.json(
      { error: '기본 자재를 등록하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
