import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types/api';
import type { FileSearchParams, FileSearchResponse, FileWithRelations } from '@/types/file';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '인증이 필요합니다.',
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // 검색 파라미터 추출
    const params: FileSearchParams = {
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      mimeType: searchParams.get('mimeType') || undefined,
      uploadedById: searchParams.get('uploadedById') || undefined,
      isPublic: searchParams.get('isPublic') === 'true' ? true : 
                searchParams.get('isPublic') === 'false' ? false : undefined,
      tags: searchParams.get('tags')?.split(',').map(tag => tag.trim()) || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      minSize: searchParams.get('minSize') ? parseInt(searchParams.get('minSize')!) : undefined,
      maxSize: searchParams.get('maxSize') ? parseInt(searchParams.get('maxSize')!) : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: (searchParams.get('sortBy') as FileSearchParams['sortBy']) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // 권한에 따른 기본 필터
    const baseWhere = session.user.role === 'ADMIN' 
      ? {} 
      : {
          OR: [
            { uploadedById: session.user.id },
            { isPublic: true },
          ],
        };

    // 검색 조건 구성
    const where = {
      ...baseWhere,
      ...(params.query && {
        OR: [
          { originalName: { contains: params.query } },
          { description: { contains: params.query } },
          { tags: { contains: params.query } },
        ],
      }),
      ...(params.category && { category: params.category }),
      ...(params.mimeType && { mimeType: params.mimeType }),
      ...(params.uploadedById && { uploadedById: params.uploadedById }),
      ...(params.isPublic !== undefined && { isPublic: params.isPublic }),
      ...(params.tags && {
        tags: {
          contains: params.tags.join(','),
        },
      }),
      ...(params.dateFrom && {
        createdAt: {
          gte: new Date(params.dateFrom),
        },
      }),
      ...(params.dateTo && {
        createdAt: {
          ...((params.dateFrom && { gte: new Date(params.dateFrom) }) || {}),
          lte: new Date(params.dateTo),
        },
      }),
      ...(params.minSize && {
        size: {
          gte: params.minSize,
        },
      }),
      ...(params.maxSize && {
        size: {
          ...((params.minSize && { gte: params.minSize }) || {}),
          lte: params.maxSize,
        },
      }),
    };

    // 페이지네이션 계산
    const skip = (params.page! - 1) * params.limit!;

    // 정렬 조건
    const orderBy = {
      [params.sortBy!]: params.sortOrder,
    };

    // 파일 검색 및 총 개수 조회
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy,
        skip,
        take: params.limit,
      }),
      prisma.file.count({ where }),
    ]);

    const totalPages = Math.ceil(total / params.limit!);

    const response: FileSearchResponse = {
      files: files as FileWithRelations[],
      total,
      page: params.page!,
      limit: params.limit!,
      totalPages,
    };

    return NextResponse.json<ApiResponse<FileSearchResponse>>({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('File search error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '파일 검색 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}
