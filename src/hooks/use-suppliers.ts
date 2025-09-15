"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type {
  CreateSupplierRequest,
  UpdateSupplierRequest,
  GetSuppliersResponse,
  GetSupplierResponse,
  CreateSupplierResponse,
  UpdateSupplierResponse,
} from "@/types";

const API_BASE = "/api/suppliers";

// 거래처 목록 조회
export function useSuppliers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.search) searchParams.set("search", params.search);
      if (params?.type) searchParams.set("type", params.type);

      const { data } = await axios.get<GetSuppliersResponse>(`${API_BASE}?${searchParams.toString()}`);
      return data.success ? data.data : { items: [], total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false };
    },
  });
}

// 거래처 상세 조회
export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: async () => {
      const { data } = await axios.get<GetSupplierResponse>(`${API_BASE}/${id}`);
      return data.success ? data.data : null;
    },
    enabled: !!id,
  });
}

// 거래처 생성
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplier: CreateSupplierRequest) => {
      const { data } = await axios.post<CreateSupplierResponse>(API_BASE, supplier);
      return data.success ? data.data : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("거래처 생성 실패:", error.response?.data?.message || error.message);
    },
  });
}

// 거래처 수정
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      supplier,
    }: {
      id: string;
      supplier: UpdateSupplierRequest;
    }) => {
      const { data } = await axios.put<UpdateSupplierResponse>(`${API_BASE}/${id}`, supplier);
      return data.success ? data.data : null;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", data?.id] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("거래처 수정 실패:", error.response?.data?.message || error.message);
    },
  });
}

// 거래처 삭제
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${API_BASE}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("거래처 삭제 실패:", error.response?.data?.message || error.message);
    },
  });
}
