"use client";

import { useState } from "react";
import {
  Search,
  Download,
  Plus,
  ArrowUp,
  ArrowDown,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { MaterialTransactionDialog } from "@/components/materials/material-transaction-dialog";
import { useMaterialTransactions } from "@/hooks/use-material-transactions";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useMaterials } from "@/hooks/use-materials";
import type {
  MaterialTransaction,
  Warehouse,
  WarehousesResponse,
  MaterialTransactionsResponse,
  MaterialsResponse,
} from "@/types";

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: transactionsData } = useMaterialTransactions({
    page,
    limit: 20,
    warehouseId: selectedWarehouse || undefined,
    type: transactionType as "IN" | "OUT" | undefined,
  });

  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const { data: materialsData } = useMaterials({ limit: 100 });

  const handleAddTransaction = () => {
    setDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    return type === "IN" ? (
      <ArrowUp className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTransactionBadge = (type: string) => {
    return type === "IN" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        입고
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        출고
      </Badge>
    );
  };

  const columns = [
    {
      accessorKey: "type" as keyof MaterialTransaction,
      header: "구분",
      cell: ({ row }: { row: { original: MaterialTransaction } }) => (
        <div className="flex items-center space-x-2">
          {getTransactionIcon(row.original.type)}
          {getTransactionBadge(row.original.type)}
        </div>
      ),
    },
    {
      accessorKey: "material" as keyof MaterialTransaction,
      header: "자재",
      cell: ({ row }: { row: { original: MaterialTransaction } }) => (
        <div>
          <div className="font-medium">
            {row.original.material?.materialBase?.name || "N/A"}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.material?.materialBase?.category || ""}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "warehouse" as keyof MaterialTransaction,
      header: "창고",
      cell: ({ row }: { row: { original: MaterialTransaction } }) => (
        <span>{row.original.warehouse?.name || "N/A"}</span>
      ),
    },
    {
      accessorKey: "quantity" as keyof MaterialTransaction,
      header: "수량",
      cell: ({ row }: { row: { original: MaterialTransaction } }) => (
        <span className="font-medium">{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: "unitPrice" as keyof MaterialTransaction,
      header: "단가",
      cell: ({ row }: { row: { original: MaterialTransaction } }) => (
        <span>{formatCurrency(row.original.unitPrice || 0)}</span>
      ),
    },
    {
      id: "totalAmount",
      header: "총액",
      cell: ({ row }: { row: { original: MaterialTransaction } }) => {
        const totalAmount =
          row.original.quantity * (row.original.unitPrice || 0);
        return (
          <span className="font-medium">{formatCurrency(totalAmount)}</span>
        );
      },
    },
    {
      accessorKey: "transactionDate" as keyof MaterialTransaction,
      header: "거래일시",
      cell: ({ row }: { row: { original: MaterialTransaction } }) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(row.original.transactionDate).toLocaleDateString("ko-KR")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "notes" as keyof MaterialTransaction,
      header: "메모",
      cell: ({ row }: { row: { original: MaterialTransaction } }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.notes || "-"}
        </span>
      ),
    },
  ];

  // 통계 계산
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transactions = (transactionsData as any)?.transactions || [];
  const totalTransactions = transactions.length;
  const inTransactions = transactions.filter(
    (t: MaterialTransaction) => t.type === "IN"
  ).length;
  const outTransactions = transactions.filter(
    (t: MaterialTransaction) => t.type === "OUT"
  ).length;
  const totalValue = transactions.reduce(
    (sum: number, t: MaterialTransaction) =>
      sum + (t.unitPrice || 0) * t.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">거래 내역</h1>
          <p className="text-muted-foreground">
            자재 입출고 거래 내역을 확인하고 관리하세요
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button onClick={handleAddTransaction}>
            <Plus className="mr-2 h-4 w-4" />
            거래 추가
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 거래</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">전체 거래 건수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">입고</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {inTransactions}
            </div>
            <p className="text-xs text-muted-foreground">입고 건수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">출고</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outTransactions}
            </div>
            <p className="text-xs text-muted-foreground">출고 건수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 거래액</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">전체 거래 금액</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>거래 내역</CardTitle>
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

            <Select
              value={selectedWarehouse}
              onValueChange={setSelectedWarehouse}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="창고 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 창고</SelectItem>

                {((warehousesData as WarehousesResponse)?.items || []).map(
                  (warehouse: Warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="거래 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="IN">입고</SelectItem>
                <SelectItem value="OUT">출고</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns as never}
            data={
              ((transactionsData as MaterialTransactionsResponse)?.items ||
                []) as never
            }
            pagination={
              transactionsData
                ? {
                    page,
                    totalPages: (
                      transactionsData as MaterialTransactionsResponse
                    ).totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>

      <MaterialTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        materials={((materialsData as MaterialsResponse)?.items || []) as never}
        warehouses={(warehousesData as WarehousesResponse)?.items || []}
      />
    </div>
  );
}
