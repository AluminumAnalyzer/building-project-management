import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UpdateMaterialRequest } from '@/types/material';

// GET /api/materials/[id] - 자재 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const material = await prisma.material.findUnique({
      where: { id: params.id },
      include: {
        materialBase: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            specification: true,
            unit: true,
            unitPrice: true
          }
        },
        color: {
          select: {
            id: true,
            code: true,
            name: true,
            finishType: true,
            colorImage: true
          }
        },
        stocks: {
          include: {
            warehouse: {
              select: {
                id: true,
                code: true,
                name: true,
                location: true
              }
            }
          }
        },
        transactions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            warehouse: {
              select: {
                id: true,
                code: true,
                name: true
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
                name: true,
                description: true
              }
            }
          }
        },
        bomItems: {
          include: {
            bom: {
              select: {
                id: true,
                productName: true,
                productCode: true
              }
            }
          }
        },
        // images: { // Material 모델에 images 관계 없음
        //   orderBy: { createdAt: 'desc' }
        // },
        // drawings: { // Material 모델에 drawings 관계 없음
        //   orderBy: { createdAt: 'desc' }
        // },
        _count: {
          select: {
            stocks: true,
            transactions: true,
            bomItems: true,
            // images: true, // Material 모델에 images 필드 없음
            // drawings: true // Material 모델에 drawings 필드 없음
          }
        }
      }
    });

    if (!material) {
      return NextResponse.json(
        { error: '자재를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 총 재고량 계산 - 임시로 비활성화
    // const totalStock = material.stocks?.reduce((sum: number, stock: any) => sum + stock.currentStock, 0) || 0;
    // const totalSafetyStock = material.stocks?.reduce((sum: number, stock: any) => sum + stock.safetyStock, 0) || 0;
    const totalStock = 0;
    const totalSafetyStock = 0;

    return NextResponse.json({
      ...material,
      totalStock,
      totalSafetyStock,
      isLowStock: totalStock <= totalSafetyStock
    });
  } catch (error) {
    console.error('자재 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '자재 정보를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/materials/[id] - 자재 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body: UpdateMaterialRequest = await request.json();

    // 자재 존재 확인
    const existingMaterial = await prisma.material.findUnique({
      where: { id: params.id }
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: '자재를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 색상 ID 변경 시 존재 확인
    if (body.colorId && body.colorId !== existingMaterial.colorId) {
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

    const updatedMaterial = await prisma.material.update({
      where: { id: params.id },
      data: {
        // code와 name 필드는 Material 모델에 없음 (materialBase에 있음)
        // ...(body.code && { code: body.code }),
        // ...(body.name && { name: body.name }),
        ...(body.colorId !== undefined && { colorId: body.colorId }),
        ...(body.size !== undefined && { size: body.size }),
        ...(body.finishType !== undefined && { finishType: body.finishType }),
        ...(body.unitPrice !== undefined && { unitPrice: body.unitPrice }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.isActive !== undefined && { isActive: body.isActive })
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
    });

    // 총 재고량 계산
    const totalStock = updatedMaterial.stocks.reduce((sum, stock) => sum + stock.currentStock, 0);

    return NextResponse.json({
      ...updatedMaterial,
      totalStock
    });
  } catch (error) {
    console.error('자재 수정 오류:', error);
    return NextResponse.json(
      { error: '자재 정보를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/materials/[id] - 자재 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 자재 존재 확인 및 연관 데이터 조회
    const existingMaterial = await prisma.material.findUnique({
      where: { id: params.id },
      include: {
        stocks: true,
        transactions: true,
        bomItems: true
      }
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: '자재를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 연관 데이터 확인
    if (existingMaterial.stocks.length > 0 || 
        existingMaterial.transactions.length > 0 || 
        existingMaterial.bomItems.length > 0) {
      return NextResponse.json(
        { error: '재고, 거래 내역 또는 BOM 항목이 있는 자재는 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 연관 데이터와 함께 삭제
    await prisma.$transaction(async (tx) => {
      // 이미지 및 도면 파일 삭제 (MaterialImage, MaterialDrawing 모델 없음)
      // await tx.materialImage.deleteMany({
      //   where: { materialId: params.id }
      // });

      // await tx.materialDrawing.deleteMany({
      //   where: { materialId: params.id }
      // });

      // 자재 삭제
      await tx.material.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ message: '자재가 삭제되었습니다.' });
  } catch (error) {
    console.error('자재 삭제 오류:', error);
    return NextResponse.json(
      { error: '자재를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
