import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UpdateMaterialColorRequest } from '@/types/material';

// GET /api/material-colors/[id] - 자재 색상 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeFiles = searchParams.get('includeFiles') === 'true';

    const materialColor = await prisma.materialColor.findUnique({
      where: { id: params.id },
      include: {
        materials: {
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
                transactions: true
              }
            }
          }
        },
        files: includeFiles ? {
          include: {
            file: {
              select: {
                id: true,
                fileName: true,
                originalName: true,
                mimeType: true,
                size: true,
                thumbnailUrl: true,
                url: true,
                extension: true
              }
            }
          },
          orderBy: { order: 'asc' }
        } : false,
        _count: {
          select: {
            materials: true
          }
        }
      }
    });

    if (!materialColor) {
      return NextResponse.json(
        { error: '자재 색상을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 색상별 총 재고량 계산
    const totalStock = materialColor.materials.reduce((sum, material) => {
      return sum + material.stocks.reduce((stockSum, stock) => stockSum + stock.currentStock, 0);
    }, 0);

    return NextResponse.json({
      ...materialColor,
      totalStock
    });
  } catch (error) {
    console.error('자재 색상 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '자재 색상 정보를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/material-colors/[id] - 자재 색상 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body: UpdateMaterialColorRequest = await request.json();

    // 색상 존재 확인
    const existingColor = await prisma.materialColor.findUnique({
      where: { id: params.id }
    });

    if (!existingColor) {
      return NextResponse.json(
        { error: '자재 색상을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 코드 변경 시 중복 확인
    if (body.code && body.code !== existingColor.code) {
      const duplicateCode = await prisma.materialColor.findUnique({
        where: { code: body.code }
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: '이미 존재하는 색상 코드입니다.' },
          { status: 409 }
        );
      }
    }

    const updatedMaterialColor = await prisma.materialColor.update({
      where: { id: params.id },
      data: {
        ...(body.code && { code: body.code }),
        ...(body.name && { name: body.name }),
        ...(body.finishType !== undefined && { finishType: body.finishType }),
        ...(body.colorImage !== undefined && { colorImage: body.colorImage })
      },
      include: {
        materials: {
          select: {
            id: true,
            size: true,
            finishType: true,
            materialBase: {
              select: {
                code: true,
                name: true,
                category: true
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
    });

    return NextResponse.json(updatedMaterialColor);
  } catch (error) {
    console.error('자재 색상 수정 오류:', error);
    return NextResponse.json(
      { error: '자재 색상 정보를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/material-colors/[id] - 자재 색상 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 색상 존재 확인 및 연관 데이터 조회
    const existingColor = await prisma.materialColor.findUnique({
      where: { id: params.id },
      include: {
        materials: true
      }
    });

    if (!existingColor) {
      return NextResponse.json(
        { error: '자재 색상을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 연관된 자재가 있는지 확인
    if (existingColor.materials.length > 0) {
      return NextResponse.json(
        { error: '사용 중인 색상은 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    await prisma.materialColor.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: '자재 색상이 삭제되었습니다.' });
  } catch (error) {
    console.error('자재 색상 삭제 오류:', error);
    return NextResponse.json(
      { error: '자재 색상을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
