import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types/api';
import type { TaskFileRelation } from '@/types/file';

interface RouteParams {
  params: {
    id: string;
  };
}

// 작업 파일 목록 조회
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

    // 작업 존재 확인
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '작업을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 작업 파일 관계 조회
    const taskFiles = await prisma.taskFile.findMany({
      where: {
        taskId: params.id,
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

    const response: TaskFileRelation[] = taskFiles.map(tf => ({
      id: tf.id,
      taskId: tf.taskId,
      fileId: tf.fileId,
      role: tf.role,
      order: tf.order,
      createdAt: tf.createdAt,
      updatedAt: tf.updatedAt,
      file: tf.file,
    }));

    return NextResponse.json<ApiResponse<TaskFileRelation[]>>({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('Task files get error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '작업 파일 조회 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 작업에 파일 연결
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

    // 작업 존재 확인
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '작업을 찾을 수 없습니다.',
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
    const existingRelation = await prisma.taskFile.findFirst({
      where: {
        taskId: params.id,
        fileId,
      },
    });

    if (existingRelation) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '이미 연결된 파일입니다.',
      }, { status: 400 });
    }

    // 작업-파일 관계 생성
    const taskFile = await prisma.taskFile.create({
      data: {
        taskId: params.id,
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

    const response: TaskFileRelation = {
      id: taskFile.id,
      taskId: taskFile.taskId,
      fileId: taskFile.fileId,
      role: taskFile.role,
      order: taskFile.order,
      createdAt: taskFile.createdAt,
      updatedAt: taskFile.updatedAt,
      file: taskFile.file,
    };

    return NextResponse.json<ApiResponse<TaskFileRelation>>({
      success: true,
      data: response,
      message: '파일이 작업에 성공적으로 연결되었습니다.',
    });

  } catch (error) {
    console.error('Task file attach error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '작업 파일 연결 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 작업-파일 관계 수정
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

    // 작업-파일 관계 존재 확인
    const taskFile = await prisma.taskFile.findFirst({
      where: {
        taskId: params.id,
        fileId,
      },
    });

    if (!taskFile) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '작업-파일 관계를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 작업-파일 관계 수정
    const updatedTaskFile = await prisma.taskFile.update({
      where: { id: taskFile.id },
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

    const response: TaskFileRelation = {
      id: updatedTaskFile.id,
      taskId: updatedTaskFile.taskId,
      fileId: updatedTaskFile.fileId,
      role: updatedTaskFile.role,
      order: updatedTaskFile.order,
      createdAt: updatedTaskFile.createdAt,
      updatedAt: updatedTaskFile.updatedAt,
      file: updatedTaskFile.file,
    };

    return NextResponse.json<ApiResponse<TaskFileRelation>>({
      success: true,
      data: response,
      message: '작업-파일 관계가 성공적으로 수정되었습니다.',
    });

  } catch (error) {
    console.error('Task file update error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '작업-파일 관계 수정 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 작업-파일 관계 삭제
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

    // 작업-파일 관계 존재 확인
    const taskFile = await prisma.taskFile.findFirst({
      where: {
        taskId: params.id,
        fileId,
      },
    });

    if (!taskFile) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '작업-파일 관계를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    // 작업-파일 관계 삭제
    await prisma.taskFile.delete({
      where: { id: taskFile.id },
    });

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null,
      message: '작업-파일 관계가 성공적으로 삭제되었습니다.',
    });

  } catch (error) {
    console.error('Task file delete error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '작업-파일 관계 삭제 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}
