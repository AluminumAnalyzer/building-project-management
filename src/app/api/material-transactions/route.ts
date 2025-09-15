import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CreateMaterialTransactionRequest } from "@/types/material";
import { Prisma } from "@prisma/client";

// GET /api/material-transactions - 자재 거래 내역 조회
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
    const materialId = searchParams.get("materialId") || "";
    const warehouseId = searchParams.get("warehouseId") || "";
    const supplierId = searchParams.get("supplierId") || "";
    const projectId = searchParams.get("projectId") || "";
    const type = searchParams.get("type") || ""; // IN, OUT
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: Prisma.MaterialTransactionWhereInput = {};

    if (materialId) {
      where.materialId = materialId;
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.OR = [
        { material: { size: { contains: search } } },
        { material: { finishType: { contains: search } } },
        { material: { materialBase: { name: { contains: search } } } },
        { material: { materialBase: { code: { contains: search } } } },
        { notes: { contains: search } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.materialTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
                  unit: true,
                },
              },
              color: {
                select: {
                  id: true,
                  code: true,
                  name: true,
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

          supplier: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.materialTransaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("거래 내역 조회 오류:", error);
    return NextResponse.json(
      { error: "거래 내역을 조회하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/material-transactions - 자재 입출고 처리
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body: CreateMaterialTransactionRequest = await request.json();

    // 필수 필드 검증
    if (!body.type || !body.materialId || !body.warehouseId || !body.quantity) {
      return NextResponse.json(
        { error: "거래 유형, 자재 ID, 창고 ID, 수량은 필수입니다." },
        { status: 400 }
      );
    }

    if (!["IN", "OUT"].includes(body.type)) {
      return NextResponse.json(
        { error: "거래 유형은 IN 또는 OUT이어야 합니다." },
        { status: 400 }
      );
    }

    if (body.quantity <= 0) {
      return NextResponse.json(
        { error: "수량은 0보다 커야 합니다." },
        { status: 400 }
      );
    }

    // 자재 존재 확인
    const material = await prisma.material.findUnique({
      where: { id: body.materialId },
    });

    if (!material) {
      return NextResponse.json(
        { error: "자재를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 창고 존재 확인
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: body.warehouseId },
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: "창고를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 거래처 존재 확인 (제공된 경우)
    if (body.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: body.supplierId },
      });

      if (!supplier) {
        return NextResponse.json(
          { error: "거래처를 찾을 수 없습니다." },
          { status: 404 }
        );
      }
    }

    // 프로젝트 존재 확인 (제공된 경우)
    if (body.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: body.projectId },
      });

      if (!project) {
        return NextResponse.json(
          { error: "프로젝트를 찾을 수 없습니다." },
          { status: 404 }
        );
      }
    }

    // 재고 조회 또는 생성
    let stock = await prisma.materialStock.findFirst({
      where: {
        materialId: body.materialId,
        warehouseId: body.warehouseId,
      },
    });

    // 트랜잭션으로 거래 내역 생성 및 재고 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 출고 시 재고 확인
      if (body.type === "OUT") {
        if (!stock) {
          throw new Error("재고가 존재하지 않습니다.");
        }

        if (stock.currentStock < body.quantity) {
          throw new Error("재고가 부족합니다.");
        }
      }

      // 재고가 없는 경우 생성 (입고 시)
      if (!stock && body.type === "IN") {
        stock = await tx.materialStock.create({
          data: {
            materialId: body.materialId,
            warehouseId: body.warehouseId,
            currentStock: 0,
            safetyStock: 0,
            unitPrice: body.unitPrice,
          },
        });
      }

      // 거래 내역 생성
      const transaction = await tx.materialTransaction.create({
        data: {
          type: body.type,
          materialId: body.materialId,
          warehouseId: body.warehouseId,
          quantity: body.quantity,
          unitPrice: body.unitPrice,
          totalPrice:
            body.totalPrice ||
            (body.unitPrice ? body.unitPrice * body.quantity : null),
          supplierId: body.supplierId,
          projectId: body.projectId,
          notes: body.notes,
          userId: session.user.id,
        },
      });

      // 재고 업데이트
      const newStock =
        body.type === "IN"
          ? stock!.currentStock + body.quantity
          : stock!.currentStock - body.quantity;

      await tx.materialStock.update({
        where: { id: stock!.id },
        data: {
          currentStock: newStock,
          ...(body.unitPrice && { unitPrice: body.unitPrice }),
          lastUpdated: new Date(),
        },
      });

      return transaction;
    });

    // 생성된 거래 내역 상세 정보 조회
    const createdTransaction = await prisma.materialTransaction.findUnique({
      where: { id: result.id },
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
                unit: true,
              },
            },
            color: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },

        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(createdTransaction, { status: 201 });
  } catch (error) {
    console.error("거래 처리 오류:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "거래를 처리하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
