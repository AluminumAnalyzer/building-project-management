import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const createRelationSchema = z.object({
  colorId: z.string().min(1, '색상 ID는 필수입니다'),
  fileId: z.string().min(1, '파일 ID는 필수입니다'),
  role: z.string().min(1, '파일 역할은 필수입니다'),
  order: z.number().int().min(0, '순서는 0 이상이어야 합니다').default(0),
});

// POST /api/material-colors/files - 색상-파일 관계 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createRelationSchema.parse(body);

    // 색상 존재 확인
    const materialColor = await prisma.materialColor.findUnique({
      where: { id: validatedData.colorId }
    });

    if (!materialColor) {
      return NextResponse.json(
        { error: '존재하지 않는 색상입니다.' },
        { status: 404 }
      );
    }

    // 파일 존재 확인
    const file = await prisma.file.findUnique({
      where: { id: validatedData.fileId }
    });

    if (!file) {
      return NextResponse.json(
        { error: '존재하지 않는 파일입니다.' },
        { status: 404 }
      );
    }

    // 기존 관계가 있는지 확인
    const existingRelation = await prisma.materialColorFile.findFirst({
      where: {
        colorId: validatedData.colorId,
        fileId: validatedData.fileId,
      }
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: '이미 존재하는 관계입니다.' },
        { status: 409 }
      );
    }

    // 관계 생성
    const relation = await prisma.materialColorFile.create({
      data: {
        colorId: validatedData.colorId,
        fileId: validatedData.fileId,
        role: validatedData.role,
        order: validatedData.order,
      },
      include: {
        file: {
          select: {
            id: true,
            fileName: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
            thumbnailUrl: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: relation,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('색상-파일 관계 생성 오류:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: '입력 데이터가 올바르지 않습니다.',
          details: error.errors,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: '색상-파일 관계를 생성하는 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// DELETE /api/material-colors/files - 색상-파일 관계 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const colorId = searchParams.get('colorId');
    const fileId = searchParams.get('fileId');

    if (!colorId || !fileId) {
      return NextResponse.json(
        { error: '색상 ID와 파일 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 관계 존재 확인 및 삭제
    const deletedRelation = await prisma.materialColorFile.deleteMany({
      where: {
        colorId,
        fileId,
      }
    });

    if (deletedRelation.count === 0) {
      return NextResponse.json(
        { error: '존재하지 않는 관계입니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '색상-파일 관계가 삭제되었습니다.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('색상-파일 관계 삭제 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '색상-파일 관계를 삭제하는 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
