import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/materials/summary - 자재 관리 요약 정보
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId') || '';
    const period = searchParams.get('period') || '30'; // 기본 30일

    // 기간 설정
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // 기본 통계
    const [
      totalMaterialBases,
      totalMaterials,
      totalWarehouses,
      totalSuppliers,
      totalColors,
      activeProjects
    ] = await Promise.all([
      prisma.materialBase.count(),
      prisma.material.count(),
      prisma.warehouse.count(),
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.materialColor.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } })
    ]);

    // 재고 통계
    const stockCondition = warehouseId ? { warehouseId } : {};
    
    const [
      totalStockItems,
      lowStockItems,
      outOfStockItems,
      totalStockValue
    ] = await Promise.all([
      prisma.materialStock.count({ where: stockCondition }),
      prisma.materialStock.count({
        where: {
          ...stockCondition,
          currentStock: { lte: prisma.materialStock.fields.safetyStock }
        }
      }),
      prisma.materialStock.count({
        where: {
          ...stockCondition,
          currentStock: 0
        }
      }),
      prisma.materialStock.aggregate({
        where: stockCondition,
        _sum: {
          currentStock: true
        }
      })
    ]);

    // 거래 통계 (지정된 기간)
    const transactionCondition = {
      createdAt: { gte: startDate },
      ...(warehouseId && { warehouseId })
    };

    const [
      totalTransactions,
      inTransactions,
      outTransactions,
      transactionValue
    ] = await Promise.all([
      prisma.materialTransaction.count({ where: transactionCondition }),
      prisma.materialTransaction.count({
        where: { ...transactionCondition, type: 'IN' }
      }),
      prisma.materialTransaction.count({
        where: { ...transactionCondition, type: 'OUT' }
      }),
      prisma.materialTransaction.aggregate({
        where: transactionCondition,
        _sum: {
          totalPrice: true
        }
      })
    ]);

    // 카테고리별 자재 분포
    const materialsByCategory = await prisma.materialBase.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });

    // 창고별 재고 현황
    const stockByWarehouse = await prisma.materialStock.groupBy({
      by: ['warehouseId'],
      _count: {
        warehouseId: true
      },
      _sum: {
        currentStock: true
      },
      where: stockCondition
    });

    const warehouseStockDetails = await Promise.all(
      stockByWarehouse.map(async (stock) => {
        const warehouse = await prisma.warehouse.findUnique({
          where: { id: stock.warehouseId },
          select: { code: true, name: true, location: true }
        });
        return {
          warehouse,
          itemCount: stock._count.warehouseId,
          totalStock: stock._sum.currentStock || 0
        };
      })
    );

    // 최근 거래 내역 (상위 5개)
    const recentTransactions = await prisma.materialTransaction.findMany({
      where: warehouseId ? { warehouseId } : {},
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        material: {
          select: {
            // code: true, // Material 모델에 code 필드 없음
            // name: true, // Material 모델에 name 필드 없음
            materialBase: {
              select: { name: true, unit: true }
            }
          }
        },
        warehouse: {
          select: { code: true, name: true }
        },
        user: {
          select: { name: true }
        }
      }
    });

    // 부족 재고 목록 (상위 10개)
    const lowStockList = await prisma.materialStock.findMany({
      where: {
        ...stockCondition,
        currentStock: { lte: prisma.materialStock.fields.safetyStock }
      },
      take: 10,
      orderBy: { currentStock: 'asc' },
      include: {
        material: {
          select: {
            // code: true, // Material 모델에 code 필드 없음
            // name: true, // Material 모델에 name 필드 없음
            materialBase: {
              select: { name: true, unit: true }
            }
          }
        },
        warehouse: {
          select: { code: true, name: true }
        },
        // color: {
        //   select: { code: true, name: true }
        // } // MaterialStock에 color 관계 없음
      }
    });

    // 월별 거래 추이 (최근 6개월)
    const monthlyTransactions = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return prisma.materialTransaction.groupBy({
          by: ['type'],
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            },
            ...(warehouseId && { warehouseId })
          },
          _count: { type: true },
          _sum: { totalPrice: true }
        }).then(result => ({
          month: date.toISOString().slice(0, 7), // YYYY-MM 형식
          transactions: result
        }));
      })
    );

    const summary = {
      overview: {
        totalMaterialBases,
        totalMaterials,
        totalWarehouses,
        totalSuppliers,
        totalColors,
        activeProjects
      },
      inventory: {
        totalStockItems,
        lowStockItems,
        outOfStockItems,
        totalStockValue: totalStockValue._sum.currentStock || 0,
        lowStockPercentage: totalStockItems > 0 ? 
          Math.round((lowStockItems / totalStockItems) * 100) : 0
      },
      transactions: {
        period: parseInt(period),
        totalTransactions,
        inTransactions,
        outTransactions,
        transactionValue: transactionValue._sum.totalPrice || 0,
        netFlow: inTransactions - outTransactions
      },
      distribution: {
        materialsByCategory: materialsByCategory.map(item => ({
          category: item.category,
          count: item._count.category
        })),
        stockByWarehouse: warehouseStockDetails
      },
      recent: {
        transactions: recentTransactions,
        lowStockItems: lowStockList
      },
      trends: {
        monthlyTransactions: monthlyTransactions.reverse() // 오래된 것부터 정렬
      }
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('자재 요약 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '자재 요약 정보를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
