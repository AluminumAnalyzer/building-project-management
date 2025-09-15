"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Warehouse, Package, AlertTriangle } from "lucide-react";
import type { InventoryResponse } from "@/types";

interface MaterialInventoryChartProps {
  data?: InventoryResponse;
  isLoading: boolean;
}

export function MaterialInventoryChart({ data, isLoading }: MaterialInventoryChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];

    // Handle warehouse grouping
    if (data.groupedByWarehouse) {
      return data.groupedByWarehouse.map((item) => {
        const lowStockCount = item.items?.filter(stock => stock.isLowStock).length || 0;
        
        return {
          name: item.warehouseName,
          totalItems: item.totalItems,
          totalValue: item.totalValue,
          lowStockCount,
          items: item.items || [],
        };
      });
    }
    
    // Handle category grouping
    if (data.groupedByCategory) {
      return data.groupedByCategory.map((item) => {
        return {
          name: item.category,
          totalItems: item.itemCount,
          totalValue: item.totalValue,
          lowStockCount: 0, // Category grouping doesn't have low stock info
          items: [],
        };
      });
    }
    
    return [];
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">재고 데이터가 없습니다</p>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map(item => item.totalValue));

  return (
    <div className="space-y-6">
      {chartData.map((item, index) => (
        <div key={index} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Warehouse className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{item.name}</span>
              {item.lowStockCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {item.lowStockCount}개 부족
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                ₩{item.totalValue.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {item.totalItems}개 품목
              </div>
            </div>
          </div>
          
          <Progress 
            value={maxValue > 0 ? (item.totalValue / maxValue) * 100 : 0} 
            className="h-2"
          />
          
          {/* 상위 재고 아이템 미리보기 */}
          {item.items.length > 0 && (
            <div className="pl-6 space-y-1">
              {item.items.slice(0, 3).map((stock, stockIndex) => (
                <div key={stockIndex} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">
                    {stock.material?.materialBase?.name || `재고 #${stock.id}`}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span>{stock.currentStock}개</span>
                    {stock.isLowStock && (
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
              {item.items.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{item.items.length - 3}개 더...
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
