import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import type { ApiResponse } from '@/types/api';
import type { FileWithRelations } from '@/types/file';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '인증이 필요합니다.',
      }, { status: 401 });
    }

    const file = await prisma.file.findUnique({
      where: { id: params.id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 권한 체크 - 본인 파일이거나 공개 파일만 조회 가능
    if (session.user.role !== 'ADMIN' && 
        file.uploadedById !== session.user.id && 
        !file.isPublic) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일에 접근할 권한이 없습니다.',
      }, { status: 403 });
    }

    return NextResponse.json<ApiResponse<FileWithRelations>>({
      success: true,
      data: file,
    });

  } catch (error) {
    console.error('File get error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '파일 조회 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '인증이 필요합니다.',
      }, { status: 401 });
    }

    const file = await prisma.file.findUnique({
      where: { id: params.id },
    });

    if (!file) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 권한 체크 - 본인 파일이거나 관리자만 삭제 가능
    if (session.user.role !== 'ADMIN' && file.uploadedById !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일을 삭제할 권한이 없습니다.',
      }, { status: 403 });
    }

    // 파일 시스템에서 파일 삭제
    try {
      const fullPath = join(process.cwd(), 'public', file.filePath);
      if (existsSync(fullPath)) {
        await unlink(fullPath);
      }

      // 썸네일이 있다면 삭제
      if (file.thumbnailUrl) {
        const thumbnailPath = join(process.cwd(), 'public', file.thumbnailUrl);
        if (existsSync(thumbnailPath)) {
          await unlink(thumbnailPath);
        }
      }
    } catch (fsError) {
      console.warn('File system deletion error:', fsError);
      // 파일 시스템 오류는 로그만 남기고 계속 진행
    }

    // 데이터베이스에서 파일 정보 삭제
    await prisma.file.delete({
      where: { id: params.id },
    });

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: '파일이 성공적으로 삭제되었습니다.',
    });

  } catch (error) {
    console.error('File delete error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '파일 삭제 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '인증이 필요합니다.',
      }, { status: 401 });
    }

    const file = await prisma.file.findUnique({
      where: { id: params.id },
    });

    if (!file) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 권한 체크 - 본인 파일이거나 관리자만 수정 가능
    if (session.user.role !== 'ADMIN' && file.uploadedById !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일을 수정할 권한이 없습니다.',
      }, { status: 403 });
    }

    const body = await request.json();
    const { description, tags, isPublic } = body;

    const updatedFile = await prisma.file.update({
      where: { id: params.id },
      data: {
        description: description !== undefined ? description : file.description,
        tags: tags !== undefined ? tags : file.tags,
        isPublic: isPublic !== undefined ? isPublic : file.isPublic,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse<FileWithRelations>>({
      success: true,
      data: updatedFile,
      message: '파일 정보가 성공적으로 업데이트되었습니다.',
    });

  } catch (error) {
    console.error('File update error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '파일 업데이트 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}
