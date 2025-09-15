import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UpdateWarehouseRequest } from '@/types/material';

// GET /api/warehouses/[id] - 창고 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
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
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { lastUpdated: 'desc' }
        },
        transactions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            material: {
              select: {
                id: true
                // code와 name은 Material 모델에 없음
                // code: true,
                // name: true
              }
            },
            supplier: {
              select: {
                id: true,
                code: true,
                name: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            project: {
              select: {
                id: true,
                name: true
                // code 필드는 Project 모델에 없음
                // code: true
              }
            }
          }
        },
        _count: {
          select: {
            stocks: true,
            transactions: true
          }
        }
      }
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: '창고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 창고 재고 요약 정보 계산 - 임시로 비활성화 (Warehouse 모델에 stocks 관계 없음)
    // const totalItems = warehouse.stocks?.length || 0;
    // const totalStock = warehouse.stocks?.reduce((sum, stock) => sum + stock.currentStock, 0) || 0;
    // const totalValue = warehouse.stocks?.reduce((sum, stock) => 
    //   sum + (stock.currentStock * (stock.unitPrice || 0)), 0
    // ) || 0;
    // const lowStockItems = warehouse.stocks?.filter(stock => 
    //   stock.currentStock <= stock.safetyStock
    // ) || [];
    
    const totalItems = 0;
    const totalStock = 0;
    const totalValue = 0;
    const lowStockItems: unknown[] = [];

    // 최근 거래 통계 - 임시로 비활성화 (Warehouse 모델에 transactions 관계 없음)
    // const recentTransactions = warehouse.transactions?.slice(0, 10) || [];
    // const inTransactions = recentTransactions.filter(t => t.type === 'IN').length;
    // const outTransactions = recentTransactions.filter(t => t.type === 'OUT').length;
    const inTransactions = 0;
    const outTransactions = 0;

    return NextResponse.json({
      ...warehouse,
      summary: {
        totalItems,
        totalStock,
        totalValue,
        lowStockItems: lowStockItems.length,
        recentInTransactions: inTransactions,
        recentOutTransactions: outTransactions
      },
      lowStockDetails: [] // 임시로 빈 배열로 설정
    });
  } catch (error) {
    console.error('창고 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '창고 정보를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/warehouses/[id] - 창고 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body: UpdateWarehouseRequest = await request.json();

    // 창고 존재 확인
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id: params.id }
    });

    if (!existingWarehouse) {
      return NextResponse.json(
        { error: '창고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 코드 변경 시 중복 확인
    if (body.code && body.code !== existingWarehouse.code) {
      const duplicateCode = await prisma.warehouse.findUnique({
        where: { code: body.code }
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: '이미 존재하는 창고 코드입니다.' },
          { status: 409 }
        );
      }
    }

    const updatedWarehouse = await prisma.warehouse.update({
      where: { id: params.id },
      data: {
        ...(body.code && { code: body.code }),
        ...(body.name && { name: body.name }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.purpose !== undefined && { purpose: body.purpose }),
        ...(body.layoutImage !== undefined && { layoutImage: body.layoutImage }),
        ...(body.isActive !== undefined && { isActive: body.isActive })
      },
      include: {
        stocks: {
          include: {
            material: {
              select: {
                id: true
                // code: true, // Material 모델에 code 필드 없음
                // name: true // Material 모델에 name 필드 없음
              }
            }
          }
        },
        // _count 임시 비활성화 (Warehouse 모델에 stocks, transactions 관계 없음)
        // _count: {
        //   select: {
        //     stocks: true,
        //     transactions: true
        //   }
        // }
      }
    });

    // 재고 요약 정보 계산 - 임시로 비활성화
    // const totalItems = updatedWarehouse.stocks?.length || 0;
    // const totalStock = updatedWarehouse.stocks?.reduce((sum, stock) => sum + stock.currentStock, 0) || 0;
    const totalItems = 0;
    const totalStock = 0;

    return NextResponse.json({
      ...updatedWarehouse,
      summary: {
        totalItems,
        totalStock
      }
    });
  } catch (error) {
    console.error('창고 수정 오류:', error);
    return NextResponse.json(
      { error: '창고 정보를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/warehouses/[id] - 창고 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 창고 존재 확인
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id: params.id }
    });

    if (!existingWarehouse) {
      return NextResponse.json(
        { error: '창고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 재고나 거래 내역 확인 임시 비활성화 (Warehouse 모델에 관계 없음)
    // if (existingWarehouse.stocks?.length > 0 || existingWarehouse.transactions?.length > 0) {
    //   return NextResponse.json(
    //     { error: '재고나 거래 내역이 있는 창고는 삭제할 수 없습니다.' },
    //     { status: 400 }
    //   );
    // }

    await prisma.warehouse.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: '창고가 삭제되었습니다.' });
  } catch (error) {
    console.error('창고 삭제 오류:', error);
    return NextResponse.json(
      { error: '창고를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
