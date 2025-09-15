import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { CreateMaterialStockRequest, UpdateMaterialStockRequest } from '@/types/material';
import { Prisma } from '@prisma/client';

// GET /api/material-stock - 자재 재고 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const materialId = searchParams.get('materialId') || '';
    const warehouseId = searchParams.get('warehouseId') || '';
    const materialBaseId = searchParams.get('materialBaseId') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: Prisma.MaterialStockWhereInput = {};
    
    if (materialId) {
      where.materialId = materialId;
    }
    
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }
    
    if (materialBaseId) {
      where.material = {
        materialBaseId: materialBaseId
      };
    }
    
    // lowStock 필터는 결과에서 처리 (Prisma에서 직접 비교 불가)
    
    if (search) {
      where.OR = [
        { material: { materialBase: { name: { contains: search } } } },
        { material: { materialBase: { code: { contains: search } } } },
        { warehouse: { name: { contains: search } } },
        { warehouse: { code: { contains: search } } }
      ];
    }

    // 먼저 모든 재고 조회
    const allStocks = await prisma.materialStock.findMany({
      where,
      orderBy: { lastUpdated: 'desc' },
      include: {
        material: {
          select: {
            id: true,
            size: true,
            finishType: true,
            unitPrice: true,
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
            }
          }
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
            location: true
          }
        }
      }
    });

    // lowStock 필터링 적용
    const filteredStocks = lowStock 
      ? allStocks.filter(stock => stock.currentStock <= stock.safetyStock)
      : allStocks;

    const total = filteredStocks.length;
    const stocks = filteredStocks.slice(skip, skip + limit);

    // 재고 상태 정보 추가
    const stocksWithStatus = stocks.map(stock => ({
      ...stock,
      isLowStock: stock.currentStock <= stock.safetyStock,
      stockValue: stock.currentStock * (stock.unitPrice || 0),
      shortage: stock.currentStock < stock.safetyStock ? 
        stock.safetyStock - stock.currentStock : 0
    }));

    return NextResponse.json({
      stocks: stocksWithStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('재고 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '재고 목록을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/material-stock - 재고 등록 (초기 재고 설정)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body: CreateMaterialStockRequest = await request.json();

    // 필수 필드 검증
    if (!body.materialId || !body.warehouseId) {
      return NextResponse.json(
        { error: '자재 ID와 창고 ID는 필수입니다.' },
        { status: 400 }
      );
    }

    // 자재 존재 확인
    const material = await prisma.material.findUnique({
      where: { id: body.materialId }
    });

    if (!material) {
      return NextResponse.json(
        { error: '자재를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 창고 존재 확인
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: body.warehouseId }
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: '창고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 중복 재고 확인 (같은 자재, 창고 조합)
    const existingStock = await prisma.materialStock.findFirst({
      where: {
        materialId: body.materialId,
        warehouseId: body.warehouseId
      }
    });

    if (existingStock) {
      return NextResponse.json(
        { error: '이미 등록된 재고입니다.' },
        { status: 409 }
      );
    }

    const stock = await prisma.materialStock.create({
      data: {
        materialId: body.materialId,
        warehouseId: body.warehouseId,
        currentStock: body.currentStock || 0,
        safetyStock: body.safetyStock || 0,
        unitPrice: body.unitPrice
      },
      include: {
        material: {
          select: {
            id: true,
            colorId: true,
            size: true,
            finishType: true,
            materialBase: {
              select: {
                code: true,
                name: true,
                unit: true
              }
            },
            color: {
              select: {
                code: true,
                name: true
              }
            }
          }
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(stock, { status: 201 });
  } catch (error) {
    console.error('재고 등록 오류:', error);
    return NextResponse.json(
      { error: '재고를 등록하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/material-stock - 재고 수량 조정
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body: UpdateMaterialStockRequest = await request.json();

    // 필수 필드 검증
    if (!body.id) {
      return NextResponse.json(
        { error: '재고 ID는 필수입니다.' },
        { status: 400 }
      );
    }

    // 재고 존재 확인
    const existingStock = await prisma.materialStock.findUnique({
      where: { id: body.id }
    });

    if (!existingStock) {
      return NextResponse.json(
        { error: '재고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedStock = await prisma.materialStock.update({
      where: { id: body.id },
      data: {
        ...(body.currentStock !== undefined && { currentStock: body.currentStock }),
        ...(body.safetyStock !== undefined && { safetyStock: body.safetyStock }),
        ...(body.unitPrice !== undefined && { unitPrice: body.unitPrice }),
        lastUpdated: new Date()
      },
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
            color: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          }
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      ...updatedStock,
      isLowStock: updatedStock.currentStock <= updatedStock.safetyStock,
      stockValue: updatedStock.currentStock * (updatedStock.unitPrice || 0)
    });
  } catch (error) {
    console.error('재고 수정 오류:', error);
    return NextResponse.json(
      { error: '재고를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
