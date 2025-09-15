"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type {
  CreateMaterialStockRequest,
  UpdateMaterialStockRequest,
  GetMaterialStockResponse,
  CreateMaterialStockResponse,
  UpdateMaterialStockResponse,
  InventoryQueryParams,
  GetInventoryResponse,
} from "@/types";

const API_BASE = "/api/material-stock";

// 재고 목록 조회
export function useMaterialStock(params?: {
  page?: number;
  limit?: number;
  materialId?: string;
  warehouseId?: string;
  lowStock?: boolean;
}) {
  return useQuery({
    queryKey: ["material-stock", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.materialId) searchParams.set("materialId", params.materialId);
      if (params?.warehouseId) searchParams.set("warehouseId", params.warehouseId);
      if (params?.lowStock) searchParams.set("lowStock", "true");

      const { data } = await axios.get<GetMaterialStockResponse>(`${API_BASE}?${searchParams.toString()}`);
      return data.success ? data.data : { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    },
  });
}

// 재고 현황 조회 (그룹화)
export function useMaterialInventory(params?: InventoryQueryParams) {
  return useQuery({
    queryKey: ["materials", "inventory", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.groupBy) searchParams.set("groupBy", params.groupBy);
      if (params?.warehouseId) searchParams.set("warehouseId", params.warehouseId);
      if (params?.category) searchParams.set("category", params.category);
      if (params?.lowStock) searchParams.set("lowStock", "true");

      const { data } = await axios.get<GetInventoryResponse>(`/api/materials/inventory?${searchParams.toString()}`);
      return data.success ? data.data : { data: [], summary: { totalValue: 0, totalItems: 0, lowStockItems: 0 } };
    },
  });
}

// 재고 생성
export function useCreateMaterialStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stock: CreateMaterialStockRequest) => {
      const { data } = await axios.post<CreateMaterialStockResponse>(API_BASE, stock);
      return data.success ? data.data : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-stock"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "inventory"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("재고 생성 실패:", error.response?.data?.message || error.message);
    },
  });
}

// 재고 수정
export function useUpdateMaterialStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      stock,
    }: {
      id: string;
      stock: UpdateMaterialStockRequest;
    }) => {
      const { data } = await axios.put<UpdateMaterialStockResponse>(`${API_BASE}/${id}`, stock);
      return data.success ? data.data : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-stock"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "inventory"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("재고 수정 실패:", error.response?.data?.message || error.message);
    },
  });
}

// 재고 삭제
export function useDeleteMaterialStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${API_BASE}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-stock"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "inventory"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("재고 삭제 실패:", error.response?.data?.message || error.message);
    },
  });
}
