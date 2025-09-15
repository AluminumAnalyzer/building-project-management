import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types/api';
import type { MaterialFileRelation } from '@/types/file';

interface RouteParams {
  params: {
    id: string;
  };
}

// 자재 파일 목록 조회
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

    // 자재 존재 확인
    const material = await prisma.material.findUnique({
      where: { id: params.id },
    });

    if (!material) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '자재를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 자재 파일 관계 조회
    const materialFiles = await prisma.materialFile.findMany({
      where: {
        materialId: params.id,
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

    const response: MaterialFileRelation[] = materialFiles.map(mf => ({
      id: mf.id,
      materialId: mf.materialId,
      fileId: mf.fileId,
      role: mf.role,
      order: mf.order,
      createdAt: mf.createdAt,
      updatedAt: mf.updatedAt,
      file: mf.file,
    }));

    return NextResponse.json<ApiResponse<MaterialFileRelation[]>>({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('Material files get error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '자재 파일 조회 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 자재에 파일 연결
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

    // 자재 존재 확인
    const material = await prisma.material.findUnique({
      where: { id: params.id },
    });

    if (!material) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '자재를 찾을 수 없습니다.',
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
    const existingRelation = await prisma.materialFile.findFirst({
      where: {
        materialId: params.id,
        fileId,
      },
    });

    if (existingRelation) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '이미 연결된 파일입니다.',
      }, { status: 400 });
    }

    // 자재-파일 관계 생성
    const materialFile = await prisma.materialFile.create({
      data: {
        materialId: params.id,
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

    const response: MaterialFileRelation = {
      id: materialFile.id,
      materialId: materialFile.materialId,
      fileId: materialFile.fileId,
      role: materialFile.role,
      order: materialFile.order,
      createdAt: materialFile.createdAt,
      updatedAt: materialFile.updatedAt,
      file: materialFile.file,
    };

    return NextResponse.json<ApiResponse<MaterialFileRelation>>({
      success: true,
      data: response,
      message: '파일이 자재에 성공적으로 연결되었습니다.',
    });

  } catch (error) {
    console.error('Material file attach error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '자재 파일 연결 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 자재-파일 관계 수정
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

    // 자재-파일 관계 존재 확인
    const materialFile = await prisma.materialFile.findFirst({
      where: {
        materialId: params.id,
        fileId,
      },
    });

    if (!materialFile) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '자재-파일 관계를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 자재-파일 관계 수정
    const updatedMaterialFile = await prisma.materialFile.update({
      where: { id: materialFile.id },
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

    const response: MaterialFileRelation = {
      id: updatedMaterialFile.id,
      materialId: updatedMaterialFile.materialId,
      fileId: updatedMaterialFile.fileId,
      role: updatedMaterialFile.role,
      order: updatedMaterialFile.order,
      createdAt: updatedMaterialFile.createdAt,
      updatedAt: updatedMaterialFile.updatedAt,
      file: updatedMaterialFile.file,
    };

    return NextResponse.json<ApiResponse<MaterialFileRelation>>({
      success: true,
      data: response,
      message: '자재-파일 관계가 성공적으로 수정되었습니다.',
    });

  } catch (error) {
    console.error('Material file update error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '자재-파일 관계 수정 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 자재-파일 관계 삭제
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

    // 자재-파일 관계 존재 확인
    const materialFile = await prisma.materialFile.findFirst({
      where: {
        materialId: params.id,
        fileId,
      },
    });

    if (!materialFile) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '자재-파일 관계를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 자재-파일 관계 삭제
    await prisma.materialFile.delete({
      where: { id: materialFile.id },
    });

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: '자재-파일 관계가 성공적으로 삭제되었습니다.',
    });

  } catch (error) {
    console.error('Material file delete error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '자재-파일 관계 삭제 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}
