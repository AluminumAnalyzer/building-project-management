"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import type { MaterialSummaryResponse } from "@/types";

interface MaterialDashboardStatsProps {
  summary?: MaterialSummaryResponse;
  isLoading: boolean;
}

export function MaterialDashboardStats({
  summary,
  isLoading,
}: MaterialDashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = summary
    ? [
        {
          title: "전체 자재",
          value: (summary.totalMaterials ?? 0).toLocaleString(),
          description: "등록된 자재 수",
          icon: Package,
          trend: (summary.totalMaterials ?? 0) > 0 ? "up" : "neutral",
        },
        {
          title: "총 재고 가치",
          value: `₩${(summary.totalValue ?? 0).toLocaleString()}`,
          description: "현재 재고 총 가치",
          icon: DollarSign,
          trend: (summary.totalValue ?? 0) > 0 ? "up" : "neutral",
        },
        {
          title: "활성 창고",
          value: (summary.warehouseSummary?.length ?? 0).toLocaleString(),
          description: "운영 중인 창고",
          icon: Warehouse,
          trend: "neutral",
        },
        {
          title: "부족 재고",
          value: (summary.lowStockItems ?? 0).toLocaleString(),
          description: "안전재고 미달",
          icon: AlertTriangle,
          trend: (summary.lowStockItems ?? 0) > 0 ? "down" : "up",
          alert: (summary.lowStockItems ?? 0) > 0,
        },
      ]
    : [];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon
              className={`h-4 w-4 ${
                stat.alert ? "text-destructive" : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stat.alert ? "text-destructive" : ""
              }`}
            >
              {stat.value}
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.trend === "up" && (
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  증가
                </Badge>
              )}
              {stat.trend === "down" && stat.alert && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  주의
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
