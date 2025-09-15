import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { CreateWarehouseRequest } from '@/types/material';

// GET /api/warehouses - 창고 목록 조회
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
    const purpose = searchParams.get('purpose') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: {
      OR?: Array<{
        name?: { contains: string };
        code?: { contains: string };
        location?: { contains: string };
      }>;
      purpose?: string;
      isActive?: boolean;
    } = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { location: { contains: search } }
      ];
    }
    
    if (purpose) {
      where.purpose = purpose;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          stocks: {
            include: {
              material: {
                select: {
                  id: true,
                  size: true,
                  finishType: true,
                  materialBase: {
                    select: {
                      code: true,
                      name: true,
                      unit: true
                    }
                  },
                  // color: { // Material 모델에 color 관계 없음
                  //   select: {
                  //     id: true,
                  //     code: true,
                  //     name: true
                  //   }
                  // }
                }
              }
            }
          },
          _count: {
            select: {
              stocks: true
              // transactions: true // Warehouse 모델에 transactions 관계 없음
            }
          }
        }
      }),
      prisma.warehouse.count({ where })
    ]);

    // 창고별 재고 요약 정보 계산
    const warehousesWithSummary = warehouses.map(warehouse => {
      const totalItems = warehouse.stocks.length;
      const totalStock = warehouse.stocks.reduce((sum: number, stock) => sum + stock.currentStock, 0);
      const lowStockItems = warehouse.stocks.filter(stock => 
        stock.currentStock <= stock.safetyStock
      ).length;

      return {
        ...warehouse,
        summary: {
          totalItems,
          totalStock,
          lowStockItems
        }
      };
    });

    return NextResponse.json({
      warehouses: warehousesWithSummary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('창고 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '창고 목록을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/warehouses - 창고 등록
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body: CreateWarehouseRequest = await request.json();

    // 필수 필드 검증
    if (!body.code || !body.name) {
      return NextResponse.json(
        { error: '창고 코드와 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    // 창고 코드 중복 확인
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { code: body.code }
    });

    if (existingWarehouse) {
      return NextResponse.json(
        { error: '이미 존재하는 창고 코드입니다.' },
        { status: 409 }
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        code: body.code,
        name: body.name,
        location: body.location,
        purpose: body.purpose,
        layoutImage: body.layoutImage
      },
      include: {
        _count: {
          select: {
            stocks: true
            // transactions: true // Warehouse 모델에 transactions 관계 없음
          }
        }
      }
    });

    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    console.error('창고 등록 오류:', error);
    return NextResponse.json(
      { error: '창고를 등록하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
