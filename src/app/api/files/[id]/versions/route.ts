import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processFileUpload } from '@/lib/file-upload';
import type { ApiResponse } from '@/types/api';
import type { FileWithRelations, FileUploadResponse } from '@/types/file';

interface RouteParams {
  params: {
    id: string;
  };
}

// 파일 버전 목록 조회
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

    // 권한 체크
    if (session.user.role !== 'ADMIN' && 
        file.uploadedById !== session.user.id && 
        !file.isPublic) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일에 접근할 권한이 없습니다.',
      }, { status: 403 });
    }

    // 최상위 파일 ID 찾기 (parentFileId가 null인 파일)
    let rootFileId = params.id;
    let currentFile = file;
    
    while (currentFile.parentFileId) {
      const parentFile = await prisma.file.findUnique({
        where: { id: currentFile.parentFileId },
      });
      if (parentFile) {
        rootFileId = parentFile.id;
        currentFile = parentFile;
      } else {
        break;
      }
    }

    // 모든 버전 조회 (루트 파일과 그 하위 버전들)
    const versions = await prisma.file.findMany({
      where: {
        OR: [
          { id: rootFileId },
          { parentFileId: rootFileId },
        ],
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
      orderBy: {
        version: 'desc',
      },
    });

    return NextResponse.json<ApiResponse<FileWithRelations[]>>({
      success: true,
      data: versions,
    });

  } catch (error) {
    console.error('File versions get error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '파일 버전 조회 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 새 버전 업로드
export async function POST(
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

    const originalFile = await prisma.file.findUnique({
      where: { id: params.id },
    });

    if (!originalFile) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '원본 파일을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 권한 체크 - 본인 파일이거나 관리자만 새 버전 업로드 가능
    if (session.user.role !== 'ADMIN' && originalFile.uploadedById !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일을 수정할 권한이 없습니다.',
      }, { status: 403 });
    }

    // FormData에서 파일과 추가 정보 추출
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string || undefined;
    
    if (!file || file.size === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일이 선택되지 않았습니다.',
      }, { status: 400 });
    }

    // 파일 타입이 원본과 같은지 확인
    if (file.type !== originalFile.mimeType) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '원본 파일과 같은 타입의 파일만 업로드할 수 있습니다.',
      }, { status: 400 });
    }

    // 파일 업로드 처리
    const uploadedFileInfo = await processFileUpload(file);

    // 최상위 파일 ID 찾기
    let rootFileId = params.id;
    if (originalFile.parentFileId) {
      rootFileId = originalFile.parentFileId;
    }

    // 현재 최신 버전 번호 조회
    const latestVersion = await prisma.file.findFirst({
      where: {
        OR: [
          { id: rootFileId },
          { parentFileId: rootFileId },
        ],
      },
      orderBy: {
        version: 'desc',
      },
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 기존 파일들의 isLatest를 false로 변경
      await tx.file.updateMany({
        where: {
          OR: [
            { id: rootFileId },
            { parentFileId: rootFileId },
          ],
        },
        data: {
          isLatest: false,
        },
      });

      // 새 버전 파일 생성
      const newFile = await tx.file.create({
        data: {
          originalName: uploadedFileInfo.originalName,
          fileName: uploadedFileInfo.storedName,
          filePath: uploadedFileInfo.path,
          url: uploadedFileInfo.url,
          size: uploadedFileInfo.size,
          mimeType: uploadedFileInfo.mimeType,
          extension: uploadedFileInfo.extension,
          category: uploadedFileInfo.category,
          description: description || originalFile.description,
          tags: originalFile.tags,
          isPublic: originalFile.isPublic,
          downloadCount: 0,
          width: uploadedFileInfo.width || null,
          height: uploadedFileInfo.height || null,
          thumbnailUrl: uploadedFileInfo.thumbnailUrl || null,
          version: newVersion,
          parentFileId: rootFileId,
          isLatest: true,
          uploadedById: session.user.id,
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

      return newFile;
    });

    const response: FileUploadResponse = {
      success: true,
      file: result,
    };

    return NextResponse.json<ApiResponse<FileUploadResponse>>({
      success: true,
      data: response,
      message: `파일의 새 버전(v${newVersion})이 성공적으로 업로드되었습니다.`,
    });

  } catch (error) {
    console.error('File version upload error:', error);
    
    const errorMessage = error instanceof Error ? error.message : '파일 버전 업로드 중 오류가 발생했습니다.';
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}
