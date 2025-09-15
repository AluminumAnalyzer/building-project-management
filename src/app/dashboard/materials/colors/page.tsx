"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Palette,
  FileImage,
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
import { DataTable } from "@/components/ui/data-table";
import { MaterialColorDialog } from "@/components/materials/material-color-dialog";
import {
  useMaterialColors,
  useDeleteMaterialColor,
} from "@/hooks/use-material-colors";
import type { MaterialColor } from "@/types/material";
import type { MaterialColorsResponse } from "@/types";

import Image from "next/image";

// Column type definition for DataTable
interface Column<T> {
  accessorKey?: keyof T;
  header: string;
  cell?: ({ row }: { row: { original: T } }) => React.ReactNode;
  id?: string;
}

export default function MaterialColorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedColor, setSelectedColor] = useState<MaterialColor | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: colorsData } = useMaterialColors({
    page,
    limit: 20,
    search: searchTerm.length > 0 ? searchTerm : undefined,
    includeFiles: true, // 파일 정보 포함
  });

  // 디버깅: 전체 데이터 구조 확인
  useEffect(() => {
    if (colorsData) {
      console.log("=== colorsData structure ===", colorsData);
      if (
        "items" in colorsData &&
        colorsData.items &&
        colorsData.items.length > 0
      ) {
        const firstItem = colorsData.items[0];
        console.log("=== First color item ===", firstItem);
        console.log("=== First color files ===", firstItem?.files);
        if (firstItem?.files && firstItem.files.length > 0) {
          console.log("=== First file relation ===", firstItem.files[0]);
          console.log("=== First file object ===", firstItem.files[0]?.file);
        }
      }
    }
  }, [colorsData]);

  // Type guard to check if colorsData has items property (MaterialColorsResponse)
  const isMaterialColorsResponse = (
    data:
      | MaterialColorsResponse
      | {
          data: never[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }
      | undefined
  ): data is MaterialColorsResponse => {
    return (
      data !== null &&
      data !== undefined &&
      typeof data === "object" &&
      "items" in data &&
      Array.isArray(data.items)
    );
  };

  const deleteColor = useDeleteMaterialColor();

  const handleEdit = (color: MaterialColor) => {
    setSelectedColor(color);
    setDialogOpen(true);
  };

  const handleDelete = async (color: MaterialColor) => {
    if (confirm(`"${color.name}" 색상을 삭제하시겠습니까?`)) {
      try {
        await deleteColor.mutateAsync(color.id);
      } catch (error) {
        console.error("색상 삭제 실패:", error);
      }
    }
  };

  const handleAdd = () => {
    setSelectedColor(null);
    setDialogOpen(true);
  };

  const ColorSwatch = ({ color }: { color: string }) => (
    <div
      className="w-6 h-6 rounded border border-gray-300 shadow-sm"
      style={{ backgroundColor: color }}
      title={color}
    />
  );

  const columns: Column<Record<string, unknown>>[] = [
    {
      accessorKey: "name",
      header: "색상명",
      cell: ({ row }: { row: { original: Record<string, unknown> } }) => {
        const color = row.original as unknown as MaterialColor;
        if (!("name" in color && "code" in color)) {
          return null;
        }
        return (
          <div className="flex items-center space-x-3">
            <ColorSwatch color={color.code} />
            <span className="font-medium">{color.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "code",
      header: "색상 코드",
      cell: ({ row }) => {
        const color = row.original as unknown as MaterialColor;
        return (
          <div className="flex items-center space-x-2">
            <ColorSwatch color={color.code} />
            <span className="font-mono text-sm">{color.code}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "finishType",
      header: "후처리 종류",
      cell: ({ row }) => {
        const color = row.original as unknown as MaterialColor;
        return (
          <span className="text-muted-foreground">
            {color.finishType || "-"}
          </span>
        );
      },
    },
    {
      id: "image",
      header: "이미지",
      cell: ({ row }) => {
        const color = row.original as unknown as MaterialColor;

        // 디버깅을 위한 로그
        console.log("Color data:", {
          id: color.id,
          name: color.name,
          files: color.files,
          filesLength: color.files?.length,
          firstFile: color.files?.[0],
          firstFileUrl: color.files?.[0]?.file?.url,
        });

        // 첫 번째 파일을 이미지 프리뷰로 사용
        const firstFile = color.files?.[0]?.file;

        if (firstFile) {
          // 썸네일 URL이 있으면 인원, 없으면 원본 URL 사용
          const imageUrl = firstFile.thumbnailUrl || firstFile.url;

          return (
            <div className="flex items-center justify-center">
              <div className="relative w-10 h-10 rounded-md overflow-hidden border">
                <Image
                  src={imageUrl}
                  alt={`${color.name} 이미지`}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            </div>
          );
        }

        // 레거시 colorImage 필드 체크 (전환 전용)
        if (color.colorImage) {
          return (
            <div className="flex items-center justify-center">
              <div className="relative w-10 h-10 rounded-md overflow-hidden border">
                <Image
                  src={color.colorImage}
                  alt={`${color.name} 이미지`}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center text-muted-foreground">
            <FileImage className="h-4 w-4" />
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "등록일",
      cell: ({ row }) => {
        const color = row.original as unknown as MaterialColor;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(color.createdAt).toLocaleDateString("ko-KR")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "작업",
      cell: ({ row }) => {
        const color = row.original as unknown as MaterialColor;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">메뉴 열기</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(color)}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(color)}
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
          <h1 className="text-3xl font-bold tracking-tight">자재 색상 관리</h1>
          <p className="text-muted-foreground">
            자재에 사용되는 색상을 관리하고 분류하세요
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          색상 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>색상 목록</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="색상명, 색상코드, 후처리 종류로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            {searchTerm && (
              <div className="text-xs text-muted-foreground">
                &ldquo;{searchTerm}&rdquo;로 색상명, 색상코드, 후처리 종류에서
                검색 중...
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* 검색 결과 정보 */}
          {isMaterialColorsResponse(colorsData) && (
            <div className="mb-4 text-sm text-muted-foreground">
              {searchTerm ? (
                <span>
                  전체 {colorsData.total}개 중 {colorsData.items.length}개 표시
                  {colorsData.totalPages > 1 && (
                    <span>
                      {" "}
                      (페이지 {page}/{colorsData.totalPages})
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  전체 {colorsData.total}개
                  {colorsData.totalPages > 1 && (
                    <span>
                      {" "}
                      (페이지 {page}/{colorsData.totalPages})
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
          <DataTable
            columns={columns}
            data={
              isMaterialColorsResponse(colorsData)
                ? colorsData.items.map(
                    (item) => item as unknown as Record<string, unknown>
                  )
                : []
            }
            pagination={
              isMaterialColorsResponse(colorsData)
                ? {
                    page,
                    totalPages: colorsData.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>

      <MaterialColorDialog
        materialColor={selectedColor}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
