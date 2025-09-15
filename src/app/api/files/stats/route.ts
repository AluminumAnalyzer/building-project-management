import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileStatsResponse } from "@/types/file";
import type { ApiResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "인증이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // 권한 체크 - 관리자가 아니면 본인 통계만 조회 가능
    const targetUserId =
      session.user.role === "ADMIN" && userId ? userId : session.user.id;

    // 기본 통계 조회
    const [
      totalFiles,
      totalSize,
      publicFiles,
      privateFiles,
      categoryStats,
      recentFiles,
      topDownloads,
    ] = await Promise.all([
      // 총 파일 수
      prisma.file.count({
        where: { uploadedById: targetUserId },
      }),

      // 총 파일 크기
      prisma.file.aggregate({
        where: { uploadedById: targetUserId },
        _sum: { size: true },
      }),

      // 공개 파일 수
      prisma.file.count({
        where: {
          uploadedById: targetUserId,
          isPublic: true,
        },
      }),

      // 비공개 파일 수
      prisma.file.count({
        where: {
          uploadedById: targetUserId,
          isPublic: false,
        },
      }),

      // 카테고리별 통계
      prisma.file.groupBy({
        by: ["category"],
        where: { uploadedById: targetUserId },
        _count: { _all: true },
        _sum: { size: true },
      }),

      // 최근 업로드된 파일 (7일)
      prisma.file.count({
        where: {
          uploadedById: targetUserId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // 다운로드 수 상위 파일들
      prisma.file.findMany({
        where: { uploadedById: targetUserId },
        orderBy: { downloadCount: "desc" },
        take: 10,
        select: {
          id: true,
          originalName: true,
          downloadCount: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      }),
    ]);

    // 월별 업로드 통계 (최근 12개월)
    const monthlyStats = await prisma.$queryRaw<
      Array<{
        month: string;
        count: number;
        size: number;
      }>
    >`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(size) as size
      FROM File 
      WHERE uploadedById = ${targetUserId}
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
    `;

    // MIME 타입별 통계
    const mimeTypeStats = await prisma.file.groupBy({
      by: ["mimeType"],
      where: { uploadedById: targetUserId },
      _count: { _all: true },
      _sum: { size: true },
      orderBy: { mimeType: "asc" },
      take: 10,
    });

    const stats: FileStatsResponse = {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      publicFiles,
      privateFiles,
      recentFiles,
      categoryStats: categoryStats.map((stat) => ({
        category: stat.category,
        count: stat._count._all,
        totalSize: stat._sum.size || 0,
      })),
      monthlyStats: monthlyStats.map((stat) => ({
        month: stat.month,
        count: Number(stat.count),
        totalSize: Number(stat.size),
      })),
      mimeTypeStats: mimeTypeStats.map((stat) => ({
        mimeType: stat.mimeType,
        count: stat._count._all,
        totalSize: stat._sum.size || 0,
      })),
      topDownloads: topDownloads.map((file) => ({
        id: file.id,
        originalName: file.originalName,
        downloadCount: file.downloadCount,
        mimeType: file.mimeType,
        size: file.size,
        createdAt: file.createdAt,
      })),
    };

    return NextResponse.json<ApiResponse<FileStatsResponse>>({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("File stats error:", error);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "파일 통계 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
