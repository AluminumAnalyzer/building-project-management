import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// DELETE /api/material-colors/[id]/files - 특정 색상의 모든 파일 관계 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const colorId = params.id;

    // 색상 존재 확인
    const materialColor = await prisma.materialColor.findUnique({
      where: { id: colorId }
    });

    if (!materialColor) {
      return NextResponse.json(
        { error: '존재하지 않는 색상입니다.' },
        { status: 404 }
      );
    }

    // 해당 색상의 모든 파일 관계 삭제
    const deletedRelations = await prisma.materialColorFile.deleteMany({
      where: {
        colorId: colorId,
      }
    });

    return NextResponse.json({
      success: true,
      message: `${deletedRelations.count}개의 파일 관계가 삭제되었습니다.`,
      count: deletedRelations.count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('색상 파일 관계 삭제 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '색상 파일 관계를 삭제하는 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
