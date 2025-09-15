import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UpdateMaterialBaseRequest } from '@/types/api-requests';

// GET /api/material-bases/[id] - 기본 자재 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const materialBase = await prisma.materialBase.findUnique({
      where: { id: params.id },
      include: {
        materials: {
          include: {
            color: true,
            stocks: {
              include: {
                warehouse: true
              }
            },
            transactions: {
              take: 10,
              orderBy: { createdAt: 'desc' },
              include: {
                warehouse: true,
                user: {
                  select: { id: true, name: true, email: true }
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
        },
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

    if (!materialBase) {
      return NextResponse.json(
        { error: '기본 자재를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(materialBase);
  } catch (error) {
    console.error('기본 자재 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '기본 자재 정보를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/material-bases/[id] - 기본 자재 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body: UpdateMaterialBaseRequest = await request.json();

    // 기본 자재 존재 확인
    const existingMaterialBase = await prisma.materialBase.findUnique({
      where: { id: params.id }
    });

    if (!existingMaterialBase) {
      return NextResponse.json(
        { error: '기본 자재를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 코드 변경 시 중복 확인
    if (body.code && body.code !== existingMaterialBase.code) {
      const duplicateCode = await prisma.materialBase.findUnique({
        where: { code: body.code }
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: '이미 존재하는 자재 코드입니다.' },
          { status: 409 }
        );
      }
    }

    // suppliers 배열이 제공된 경우 관계 업데이트
    if (body.suppliers !== undefined) {
      // 기존 suppliers 관계 삭제
      await prisma.materialSupplier.deleteMany({
        where: { materialBaseId: params.id }
      });

      // 새로운 suppliers 관계 생성
      if (body.suppliers.length > 0) {
        await prisma.materialSupplier.createMany({
          data: body.suppliers.map((supplierId: string) => ({
            materialBaseId: params.id,
            supplierId,
            createdById: session.user.id
          }))
        });
      }
    }

    const updatedMaterialBase = await prisma.materialBase.update({
      where: { id: params.id },
      data: {
        ...(body.code && { code: body.code }),
        ...(body.name && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.specification !== undefined && { specification: body.specification }),
        ...(body.unit && { unit: body.unit }),
        ...(body.unitPrice !== undefined && { unitPrice: body.unitPrice }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.isActive !== undefined && { isActive: body.isActive })
      },
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

    return NextResponse.json(updatedMaterialBase);
  } catch (error) {
    console.error('기본 자재 수정 오류:', error);
    return NextResponse.json(
      { error: '기본 자재 정보를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/material-bases/[id] - 기본 자재 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 기본 자재 존재 확인
    const existingMaterialBase = await prisma.materialBase.findUnique({
      where: { id: params.id },
      include: {
        materials: {
          include: {
            stocks: true,
            transactions: true
          }
        }
      }
    });

    if (!existingMaterialBase) {
      return NextResponse.json(
        { error: '기본 자재를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 연관된 자재 인스턴스가 있는지 확인
    if (existingMaterialBase.materials.length > 0) {
      const hasStockOrTransactions = existingMaterialBase.materials.some(
        material => material.stocks.length > 0 || material.transactions.length > 0
      );

      if (hasStockOrTransactions) {
        return NextResponse.json(
          { error: '재고나 거래 내역이 있는 자재는 삭제할 수 없습니다.' },
          { status: 400 }
        );
      }
    }

    // 트랜잭션으로 연관 데이터와 함께 삭제
    await prisma.$transaction(async (tx) => {
      // 연관된 자재 인스턴스들 먼저 삭제
      await tx.material.deleteMany({
        where: { materialBaseId: params.id }
      });

      // 기본 자재 삭제
      await tx.materialBase.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ message: '기본 자재가 삭제되었습니다.' });
  } catch (error) {
    console.error('기본 자재 삭제 오류:', error);
    return NextResponse.json(
      { error: '기본 자재를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
