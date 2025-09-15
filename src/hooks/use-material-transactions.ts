"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type {
  CreateMaterialTransactionRequest,
  GetMaterialTransactionsResponse,
  CreateMaterialTransactionResponse,
  TransactionReportParams,
  GetTransactionReportResponse,
} from "@/types";

const API_BASE = "/api/material-transactions";

// 거래 내역 조회
export function useMaterialTransactions(params?: {
  page?: number;
  limit?: number;
  materialId?: string;
  warehouseId?: string;
  type?: "IN" | "OUT";
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["material-transactions", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.materialId) searchParams.set("materialId", params.materialId);
      if (params?.warehouseId) searchParams.set("warehouseId", params.warehouseId);
      if (params?.type) searchParams.set("type", params.type);
      if (params?.startDate) searchParams.set("startDate", params.startDate);
      if (params?.endDate) searchParams.set("endDate", params.endDate);

      const { data } = await axios.get<GetMaterialTransactionsResponse>(`${API_BASE}?${searchParams.toString()}`);
      return data.success ? data.data : { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    },
  });
}

// 거래 리포트 조회
export function useMaterialTransactionReport(params?: TransactionReportParams) {
  return useQuery({
    queryKey: ["material-transactions", "report", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.set("startDate", params.startDate);
      if (params?.endDate) searchParams.set("endDate", params.endDate);
      if (params?.warehouseId) searchParams.set("warehouseId", params.warehouseId);
      if (params?.materialId) searchParams.set("materialId", params.materialId);
      if (params?.type) searchParams.set("type", params.type);
      if (params?.groupBy) searchParams.set("groupBy", params.groupBy);

      const { data } = await axios.get<GetTransactionReportResponse>(`${API_BASE}/report?${searchParams.toString()}`);
      return data.success ? data.data : { summary: { totalIn: 0, totalOut: 0, netChange: 0, transactionCount: 0 }, data: [] };
    },
  });
}

// 거래 생성 (입고/출고)
export function useCreateMaterialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      transaction: CreateMaterialTransactionRequest
    ) => {
      const { data } = await axios.post<CreateMaterialTransactionResponse>(API_BASE, transaction);
      return data.success ? data.data : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["material-stock"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "summary"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("거래 생성 실패:", error.response?.data?.message || error.message);
    },
  });
}

// 입고 처리
export function useStockIn() {
  return useCreateMaterialTransaction();
}

// 출고 처리
export function useStockOut() {
  return useCreateMaterialTransaction();
}
