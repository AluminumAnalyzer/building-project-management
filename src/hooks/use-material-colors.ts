"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type {
  CreateMaterialColorRequest,
  UpdateMaterialColorRequest,
  GetMaterialColorsResponse,
  GetMaterialColorResponse,
  CreateMaterialColorResponse,
  UpdateMaterialColorResponse,
} from "@/types";

const API_BASE = "/api/material-colors";

// 색상 목록 조회
export function useMaterialColors(params?: {
  page?: number;
  limit?: number;
  search?: string;
  includeFiles?: boolean;
}) {
  return useQuery({
    queryKey: ["material-colors", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.search) searchParams.set("search", params.search);
      if (params?.includeFiles) searchParams.set("includeFiles", "true");

      const { data } = await axios.get<GetMaterialColorsResponse>(`${API_BASE}?${searchParams.toString()}`);
      return data.success ? data.data : { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    },
  });
}

// 색상 상세 조회
export function useMaterialColor(id: string) {
  return useQuery({
    queryKey: ["material-colors", id],
    queryFn: async () => {
      const { data } = await axios.get<GetMaterialColorResponse>(`${API_BASE}/${id}`);
      return data.success ? data.data : null;
    },
    enabled: !!id,
  });
}

// 색상 생성
export function useCreateMaterialColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (color: CreateMaterialColorRequest) => {
      const { data } = await axios.post<CreateMaterialColorResponse>(API_BASE, color);
      return data.success ? data.data : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-colors"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("색상 생성 실패:", error.response?.data?.message || error.message);
    },
  });
}

// 색상 수정
export function useUpdateMaterialColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      color,
    }: {
      id: string;
      color: UpdateMaterialColorRequest;
    }) => {
      const { data } = await axios.put<UpdateMaterialColorResponse>(`${API_BASE}/${id}`, color);
      return data.success ? data.data : null;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["material-colors"] });
      queryClient.invalidateQueries({ queryKey: ["material-colors", data?.id] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("색상 수정 실패:", error.response?.data?.message || error.message);
    },
  });
}

// 색상 삭제
export function useDeleteMaterialColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${API_BASE}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-colors"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("색상 삭제 실패:", error.response?.data?.message || error.message);
    },
  });
}
