"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type {
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  GetWarehousesResponse,
  GetWarehouseResponse,
  CreateWarehouseResponse,
  UpdateWarehouseResponse,
} from "@/types";

const API_BASE = "/api/warehouses";

// 창고 목록 조회
export function useWarehouses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: ["warehouses", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.search) searchParams.set("search", params.search);
      if (params?.type) searchParams.set("type", params.type);

      const { data } = await axios.get<GetWarehousesResponse>(`${API_BASE}?${searchParams.toString()}`);
      return data.success ? data.data : { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    },
  });
}

// 창고 상세 조회
export function useWarehouse(id: string) {
  return useQuery({
    queryKey: ["warehouses", id],
    queryFn: async () => {
      const { data } = await axios.get<GetWarehouseResponse>(`${API_BASE}/${id}`);
      return data.success ? data.data : null;
    },
    enabled: !!id,
  });
}

// 창고 생성
export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (warehouse: CreateWarehouseRequest) => {
      const { data } = await axios.post<CreateWarehouseResponse>(API_BASE, warehouse);
      return data.success ? data.data : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("창고 생성 실패:", error.response?.data?.message || error.message);
    },
  });
}

// 창고 수정
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      warehouse,
    }: {
      id: string;
      warehouse: UpdateWarehouseRequest;
    }) => {
      const { data } = await axios.put<UpdateWarehouseResponse>(`${API_BASE}/${id}`, warehouse);
      return data.success ? data.data : null;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouses", data?.id] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("창고 수정 실패:", error.response?.data?.message || error.message);
    },
  });
}

// 창고 삭제
export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${API_BASE}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("창고 삭제 실패:", error.response?.data?.message || error.message);
    },
  });
}
