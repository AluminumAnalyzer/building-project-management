import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import type { ApiResponse } from '@/types/api';

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
    });

    if (!file) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 권한 체크 - 본인 파일이거나 공개 파일만 다운로드 가능
    if (session.user.role !== 'ADMIN' && 
        file.uploadedById !== session.user.id && 
        !file.isPublic) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일에 접근할 권한이 없습니다.',
      }, { status: 403 });
    }

    // 파일 경로 확인
    const fullPath = join(process.cwd(), 'public', file.filePath);
    
    if (!existsSync(fullPath)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    try {
      // 파일 읽기
      const fileBuffer = await readFile(fullPath);

      // 다운로드 횟수 증가
      await prisma.file.update({
        where: { id: params.id },
        data: {
          downloadCount: {
            increment: 1,
          },
        },
      });

      // 파일 다운로드 응답
      const response = new NextResponse(fileBuffer);
      
      // 헤더 설정
      response.headers.set('Content-Type', file.mimeType);
      response.headers.set('Content-Length', file.size.toString());
      response.headers.set(
        'Content-Disposition', 
        `attachment; filename="${encodeURIComponent(file.originalName)}"`
      );
      response.headers.set('Cache-Control', 'private, max-age=0');

      return response;

    } catch (fileError) {
      console.error('File read error:', fileError);
      
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일을 읽을 수 없습니다.',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('File download error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '파일 다운로드 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}
