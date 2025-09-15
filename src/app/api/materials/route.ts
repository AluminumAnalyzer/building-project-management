import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { CreateMaterialRequest } from '@/types/material';
import { Prisma } from '@prisma/client';

// GET /api/materials - 자재 인스턴스 목록 조회
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
    const materialBaseId = searchParams.get('materialBaseId') || '';
    const colorId = searchParams.get('colorId') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: Prisma.MaterialWhereInput = {};
    
    if (search) {
      where.OR = [
        { size: { contains: search } },
        { finishType: { contains: search } },
        { description: { contains: search } },
        { materialBase: { name: { contains: search } } },
        { materialBase: { code: { contains: search } } }
      ];
    }
    
    if (materialBaseId) {
      where.materialBaseId = materialBaseId;
    }
    
    if (colorId) {
      where.colorId = colorId;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          materialBase: {
            select: {
              id: true,
              code: true,
              name: true,
              category: true,
              unit: true
            }
          },
          color: {
            select: {
              id: true,
              code: true,
              name: true,
              finishType: true
            }
          },
          stocks: {
            include: {
              warehouse: {
                select: {
                  id: true,
                  code: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              stocks: true,
              transactions: true,
              bomItems: true
            }
          }
        }
      }),
      prisma.material.count({ where })
    ]);

    // 총 재고량 계산
    const materialsWithTotalStock = materials.map(material => ({
      ...material,
      totalStock: material.stocks.reduce((sum, stock) => sum + stock.currentStock, 0)
    }));

    const response = {
      materials: materialsWithTotalStock,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('자재 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '자재 목록을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/materials - 자재 인스턴스 등록
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body: CreateMaterialRequest = await request.json();

    // 필수 필드 검증
    if (!body.materialBaseId) {
      return NextResponse.json(
        { error: '기본 자재 ID는 필수입니다.' },
        { status: 400 }
      );
    }

    // 기본 자재 존재 확인
    const materialBase = await prisma.materialBase.findUnique({
      where: { id: body.materialBaseId }
    });

    if (!materialBase) {
      return NextResponse.json(
        { error: '기본 자재를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 색상 ID가 제공된 경우 존재 확인
    if (body.colorId) {
      const color = await prisma.materialColor.findUnique({
        where: { id: body.colorId }
      });

      if (!color) {
        return NextResponse.json(
          { error: '색상을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    const material = await prisma.material.create({
      data: {
        materialBaseId: body.materialBaseId,
        colorId: body.colorId,
        size: body.size,
        finishType: body.finishType,
        unitPrice: body.unitPrice,
        description: body.description
      },
      include: {
        materialBase: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            unit: true
          }
        },
        color: {
          select: {
            id: true,
            code: true,
            name: true,
            finishType: true
          }
        },
        _count: {
          select: {
            stocks: true,
            transactions: true,
            bomItems: true
          }
        }
      }
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('자재 등록 오류:', error);
    return NextResponse.json(
      { error: '자재를 등록하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
