"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { MaterialBaseDialog } from "@/components/materials/material-base-dialog";
import {
  useMaterialBases,
  useDeleteMaterialBase,
} from "@/hooks/use-material-bases";
import type { MaterialBase } from "@/types/material";

// Column type definition for DataTable
interface Column<T> {
  accessorKey?: keyof T;
  header: string;
  cell?: ({ row }: { row: { original: T } }) => React.ReactNode;
  id?: string;
}

// MaterialBase 종류 옵션
const MATERIAL_TYPES = [
  { value: "RAW_MATERIAL", label: "원재료" },
  { value: "COMPONENT", label: "부품" },
  { value: "FINISHED_PRODUCT", label: "완제품" },
  { value: "CONSUMABLE", label: "소모품" },
  { value: "TOOL", label: "도구" },
];

// MaterialBase 카테고리 옵션
const MATERIAL_CATEGORIES = [
  { value: "STRUCTURE", label: "구조재" },
  { value: "PANEL", label: "패널" },
  { value: "INSULATION", label: "단열재" },
  { value: "WATERPROOF", label: "방수재" },
  { value: "HARDWARE", label: "철물" },
  { value: "FINISHING", label: "마감재" },
  { value: "ELECTRICAL", label: "전기재료" },
  { value: "PLUMBING", label: "배관재료" },
  { value: "OTHER", label: "기타" },
];

export default function MaterialBasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMaterialBase, setSelectedMaterialBase] =
    useState<MaterialBase | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: materialBasesData } = useMaterialBases({
    page,
    limit: 20,
    search: searchTerm || undefined,
    type: selectedType === "all" ? undefined : selectedType,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const deleteMaterialBase = useDeleteMaterialBase();

  const handleEdit = (materialBase: MaterialBase) => {
    setSelectedMaterialBase(materialBase);
    setDialogOpen(true);
  };

  const handleDelete = async (materialBase: MaterialBase) => {
    if (confirm(`"${materialBase.name}" 기본 자재를 삭제하시겠습니까?`)) {
      try {
        await deleteMaterialBase.mutateAsync(materialBase.id);
      } catch (error) {
        console.error("기본 자재 삭제 실패:", error);
      }
    }
  };

  const handleAdd = () => {
    setSelectedMaterialBase(null);
    setDialogOpen(true);
  };

  const getTypeLabel = (type: string) => {
    return MATERIAL_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getCategoryLabel = (category: string) => {
    return (
      MATERIAL_CATEGORIES.find((c) => c.value === category)?.label || category
    );
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      accessorKey: "code",
      header: "자재 코드",
      cell: ({ row }: { row: { original: Record<string, unknown> } }) => {
        const materialBase = row.original as unknown as MaterialBase;
        return (
          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {materialBase.code}
          </code>
        );
      },
    },
    {
      accessorKey: "name",
      header: "자재명",
      cell: ({ row }) => {
        const materialBase = row.original as unknown as MaterialBase;
        return (
          <div className="flex flex-col space-y-1">
            <span className="font-medium">{materialBase.name}</span>
            {materialBase.specification && (
              <span className="text-sm text-gray-500">
                {materialBase.specification}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "종류",
      cell: ({ row }) => {
        const materialBase = row.original as unknown as MaterialBase;
        return (
          <Badge variant="outline">
            {getTypeLabel(materialBase.type || "")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "category",
      header: "카테고리",
      cell: ({ row }) => {
        const materialBase = row.original as unknown as MaterialBase;
        return materialBase.category ? (
          <Badge variant="secondary">
            {getCategoryLabel(materialBase.category)}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "unit",
      header: "단위",
      cell: ({ row }) => {
        const materialBase = row.original as unknown as MaterialBase;
        return <span className="text-sm font-medium">{materialBase.unit}</span>;
      },
    },
    {
      accessorKey: "unitPrice",
      header: "단가",
      cell: ({ row }) => {
        const materialBase = row.original as unknown as MaterialBase;
        return materialBase.unitPrice ? (
          <div className="text-right">
            <span className="text-sm font-medium">
              {materialBase.unitPrice.toLocaleString()}원
            </span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "safetyStock",
      header: "안전재고",
      cell: ({ row }) => {
        const materialBase = row.original as unknown as MaterialBase;
        return materialBase.safetyStock ? (
          <div className="text-center">
            <span className="text-sm font-medium">
              {materialBase.safetyStock.toLocaleString()}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "상태",
      cell: ({ row }) => {
        const materialBase = row.original as unknown as MaterialBase;
        return (
          <Badge variant={materialBase.isActive ? "default" : "secondary"}>
            {materialBase.isActive ? "활성" : "비활성"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "작업",
      cell: ({ row }) => {
        const materialBase = row.original as unknown as MaterialBase;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">메뉴 열기</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(materialBase)}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(materialBase)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="m-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">기본 자재 관리</h1>
          <p className="text-muted-foreground">
            자재의 기본 정보를 관리하고 분류하세요
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          기본 자재 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>기본 자재 목록</span>
          </CardTitle>
          <div className="flex items-center space-x-4">
            {/* 검색창 */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="자재명, 코드, 규격으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* 필터 */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />

              {/* 종류 필터 */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="종류" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {MATERIAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 카테고리 필터 */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {MATERIAL_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 검색/필터 상태 표시 */}
          {(searchTerm || selectedType || selectedCategory) && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>필터:</span>
              {searchTerm && (
                <Badge variant="outline" className="text-xs">
                  검색: {searchTerm}
                </Badge>
              )}
              {selectedType && (
                <Badge variant="outline" className="text-xs">
                  종류: {getTypeLabel(selectedType)}
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="outline" className="text-xs">
                  카테고리: {getCategoryLabel(selectedCategory)}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* 검색 결과 정보 */}
          {materialBasesData && (
            <div className="mb-4 text-sm text-muted-foreground">
              {searchTerm || selectedType || selectedCategory ? (
                <span>
                  전체 {materialBasesData.total}개 중{" "}
                  {materialBasesData.data.length}개 표시
                  {materialBasesData.totalPages > 1 && (
                    <span>
                      {" "}
                      (페이지 {page}/{materialBasesData.totalPages})
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  전체 {materialBasesData.total}개
                  {materialBasesData.totalPages > 1 && (
                    <span>
                      {" "}
                      (페이지 {page}/{materialBasesData.totalPages})
                    </span>
                  )}
                </span>
              )}
            </div>
          )}

          <DataTable
            columns={columns}
            data={
              materialBasesData
                ? materialBasesData.data.map(
                    (item) => item as unknown as Record<string, unknown>
                  )
                : []
            }
            pagination={
              materialBasesData && materialBasesData.totalPages > 1
                ? {
                    page,
                    totalPages: materialBasesData.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>

      <MaterialBaseDialog
        materialBase={selectedMaterialBase}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
