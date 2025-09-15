import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types/api';
import type { ProjectFileRelation } from '@/types/file';

interface RouteParams {
  params: {
    id: string;
  };
}

// 프로젝트 파일 목록 조회
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

    // 프로젝트 존재 확인
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '프로젝트를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 프로젝트 파일 관계 조회
    const projectFiles = await prisma.projectFile.findMany({
      where: {
        projectId: params.id,
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

    const relations: ProjectFileRelation[] = projectFiles.map(pf => ({
      id: pf.id,
      projectId: pf.projectId,
      fileId: pf.fileId,
      role: pf.role,
      order: pf.order,
      createdAt: pf.createdAt,
      updatedAt: pf.updatedAt,
      file: pf.file,
    }));

    return NextResponse.json<ApiResponse<ProjectFileRelation[]>>({
      success: true,
      data: relations,
    });

  } catch (error) {
    console.error('Project files get error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '프로젝트 파일 조회 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 프로젝트에 파일 연결
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

    // 프로젝트 존재 확인
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '프로젝트를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    const body = await request.json();
    const { fileId, role = 'ATTACHMENT', order } = body;

    if (!fileId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일 ID가 필요합니다.',
      }, { status: 400 });
    }

    // 파일 존재 확인
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '파일을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 이미 연결된 파일인지 확인
    const existingRelation = await prisma.projectFile.findFirst({
      where: {
        projectId: params.id,
        fileId,
      },
    });

    if (existingRelation) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '이미 연결된 파일입니다.',
      }, { status: 409 });
    }

    // 순서 설정 (지정되지 않은 경우 마지막 순서 + 1)
    let finalOrder = order;
    if (finalOrder === undefined) {
      const lastFile = await prisma.projectFile.findFirst({
        where: { projectId: params.id },
        orderBy: { order: 'desc' },
      });
      finalOrder = (lastFile?.order || 0) + 1;
    }

    // 프로젝트-파일 관계 생성
    const projectFile = await prisma.projectFile.create({
      data: {
        projectId: params.id,
        fileId,
        role,
        order: finalOrder,
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

    const relation: ProjectFileRelation = {
      id: projectFile.id,
      projectId: projectFile.projectId,
      fileId: projectFile.fileId,
      role: projectFile.role,
      order: projectFile.order,
      createdAt: projectFile.createdAt,
      updatedAt: projectFile.updatedAt,
      file: projectFile.file,
    };

    return NextResponse.json<ApiResponse<ProjectFileRelation>>({
      success: true,
      data: relation,
      message: '파일이 프로젝트에 성공적으로 연결되었습니다.',
    });

  } catch (error) {
    console.error('Project file attach error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '프로젝트 파일 연결 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 프로젝트-파일 관계 수정
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
    const { relationId, role, order } = body;

    if (!relationId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '관계 ID가 필요합니다.',
      }, { status: 400 });
    }

    // 관계 존재 확인
    const existingRelation = await prisma.projectFile.findUnique({
      where: { id: relationId },
    });

    if (!existingRelation || existingRelation.projectId !== params.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '프로젝트 파일 관계를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 관계 업데이트
    const updatedRelation = await prisma.projectFile.update({
      where: { id: relationId },
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

    const relation: ProjectFileRelation = {
      id: updatedRelation.id,
      projectId: updatedRelation.projectId,
      fileId: updatedRelation.fileId,
      role: updatedRelation.role,
      order: updatedRelation.order,
      createdAt: updatedRelation.createdAt,
      updatedAt: updatedRelation.updatedAt,
      file: updatedRelation.file,
    };

    return NextResponse.json<ApiResponse<ProjectFileRelation>>({
      success: true,
      data: relation,
      message: '프로젝트 파일 관계가 성공적으로 업데이트되었습니다.',
    });

  } catch (error) {
    console.error('Project file relation update error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '프로젝트 파일 관계 업데이트 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}
