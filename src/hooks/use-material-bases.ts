"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type {
  MaterialBase,
  CreateMaterialBaseRequest,
  UpdateMaterialBaseRequest,
  ApiResponse,
} from "@/types";

const API_BASE = "/api/material-bases";

// MaterialBase 목록 조회
export function useMaterialBases(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: ["material-bases", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.search) searchParams.set("search", params.search);
      if (params?.category) searchParams.set("category", params.category);
      if (params?.type) searchParams.set("type", params.type);

      const { data } = await axios.get<ApiResponse<{ data: MaterialBase[]; total: number; page: number; limit: number; totalPages: number }>>(
        `${API_BASE}?${searchParams.toString()}`
      );
      return data.success ? data.data : { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    },
  });
}

// MaterialBase 상세 조회
export function useMaterialBase(id: string) {
  return useQuery({
    queryKey: ["material-bases", id],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<MaterialBase>>(`${API_BASE}/${id}`);
      return data.success ? data.data : null;
    },
    enabled: !!id,
  });
}

// MaterialBase 생성
export function useCreateMaterialBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaterialBaseRequest) => {
      const { data: response } = await axios.post<ApiResponse<MaterialBase>>(API_BASE, data);
      return response.success ? response.data : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-bases"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("Error creating material base:", error.response?.data?.message || error.message);
    },
  });
}

// MaterialBase 수정
export function useUpdateMaterialBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMaterialBaseRequest }) => {
      const { data: response } = await axios.put<ApiResponse<MaterialBase>>(`${API_BASE}/${id}`, data);
      return response.success ? response.data : null;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["material-bases"] });
      queryClient.invalidateQueries({ queryKey: ["material-bases", variables.id] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("Error updating material base:", error.response?.data?.message || error.message);
    },
  });
}

// MaterialBase 삭제
export function useDeleteMaterialBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<ApiResponse<void>>(`${API_BASE}/${id}`);
      return data.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-bases"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("Error deleting material base:", error.response?.data?.message || error.message);
    },
  });
}
