"use client";

import { useState } from "react";
import { Search, Filter, Download, Plus, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { MaterialStockDialog } from "@/components/materials/material-stock-dialog";
import { useMaterialStock } from "@/hooks/use-material-stock";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useMaterials } from "@/hooks/use-materials";
import type { MaterialStock } from "@/types/material";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<MaterialStock | null>(null);

  const { data: stockData, isLoading } = useMaterialStock({
    page,
    limit: 20,
    search: searchTerm || undefined,
    warehouseId: selectedWarehouse || undefined,
    lowStock: stockFilter === "low" ? true : undefined,
    outOfStock: stockFilter === "out" ? true : undefined,
  });

  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const { data: materialsData } = useMaterials({ limit: 100 });

  const handleAddStock = () => {
    setSelectedStock(null);
    setDialogOpen(true);
  };

  const handleEditStock = (stock: MaterialStock) => {
    setSelectedStock(stock);
    setDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const getStockStatus = (stock: MaterialStock) => {
    if (stock.quantity <= 0) {
      return { label: "재고없음", variant: "destructive" as const };
    }
    if (stock.quantity <= (stock.minQuantity || 0)) {
      return { label: "부족", variant: "secondary" as const };
    }
    return { label: "정상", variant: "default" as const };
  };

  const columns = [
    {
      accessorKey: "material" as keyof MaterialStock,
      header: "자재",
      cell: ({ row }: { row: { original: MaterialStock } }) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.original.material?.title || "N/A"}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.material?.category || ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "warehouse" as keyof MaterialStock,
      header: "창고",
      cell: ({ row }: { row: { original: MaterialStock } }) => (
        <span>{row.original.warehouse?.name || "N/A"}</span>
      ),
    },
    {
      accessorKey: "quantity" as keyof MaterialStock,
      header: "현재고",
      cell: ({ row }: { row: { original: MaterialStock } }) => {
        const status = getStockStatus(row.original);
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{row.original.quantity}</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "minQuantity" as keyof MaterialStock,
      header: "안전재고",
      cell: ({ row }: { row: { original: MaterialStock } }) => (
        <span>{row.original.minQuantity || 0}</span>
      ),
    },
    {
      accessorKey: "unitPrice" as keyof MaterialStock,
      header: "단가",
      cell: ({ row }: { row: { original: MaterialStock } }) => (
        <span>{formatCurrency(row.original.unitPrice || 0)}</span>
      ),
    },
    {
      id: "totalValue",
      header: "재고가치",
      cell: ({ row }: { row: { original: MaterialStock } }) => {
        const totalValue = row.original.quantity * (row.original.unitPrice || 0);
        return <span className="font-medium">{formatCurrency(totalValue)}</span>;
      },
    },
    {
      id: "actions",
      header: "작업",
      cell: ({ row }: { row: { original: MaterialStock } }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEditStock(row.original)}
        >
          수정
        </Button>
      ),
    },
  ];

  const lowStockItems = stockData?.stocks.filter(stock => 
    stock.quantity <= (stock.minQuantity || 0) && stock.quantity > 0
  ) || [];

  const outOfStockItems = stockData?.stocks.filter(stock => 
    stock.quantity <= 0
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">재고 관리</h1>
          <p className="text-muted-foreground">
            자재 재고 현황을 확인하고 관리하세요
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button onClick={handleAddStock}>
            <Plus className="mr-2 h-4 w-4" />
            재고 추가
          </Button>
        </div>
      </div>

      {/* 알림 카드 */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {lowStockItems.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-yellow-800">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  재고 부족 알림
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700">
                  {lowStockItems.length}개 자재의 재고가 안전재고 이하입니다.
                </p>
              </CardContent>
            </Card>
          )}
          
          {outOfStockItems.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-red-800">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  재고 없음 알림
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">
                  {outOfStockItems.length}개 자재의 재고가 없습니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>재고 현황</CardTitle>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="자재명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="창고 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 창고</SelectItem>
                {warehousesData?.warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={(value: "all" | "low" | "out") => setStockFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="low">재고 부족</SelectItem>
                <SelectItem value="out">재고 없음</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={stockData?.stocks || []}
            pagination={
              stockData
                ? {
                    page,
                    totalPages: stockData.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>

      <MaterialStockDialog
        stock={selectedStock}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        materials={materialsData?.materials || []}
        warehouses={warehousesData?.warehouses || []}
      />
    </div>
  );
}
