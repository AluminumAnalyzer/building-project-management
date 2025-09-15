"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Package, ShoppingCart, Eye } from "lucide-react";
import { useMaterialInventory } from "@/hooks/use-material-stock";
import type { InventoryResponse } from "@/types";

export function LowStockAlert() {
  const { data: inventory, isLoading } = useMaterialInventory({
    lowStock: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>재고 부족 알림</span>
            </CardTitle>
            <CardDescription>
              안전재고 수준 이하의 자재들을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Type guard to check if inventory has items property (InventoryResponse)
  const isInventoryResponse = (data: unknown): data is InventoryResponse => {
    return data !== null && data !== undefined && typeof data === 'object' && 'items' in data && Array.isArray((data as InventoryResponse).items);
  };

  const lowStockItems = isInventoryResponse(inventory) 
    ? inventory.items.filter(item => item.isLowStock) 
    : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>재고 부족 알림</span>
            <Badge variant="destructive" className="ml-2">
              {lowStockItems.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            안전재고 수준 이하의 자재들을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-green-700 mb-2">
                모든 재고가 안전 수준입니다
              </h3>
              <p className="text-muted-foreground">
                현재 안전재고 미달 품목이 없습니다
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-destructive/10 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {item.material.materialBase.name || `재고 #${item.id}`}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>창고: {item.warehouse.name || "미지정"}</span>
                        {item.shortage && (
                          <Badge variant="outline" className="text-xs">
                            {item.shortage}개 부족
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm">
                      <span className="text-destructive font-medium">
                        {item.currentStock}개
                      </span>
                      <span className="text-muted-foreground">
                        / {item.safetyStock}개
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        상세
                      </Button>
                      <Button size="sm">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        발주
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {lowStockItems.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    전체 {lowStockItems.length}개 항목 보기
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
