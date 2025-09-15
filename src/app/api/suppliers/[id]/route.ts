import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UpdateSupplierRequest } from '@/types/material';

// GET /api/suppliers/[id] - 거래처 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        // materials: {
        //   include: {
        //     material: {
        //       select: {
        //         id: true,
        //         code: true,
        //         name: true,
        //         unit: true,
        //         unitPrice: true
        //       }
        //     }
        //   }
        // }, // MaterialSupplier에 material 관계 없음
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            material: {
              select: { 
                id: true
                // name: true, code: true // Material 모델에 없음
              }
            },
            warehouse: {
              select: { name: true, code: true }
            }
          }
        },
        _count: {
          select: {
            materials: true,
            transactions: true
          }
        }
      }
    });

    if (!supplier) {
      return NextResponse.json({ error: '거래처를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('거래처 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '거래처 정보를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/suppliers/[id] - 거래처 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body: UpdateSupplierRequest = await request.json();

    // 거래처 존재 확인
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: params.id }
    });

    if (!existingSupplier) {
      return NextResponse.json({ error: '거래처를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 거래처 코드 중복 확인 (다른 거래처와)
    if (body.code && body.code !== existingSupplier.code) {
      const duplicateSupplier = await prisma.supplier.findUnique({
        where: { code: body.code }
      });

      if (duplicateSupplier) {
        return NextResponse.json(
          { error: '이미 존재하는 거래처 코드입니다.' },
          { status: 409 }
        );
      }
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        ...(body.code && { code: body.code }),
        ...(body.name && { name: body.name }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.contactPerson !== undefined && { contactPerson: body.contactPerson }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.fax !== undefined && { fax: body.fax }),
        ...(body.type && { type: body.type }),
        ...(body.businessLicense !== undefined && { businessLicense: body.businessLicense }),
        ...(body.isActive !== undefined && { isActive: body.isActive })
      }
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error('거래처 수정 오류:', error);
    return NextResponse.json(
      { error: '거래처 정보를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id] - 거래처 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 거래처 존재 확인
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            materials: true,
            transactions: true
          }
        }
      }
    });

    if (!existingSupplier) {
      return NextResponse.json({ error: '거래처를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 연관된 데이터가 있는지 확인
    if (existingSupplier._count.materials > 0 || existingSupplier._count.transactions > 0) {
      return NextResponse.json(
        { error: '연관된 자재 또는 거래 내역이 있어 삭제할 수 없습니다.' },
        { status: 409 }
      );
    }

    await prisma.supplier.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: '거래처가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('거래처 삭제 오류:', error);
    return NextResponse.json(
      { error: '거래처를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
