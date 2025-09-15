import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types/api';
import type { BOMFileRelation } from '@/types/file';

interface RouteParams {
  params: {
    id: string;
  };
}

// BOM 파일 목록 조회
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

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;

    // BOM 존재 확인
    const bom = await prisma.bOM.findUnique({
      where: { id: params.id },
    });

    if (!bom) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'BOM을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // BOM 파일 관계 조회
    const bomFiles = await prisma.bOMFile.findMany({
      where: {
        bomId: params.id,
        ...(role && { role }),
      },
      include: {
        file: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const response: BOMFileRelation[] = bomFiles.map(bf => ({
      id: bf.id,
      bomId: bf.bomId,
      fileId: bf.fileId,
      role: bf.role,
      order: bf.order,
      createdAt: bf.createdAt,
      updatedAt: bf.updatedAt,
      file: bf.file,
    }));

    return NextResponse.json<ApiResponse<BOMFileRelation[]>>({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('BOM files get error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'BOM 파일 조회 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// BOM에 파일 연결
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

    const body = await request.json();
    const { fileId, role = 'ATTACHMENT', order = 0 } = body;

    if (!fileId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일 ID가 필요합니다.',
      }, { status: 400 });
    }

    // BOM 존재 확인
    const bom = await prisma.bOM.findUnique({
      where: { id: params.id },
    });

    if (!bom) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'BOM을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 파일 존재 확인 및 권한 체크
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 파일 접근 권한 체크
    if (session.user.role !== 'ADMIN' && 
        file.uploadedById !== session.user.id && 
        !file.isPublic) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일에 접근할 권한이 없습니다.',
      }, { status: 403 });
    }

    // 이미 연결된 파일인지 확인
    const existingRelation = await prisma.bOMFile.findFirst({
      where: {
        bomId: params.id,
        fileId,
      },
    });

    if (existingRelation) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '이미 연결된 파일입니다.',
      }, { status: 400 });
    }

    // BOM-파일 관계 생성
    const bomFile = await prisma.bOMFile.create({
      data: {
        bomId: params.id,
        fileId,
        role,
        order,
      },
      include: {
        file: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const response: BOMFileRelation = {
      id: bomFile.id,
      bomId: bomFile.bomId,
      fileId: bomFile.fileId,
      role: bomFile.role,
      order: bomFile.order,
      createdAt: bomFile.createdAt,
      updatedAt: bomFile.updatedAt,
      file: bomFile.file,
    };

    return NextResponse.json<ApiResponse<BOMFileRelation>>({
      success: true,
      data: response,
      message: '파일이 BOM에 성공적으로 연결되었습니다.',
    });

  } catch (error) {
    console.error('BOM file attach error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'BOM 파일 연결 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// BOM-파일 관계 수정
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

    const body = await request.json();
    const { fileId, role, order } = body;

    if (!fileId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일 ID가 필요합니다.',
      }, { status: 400 });
    }

    // BOM-파일 관계 존재 확인
    const bomFile = await prisma.bOMFile.findFirst({
      where: {
        bomId: params.id,
        fileId,
      },
    });

    if (!bomFile) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'BOM-파일 관계를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // BOM-파일 관계 수정
    const updatedBomFile = await prisma.bOMFile.update({
      where: { id: bomFile.id },
      data: {
        ...(role !== undefined && { role }),
        ...(order !== undefined && { order }),
      },
      include: {
        file: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const response: BOMFileRelation = {
      id: updatedBomFile.id,
      bomId: updatedBomFile.bomId,
      fileId: updatedBomFile.fileId,
      role: updatedBomFile.role,
      order: updatedBomFile.order,
      createdAt: updatedBomFile.createdAt,
      updatedAt: updatedBomFile.updatedAt,
      file: updatedBomFile.file,
    };

    return NextResponse.json<ApiResponse<BOMFileRelation>>({
      success: true,
      data: response,
      message: 'BOM-파일 관계가 성공적으로 수정되었습니다.',
    });

  } catch (error) {
    console.error('BOM file update error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'BOM-파일 관계 수정 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// BOM-파일 관계 삭제
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

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일 ID가 필요합니다.',
      }, { status: 400 });
    }

    // BOM-파일 관계 존재 확인
    const bomFile = await prisma.bOMFile.findFirst({
      where: {
        bomId: params.id,
        fileId,
      },
    });

    if (!bomFile) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'BOM-파일 관계를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // BOM-파일 관계 삭제
    await prisma.bOMFile.delete({
      where: { id: bomFile.id },
    });

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: 'BOM-파일 관계가 성공적으로 삭제되었습니다.',
    });

  } catch (error) {
    console.error('BOM file delete error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'BOM-파일 관계 삭제 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}
