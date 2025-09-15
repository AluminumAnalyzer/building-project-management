import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET /api/material-transactions/report - 거래 내역 리포트
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const warehouseId = searchParams.get('warehouseId') || '';
    const supplierId = searchParams.get('supplierId') || '';
    const projectId = searchParams.get('projectId') || '';
    const materialId = searchParams.get('materialId') || '';
    const type = searchParams.get('type') || ''; // IN, OUT
    const groupBy = searchParams.get('groupBy') || 'date'; // date, material, warehouse, supplier, project
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly

    // 기본 날짜 설정 (지정되지 않은 경우 최근 30일)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateFilter = {
      gte: startDate ? new Date(startDate) : defaultStartDate,
      lte: endDate ? new Date(endDate) : defaultEndDate
    };

    // 기본 조건 구성
    const baseWhere: Prisma.MaterialTransactionWhereInput = {
      createdAt: dateFilter
    };
    
    if (warehouseId) baseWhere.warehouseId = warehouseId;
    if (supplierId) baseWhere.supplierId = supplierId;
    if (projectId) baseWhere.projectId = projectId;
    if (materialId) baseWhere.materialId = materialId;
    if (type) baseWhere.type = type;

    let reportData;

    switch (groupBy) {
      case 'material':
        // 자재별 거래 리포트
        const materialTransactions = await prisma.materialTransaction.groupBy({
          by: ['materialId', 'type'],
          where: baseWhere,
          _sum: {
            quantity: true,
            totalPrice: true
          },
          _count: {
            id: true
          },
          _avg: {
            unitPrice: true
          }
        });

        const materialReportMap = new Map();
        
        for (const transaction of materialTransactions) {
          const material = await prisma.material.findUnique({
            where: { id: transaction.materialId },
            select: {
              id: true,
              // code: true, // Material 모델에 code 필드 없음
              // name: true, // Material 모델에 name 필드 없음
              materialBase: {
                select: {
                  name: true,
                  category: true,
                  unit: true
                }
              }
            }
          });

          const key = transaction.materialId;
          if (!materialReportMap.has(key)) {
            materialReportMap.set(key, {
              material,
              inQuantity: 0,
              outQuantity: 0,
              inValue: 0,
              outValue: 0,
              inCount: 0,
              outCount: 0,
              averagePrice: 0
            });
          }

          const report = materialReportMap.get(key);
          if (transaction.type === 'IN') {
            report.inQuantity += transaction._sum.quantity || 0;
            report.inValue += transaction._sum.totalPrice || 0;
            report.inCount += transaction._count.id;
          } else {
            report.outQuantity += transaction._sum.quantity || 0;
            report.outValue += transaction._sum.totalPrice || 0;
            report.outCount += transaction._count.id;
          }
          report.averagePrice = transaction._avg.unitPrice || 0;
        }

        reportData = Array.from(materialReportMap.values()).map(report => ({
          ...report,
          netQuantity: report.inQuantity - report.outQuantity,
          netValue: report.inValue - report.outValue,
          totalTransactions: report.inCount + report.outCount
        }));
        break;

      case 'warehouse':
        // 창고별 거래 리포트
        const warehouseTransactions = await prisma.materialTransaction.groupBy({
          by: ['warehouseId', 'type'],
          where: baseWhere,
          _sum: {
            quantity: true,
            totalPrice: true
          },
          _count: {
            id: true
          }
        });

        const warehouseReportMap = new Map();
        
        for (const transaction of warehouseTransactions) {
          const warehouse = await prisma.warehouse.findUnique({
            where: { id: transaction.warehouseId },
            select: {
              id: true,
              code: true,
              name: true,
              location: true
            }
          });

          const key = transaction.warehouseId;
          if (!warehouseReportMap.has(key)) {
            warehouseReportMap.set(key, {
              warehouse,
              inQuantity: 0,
              outQuantity: 0,
              inValue: 0,
              outValue: 0,
              inCount: 0,
              outCount: 0
            });
          }

          const report = warehouseReportMap.get(key);
          if (transaction.type === 'IN') {
            report.inQuantity += transaction._sum.quantity || 0;
            report.inValue += transaction._sum.totalPrice || 0;
            report.inCount += transaction._count.id;
          } else {
            report.outQuantity += transaction._sum.quantity || 0;
            report.outValue += transaction._sum.totalPrice || 0;
            report.outCount += transaction._count.id;
          }
        }

        reportData = Array.from(warehouseReportMap.values()).map(report => ({
          ...report,
          netQuantity: report.inQuantity - report.outQuantity,
          netValue: report.inValue - report.outValue,
          totalTransactions: report.inCount + report.outCount
        }));
        break;

      case 'supplier':
        // 거래처별 거래 리포트
        const supplierTransactions = await prisma.materialTransaction.groupBy({
          by: ['supplierId', 'type'],
          where: {
            ...baseWhere,
            supplierId: { not: null }
          },
          _sum: {
            quantity: true,
            totalPrice: true
          },
          _count: {
            id: true
          }
        });

        const supplierReportMap = new Map();
        
        for (const transaction of supplierTransactions) {
          if (!transaction.supplierId) continue;

          const supplier = await prisma.supplier.findUnique({
            where: { id: transaction.supplierId },
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
              contactPerson: true
            }
          });

          const key = transaction.supplierId;
          if (!supplierReportMap.has(key)) {
            supplierReportMap.set(key, {
              supplier,
              inQuantity: 0,
              outQuantity: 0,
              inValue: 0,
              outValue: 0,
              inCount: 0,
              outCount: 0
            });
          }

          const report = supplierReportMap.get(key);
          if (transaction.type === 'IN') {
            report.inQuantity += transaction._sum.quantity || 0;
            report.inValue += transaction._sum.totalPrice || 0;
            report.inCount += transaction._count.id;
          } else {
            report.outQuantity += transaction._sum.quantity || 0;
            report.outValue += transaction._sum.totalPrice || 0;
            report.outCount += transaction._count.id;
          }
        }

        reportData = Array.from(supplierReportMap.values()).map(report => ({
          ...report,
          netQuantity: report.inQuantity - report.outQuantity,
          netValue: report.inValue - report.outValue,
          totalTransactions: report.inCount + report.outCount
        }));
        break;

      case 'project':
        // 프로젝트별 거래 리포트
        const projectTransactions = await prisma.materialTransaction.groupBy({
          by: ['projectId', 'type'],
          where: {
            ...baseWhere,
            projectId: { not: null }
          },
          _sum: {
            quantity: true,
            totalPrice: true
          },
          _count: {
            id: true
          }
        });

        const projectReportMap = new Map();
        
        for (const transaction of projectTransactions) {
          if (!transaction.projectId) continue;

          const project = await prisma.project.findUnique({
            where: { id: transaction.projectId },
            select: {
              id: true,
              // code: true, // Project 모델에 code 필드 없음
              name: true,
              status: true
              // client: true // Project 모델에 client 필드 없음
            }
          });

          const key = transaction.projectId;
          if (!projectReportMap.has(key)) {
            projectReportMap.set(key, {
              project,
              inQuantity: 0,
              outQuantity: 0,
              inValue: 0,
              outValue: 0,
              inCount: 0,
              outCount: 0
            });
          }

          const report = projectReportMap.get(key);
          if (transaction.type === 'IN') {
            report.inQuantity += transaction._sum.quantity || 0;
            report.inValue += transaction._sum.totalPrice || 0;
            report.inCount += transaction._count.id;
          } else {
            report.outQuantity += transaction._sum.quantity || 0;
            report.outValue += transaction._sum.totalPrice || 0;
            report.outCount += transaction._count.id;
          }
        }

        reportData = Array.from(projectReportMap.values()).map(report => ({
          ...report,
          netQuantity: report.inQuantity - report.outQuantity,
          netValue: report.inValue - report.outValue,
          totalTransactions: report.inCount + report.outCount
        }));
        break;

      default:
        // 날짜별 거래 리포트
        const transactions = await prisma.materialTransaction.findMany({
          where: baseWhere,
          orderBy: { createdAt: 'asc' }
        });

        // 기간별 그룹화
        const dateGroups = new Map();
        
        transactions.forEach(transaction => {
          let dateKey;
          const date = new Date(transaction.createdAt);
          
          switch (period) {
            case 'weekly':
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              dateKey = weekStart.toISOString().slice(0, 10);
              break;
            case 'monthly':
              dateKey = date.toISOString().slice(0, 7); // YYYY-MM
              break;
            default:
              dateKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
          }

          if (!dateGroups.has(dateKey)) {
            dateGroups.set(dateKey, {
              date: dateKey,
              inQuantity: 0,
              outQuantity: 0,
              inValue: 0,
              outValue: 0,
              inCount: 0,
              outCount: 0,
              transactions: []
            });
          }

          const group = dateGroups.get(dateKey);
          if (transaction.type === 'IN') {
            group.inQuantity += transaction.quantity;
            group.inValue += transaction.totalPrice || 0;
            group.inCount++;
          } else {
            group.outQuantity += transaction.quantity;
            group.outValue += transaction.totalPrice || 0;
            group.outCount++;
          }
          group.transactions.push(transaction);
        });

        reportData = Array.from(dateGroups.values())
          .map(group => ({
            ...group,
            netQuantity: group.inQuantity - group.outQuantity,
            netValue: group.inValue - group.outValue,
            totalTransactions: group.inCount + group.outCount
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        break;
    }

    // 전체 통계
    const totalStats = await prisma.materialTransaction.aggregate({
      where: baseWhere,
      _sum: {
        quantity: true,
        totalPrice: true
      },
      _count: {
        id: true
      }
    });

    const inStats = await prisma.materialTransaction.aggregate({
      where: { ...baseWhere, type: 'IN' },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      _count: {
        id: true
      }
    });

    const outStats = await prisma.materialTransaction.aggregate({
      where: { ...baseWhere, type: 'OUT' },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      _count: {
        id: true
      }
    });

    const response = {
      report: reportData,
      summary: {
        totalTransactions: totalStats._count.id,
        totalQuantity: totalStats._sum.quantity || 0,
        totalValue: totalStats._sum.totalPrice || 0,
        inTransactions: inStats._count.id,
        inQuantity: inStats._sum.quantity || 0,
        inValue: inStats._sum.totalPrice || 0,
        outTransactions: outStats._count.id,
        outQuantity: outStats._sum.quantity || 0,
        outValue: outStats._sum.totalPrice || 0,
        netQuantity: (inStats._sum.quantity || 0) - (outStats._sum.quantity || 0),
        netValue: (inStats._sum.totalPrice || 0) - (outStats._sum.totalPrice || 0)
      },
      filters: {
        startDate: dateFilter.gte.toISOString().slice(0, 10),
        endDate: dateFilter.lte.toISOString().slice(0, 10),
        warehouseId,
        supplierId,
        projectId,
        materialId,
        type,
        groupBy,
        period
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('거래 내역 리포트 조회 오류:', error);
    return NextResponse.json(
      { error: '거래 내역 리포트를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
