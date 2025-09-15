import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/materials/inventory - 재고 현황 조회
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
    const warehouseId = searchParams.get("warehouseId") || "";
    const category = searchParams.get("category") || "";
    const colorId = searchParams.get("colorId") || "";
    const lowStock = searchParams.get("lowStock") === "true";
    const outOfStock = searchParams.get("outOfStock") === "true";
    const groupBy = searchParams.get("groupBy") || "material"; // material, category, warehouse, color
    const includeValue = searchParams.get("includeValue") === "true";

    // 기본 조건 구성
    const baseWhere: Prisma.MaterialStockWhereInput = {};

    if (warehouseId) {
      baseWhere.warehouseId = warehouseId;
    }

    // if (colorId) {
    //   baseWhere.colorId = colorId; // MaterialStock에 colorId 필드 없음
    // }

    if (category) {
      baseWhere.material = {
        materialBase: {
          category: category,
        },
      };
    }

    if (lowStock) {
      baseWhere.currentStock = { lte: prisma.materialStock.fields.safetyStock };
    }

    if (outOfStock) {
      baseWhere.currentStock = 0;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let inventoryData: any = [];

    switch (groupBy) {
      case "category":
        // 카테고리별 재고 현황
        inventoryData = await prisma.materialStock.groupBy({
          by: ["materialId"],
          where: baseWhere,
          _sum: {
            currentStock: true,
          },
          _count: {
            id: true,
          },
          _avg: {
            unitPrice: true,
          },
        });

        // 카테고리 정보와 함께 결과 구성
        const categoryResults = await Promise.all(
          inventoryData.map(
            async (item: {
              materialId: string;
              _sum: { currentStock: number | null };
              _count: { id: number };
              _avg: { unitPrice: number | null };
            }) => {
              const material = await prisma.material.findUnique({
                where: { id: item.materialId },
                select: {
                  materialBase: {
                    select: {
                      category: true,
                      unit: true,
                    },
                  },
                },
              });
              return {
                category: material?.materialBase.category,
                unit: material?.materialBase.unit,
                totalStock: item._sum.currentStock || 0,
                itemCount: item._count.id,
                averagePrice: item._avg.unitPrice || 0,
              };
            }
          )
        );

        // 카테고리별로 그룹화
        const groupedByCategory = categoryResults.reduce(
          (
            acc: Record<
              string,
              {
                category: string;
                totalStock: number;
                itemCount: number;
                averagePrice: number;
                totalValue: number;
              }
            >,
            item
          ) => {
            const category = item.category || "Unknown";
            if (!acc[category]) {
              acc[category] = {
                category,
                totalStock: 0,
                itemCount: 0,
                averagePrice: 0,
                totalValue: 0,
              };
            }
            acc[category].totalStock += item.totalStock;
            acc[category].itemCount += item.itemCount;
            acc[category].averagePrice =
              (acc[category].averagePrice + item.averagePrice) / 2;
            if (includeValue) {
              acc[category].totalValue += item.totalStock * item.averagePrice;
            }
            return acc;
          },
          {}
        );

        inventoryData = Object.values(groupedByCategory);
        break;

      case "warehouse":
        // 창고별 재고 현황
        const warehouseStocks = await prisma.materialStock.groupBy({
          by: ["warehouseId"],
          where: baseWhere,
          _sum: {
            currentStock: true,
          },
          _count: {
            id: true,
          },
          _avg: {
            unitPrice: true,
          },
        });

        inventoryData = await Promise.all(
          warehouseStocks.map(async (stock) => {
            const warehouse = await prisma.warehouse.findUnique({
              where: { id: stock.warehouseId },
              select: {
                code: true,
                name: true,
                location: true,
                // capacity: true // Warehouse 모델에 capacity 필드 없음
              },
            });

            const lowStockCount = await prisma.materialStock.count({
              where: {
                warehouseId: stock.warehouseId,
                currentStock: { lte: prisma.materialStock.fields.safetyStock },
              },
            });

            return {
              warehouse,
              totalStock: stock._sum.currentStock || 0,
              itemCount: stock._count.id,
              lowStockCount,
              averagePrice: stock._avg.unitPrice || 0,
              totalValue: includeValue
                ? (stock._sum.currentStock || 0) * (stock._avg.unitPrice || 0)
                : 0,
              utilizationRate: null, // warehouse.capacity 필드 없음
              // utilizationRate: warehouse?.capacity ?
              //   Math.round(((stock._count.id / warehouse.capacity) * 100)) : null
            };
          })
        );
        break;

      case "color":
        // 색상별 재고 현황 - MaterialStock에 colorId 필드 없음으로 전체 비활성화
        inventoryData = [];
        break;

      default:
        // 자재별 상세 재고 현황
        inventoryData = await prisma.materialStock.findMany({
          where: baseWhere,
          include: {
            material: {
              select: {
                id: true,
                // code: true, // Material 모델에 code 필드 없음
                // name: true, // Material 모델에 name 필드 없음
                size: true,
                materialBase: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    category: true,
                    unit: true,
                    specification: true,
                  },
                },
              },
            },
            warehouse: {
              select: {
                id: true,
                code: true,
                name: true,
                location: true,
              },
            },
            // color: { // MaterialStock에 color 관계 없음
            //   select: {
            //     id: true,
            //     code: true,
            //     name: true,
            //     finishType: true
            //   }
            // }
          },
          orderBy: [
            { currentStock: "asc" }, // 재고 부족한 것부터
            // { material: { name: 'asc' } } // Material에 name 필드 없음
          ],
        });

        // 추가 계산 정보 포함
        inventoryData = inventoryData.map((stock: {
          id: string;
          materialId: string;
          warehouseId: string;
          currentStock: number;
          safetyStock: number;
          unitPrice: number | null;
          material: {
            id: string;
            size: string | null;
            materialBase: {
              id: string;
              code: string;
              name: string;
              category: string;
              unit: string;
              specification: string | null;
            };
          };
          warehouse: {
            id: string;
            code: string;
            name: string;
            location: string | null;
          };
        }) => ({
          ...stock,
          isLowStock: stock.currentStock <= stock.safetyStock,
          isOutOfStock: stock.currentStock === 0,
          stockValue: includeValue
            ? stock.currentStock * (stock.unitPrice || 0)
            : 0,
          shortage:
            stock.currentStock < stock.safetyStock
              ? stock.safetyStock - stock.currentStock
              : 0,
          stockStatus:
            stock.currentStock === 0
              ? "OUT_OF_STOCK"
              : stock.currentStock <= stock.safetyStock
              ? "LOW_STOCK"
              : "NORMAL",
        }));
        break;
    }

    // 전체 통계 계산
    const totalStats = await prisma.materialStock.aggregate({
      where: baseWhere,
      _sum: {
        currentStock: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        unitPrice: true,
      },
    });

    const lowStockCount = await prisma.materialStock.count({
      where: {
        ...baseWhere,
        currentStock: { lte: prisma.materialStock.fields.safetyStock },
      },
    });

    const outOfStockCount = await prisma.materialStock.count({
      where: {
        ...baseWhere,
        currentStock: 0,
      },
    });

    const response = {
      inventory: inventoryData,
      summary: {
        totalItems: totalStats._count.id,
        totalStock: totalStats._sum.currentStock || 0,
        averagePrice: totalStats._avg.unitPrice || 0,
        totalValue: includeValue
          ? (totalStats._sum.currentStock || 0) *
            (totalStats._avg.unitPrice || 0)
          : 0,
        lowStockCount,
        outOfStockCount,
        normalStockCount:
          totalStats._count.id - lowStockCount - outOfStockCount,
        lowStockPercentage:
          totalStats._count.id > 0
            ? Math.round((lowStockCount / totalStats._count.id) * 100)
            : 0,
      },
      groupBy,
      filters: {
        warehouseId,
        category,
        colorId,
        lowStock,
        outOfStock,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("재고 현황 조회 오류:", error);
    return NextResponse.json(
      { error: "재고 현황을 조회하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
