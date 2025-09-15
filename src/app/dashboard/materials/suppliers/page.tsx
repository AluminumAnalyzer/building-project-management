"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSuppliers, useDeleteSupplier } from "@/hooks/use-suppliers";
import { SupplierDialog } from "@/components/materials/supplier-dialog";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Supplier } from "@/types/material";

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: suppliers, isLoading } = useSuppliers({
    page,
    limit: 10,
    search: searchTerm,
  });

  const deleteSupplier = useDeleteSupplier();

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("정말로 이 거래처를 삭제하시겠습니까?")) {
      await deleteSupplier.mutateAsync(id);
    }
  };

  const handleCreate = () => {
    setSelectedSupplier(null);
    setIsDialogOpen(true);
  };

  const columns = [
    {
      accessorKey: "name",
      header: "거래처명",
      cell: ({ row }: { row: { original: Supplier } }) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "유형",
      cell: ({ row }: { row: { original: Supplier } }) => (
        <Badge variant="outline">
          {row.original.type === "SUPPLIER" ? "공급업체" : "구매업체"}
        </Badge>
      ),
    },
    {
      accessorKey: "contact",
      header: "연락처",
      cell: ({ row }: { row: { original: Supplier } }) => (
        <div className="space-y-1">
          {row.original.contactPerson && (
            <div className="text-sm">{row.original.contactPerson}</div>
          )}
          {row.original.phone && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{row.original.phone}</span>
            </div>
          )}
          {row.original.email && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span>{row.original.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "주소",
      cell: ({ row }: { row: { original: Supplier } }) =>
        row.original.address ? (
          <div className="flex items-center space-x-1 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="truncate max-w-xs">{row.original.address}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "isActive",
      header: "상태",
      cell: ({ row }: { row: { original: Supplier } }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "활성" : "비활성"}
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: "설명",
      cell: ({ row }: { row: { original: Supplier } }) =>
        row.original.description ? (
          <div className="flex items-center space-x-1 text-sm">
            <span className="truncate max-w-xs">
              {row.original.description}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: { row: { original: Supplier } }) => (
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
              onClick={() => handleDelete(row.original.id)}
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">거래처 관리</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          거래처 추가
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="거래처 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          필터
        </Button>
      </div>

      {/* 거래처 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>거래처 목록</CardTitle>
          <CardDescription>등록된 거래처를 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns as never}
              data={(suppliers?.items || []) as never}
              pagination={{
                page,
                totalPages: suppliers?.totalPages || 1,
                onPageChange: setPage,
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* 거래처 추가/수정 다이얼로그 */}
      <SupplierDialog
        supplier={selectedSupplier}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
