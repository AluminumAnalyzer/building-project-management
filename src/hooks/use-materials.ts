"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type {
  CreateMaterialRequest,
  UpdateMaterialRequest,
  GetMaterialsResponse,
  GetMaterialResponse,
  CreateMaterialResponse,
  UpdateMaterialResponse,
  GetMaterialSummaryResponse,
} from "@/types";

const API_BASE = "/api/materials";

// 자재 목록 조회
export function useMaterials(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  supplierId?: string;
}) {
  return useQuery({
    queryKey: ["materials", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.search) searchParams.set("search", params.search);
      if (params?.category) searchParams.set("category", params.category);
      if (params?.supplierId) searchParams.set("supplierId", params.supplierId);

      const { data } = await axios.get<GetMaterialsResponse>(`${API_BASE}?${searchParams.toString()}`);
      return data.success ? data.data : { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    },
  });
}

// 자재 상세 조회
export function useMaterial(id: string) {
  return useQuery({
    queryKey: ["materials", id],
    queryFn: async () => {
      const { data } = await axios.get<GetMaterialResponse>(`${API_BASE}/${id}`);
      return data.success ? data.data : null;
    },
    enabled: !!id,
  });
}

// 자재 요약 정보 조회
export function useMaterialSummary() {
  return useQuery({
    queryKey: ["materials", "summary"],
    queryFn: async () => {
      const { data } = await axios.get<GetMaterialSummaryResponse>(`${API_BASE}/summary`);
      return data.success ? data.data : { totalMaterials: 0, totalValue: 0, lowStockCount: 0, categories: [] };
    },
  });
}

// 자재 생성
export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (material: CreateMaterialRequest) => {
      const { data } = await axios.post<CreateMaterialResponse>(API_BASE, material);
      return data.success ? data.data : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("자재 생성 실패:", error.response?.data?.message || error.message);
    },
  });
}

// 자재 수정
export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      material,
    }: {
      id: string;
      material: UpdateMaterialRequest;
    }) => {
      const { data } = await axios.put<UpdateMaterialResponse>(`${API_BASE}/${id}`, material);
      return data.success ? data.data : null;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["materials", data?.id] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("자재 수정 실패:", error.response?.data?.message || error.message);
    },
  });
}

// 자재 삭제
export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${API_BASE}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("자재 삭제 실패:", error.response?.data?.message || error.message);
    },
  });
}
