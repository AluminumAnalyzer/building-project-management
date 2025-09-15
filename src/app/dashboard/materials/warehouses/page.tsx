"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { WarehouseDialog } from "@/components/materials/warehouse-dialog";
import { useWarehouses, useDeleteWarehouse } from "@/hooks/use-warehouses";
import type { Warehouse } from "@/types/material";
import type { WarehousesResponse } from "@/types";

export default function WarehousesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: warehousesData } = useWarehouses({
    page,
    limit: 10,
    search: searchTerm || undefined,
  });

  // Type guard to check if warehousesData has items property (WarehousesResponse)
  const isWarehousesResponse = (data: unknown): data is WarehousesResponse => {
    return data !== null && data !== undefined && typeof data === 'object' && 'items' in data && Array.isArray((data as WarehousesResponse).items);
  };

  const deleteWarehouse = useDeleteWarehouse();

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDialogOpen(true);
  };

  const handleDelete = async (warehouse: Warehouse) => {
    if (confirm(`"${warehouse.name}" 창고를 삭제하시겠습니까?`)) {
      try {
        await deleteWarehouse.mutateAsync(warehouse.id);
      } catch (error) {
        console.error("창고 삭제 실패:", error);
      }
    }
  };

  const handleAdd = () => {
    setSelectedWarehouse(null);
    setDialogOpen(true);
  };

  const columns = [
    {
      accessorKey: "name" as keyof Warehouse,
      header: "창고명",
      cell: ({ row }: { row: { original: Warehouse } }) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "location" as keyof Warehouse,
      header: "위치",
      cell: ({ row }: { row: { original: Warehouse } }) => (
        <span className="text-muted-foreground">
          {row.original.location || "-"}
        </span>
      ),
    },
    {
      accessorKey: "purpose" as keyof Warehouse,
      header: "용도",
      cell: ({ row }: { row: { original: Warehouse } }) => (
        <span>{row.original.purpose || "-"}</span>
      ),
    },
    {
      accessorKey: "isActive" as keyof Warehouse,
      header: "상태",
      cell: ({ row }: { row: { original: Warehouse } }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "활성" : "비활성"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "작업",
      cell: ({ row }: { row: { original: Warehouse } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">창고 관리</h1>
          <p className="text-muted-foreground">
            창고 정보를 관리하고 재고 현황을 확인하세요
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          창고 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>창고 목록</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="창고명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={isWarehousesResponse(warehousesData) ? warehousesData.items as unknown as Record<string, unknown>[] : []}
            pagination={
              warehousesData
                ? {
                    page,
                    totalPages: warehousesData.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>

      <WarehouseDialog
        warehouse={selectedWarehouse}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
