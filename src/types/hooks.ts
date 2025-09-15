// TanStack Query 훅들을 위한 타입 정의

import type { UseQueryResult, UseMutationResult, UseInfiniteQueryResult } from '@tanstack/react-query';
import type {
  ExtractApiData,
  MaterialSummaryResponse,
  InventoryResponse,
  TransactionReportResponse,
  // Only import the API Response Types that are actually used
  GetMaterialsResponse,
  GetMaterialResponse,
  GetMaterialBasesResponse,
  GetMaterialBaseResponse,
  GetSuppliersResponse,
  GetSupplierResponse,
  GetWarehousesResponse,
  GetWarehouseResponse,
  GetMaterialColorsResponse,
  GetMaterialColorResponse,
  GetMaterialStockResponse,
  GetMaterialTransactionsResponse,
} from './api-responses';
import type {
  Material,
  MaterialBase,
  MaterialColor,
  MaterialStock,
  MaterialTransaction,
  Supplier,
  Warehouse,
} from './material';
import type {
  CreateMaterialBaseRequest,
  UpdateMaterialBaseRequest,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  CreateMaterialColorRequest,
  UpdateMaterialColorRequest,
  CreateMaterialStockRequest,
  UpdateMaterialStockRequest,
  CreateMaterialTransactionRequest,
  GetMaterialBasesParams,
  GetMaterialsParams,
  GetSuppliersParams,
  GetWarehousesParams,
  GetMaterialColorsParams,
  GetMaterialStockParams,
  GetMaterialTransactionsParams,
  InventoryQueryParams,
  TransactionReportParams,
} from './api-requests';

// Query Hook 타입들
export type UseMaterialBasesResult = UseQueryResult<ExtractApiData<GetMaterialBasesResponse>, Error>;
export type UseMaterialBaseResult = UseQueryResult<ExtractApiData<GetMaterialBaseResponse>, Error>;
export type UseMaterialsResult = UseQueryResult<ExtractApiData<GetMaterialsResponse>, Error>;
export type UseMaterialResult = UseQueryResult<ExtractApiData<GetMaterialResponse>, Error>;
export type UseSuppliersResult = UseQueryResult<ExtractApiData<GetSuppliersResponse>, Error>;
export type UseSupplierResult = UseQueryResult<ExtractApiData<GetSupplierResponse>, Error>;
export type UseWarehousesResult = UseQueryResult<ExtractApiData<GetWarehousesResponse>, Error>;
export type UseWarehouseResult = UseQueryResult<ExtractApiData<GetWarehouseResponse>, Error>;
export type UseMaterialColorsResult = UseQueryResult<ExtractApiData<GetMaterialColorsResponse>, Error>;
export type UseMaterialColorResult = UseQueryResult<ExtractApiData<GetMaterialColorResponse>, Error>;
export type UseMaterialStockResult = UseQueryResult<ExtractApiData<GetMaterialStockResponse>, Error>;
export type UseMaterialTransactionsResult = UseQueryResult<ExtractApiData<GetMaterialTransactionsResponse>, Error>;

// 특수 Query Hook 타입들
export type UseMaterialSummaryResult = UseQueryResult<MaterialSummaryResponse, Error>;
export type UseInventoryResult = UseQueryResult<InventoryResponse, Error>;
export type UseTransactionReportResult = UseQueryResult<TransactionReportResponse, Error>;

// Mutation Hook 타입들
export type UseCreateMaterialBaseMutation = UseMutationResult<
  MaterialBase,
  Error,
  CreateMaterialBaseRequest,
  unknown
>;

export type UseUpdateMaterialBaseMutation = UseMutationResult<
  MaterialBase,
  Error,
  { id: string; data: UpdateMaterialBaseRequest },
  unknown
>;

export type UseDeleteMaterialBaseMutation = UseMutationResult<
  { id: string },
  Error,
  string,
  unknown
>;

export type UseCreateMaterialMutation = UseMutationResult<
  Material,
  Error,
  CreateMaterialRequest,
  unknown
>;

export type UseUpdateMaterialMutation = UseMutationResult<
  Material,
  Error,
  { id: string; data: UpdateMaterialRequest },
  unknown
>;

export type UseDeleteMaterialMutation = UseMutationResult<
  { id: string },
  Error,
  string,
  unknown
>;

export type UseCreateSupplierMutation = UseMutationResult<
  Supplier,
  Error,
  CreateSupplierRequest,
  unknown
>;

export type UseUpdateSupplierMutation = UseMutationResult<
  Supplier,
  Error,
  { id: string; data: UpdateSupplierRequest },
  unknown
>;

export type UseDeleteSupplierMutation = UseMutationResult<
  { id: string },
  Error,
  string,
  unknown
>;

export type UseCreateWarehouseMutation = UseMutationResult<
  Warehouse,
  Error,
  CreateWarehouseRequest,
  unknown
>;

export type UseUpdateWarehouseMutation = UseMutationResult<
  Warehouse,
  Error,
  { id: string; data: UpdateWarehouseRequest },
  unknown
>;

export type UseDeleteWarehouseMutation = UseMutationResult<
  { id: string },
  Error,
  string,
  unknown
>;

export type UseCreateMaterialColorMutation = UseMutationResult<
  MaterialColor,
  Error,
  CreateMaterialColorRequest,
  unknown
>;

export type UseUpdateMaterialColorMutation = UseMutationResult<
  MaterialColor,
  Error,
  { id: string; data: UpdateMaterialColorRequest },
  unknown
>;

export type UseDeleteMaterialColorMutation = UseMutationResult<
  { id: string },
  Error,
  string,
  unknown
>;

export type UseCreateMaterialStockMutation = UseMutationResult<
  MaterialStock,
  Error,
  CreateMaterialStockRequest,
  unknown
>;

export type UseUpdateMaterialStockMutation = UseMutationResult<
  MaterialStock,
  Error,
  { id: string; data: UpdateMaterialStockRequest },
  unknown
>;

export type UseDeleteMaterialStockMutation = UseMutationResult<
  { id: string },
  Error,
  string,
  unknown
>;

export type UseCreateMaterialTransactionMutation = UseMutationResult<
  MaterialTransaction,
  Error,
  CreateMaterialTransactionRequest,
  unknown
>;

// Infinite Query Hook 타입들
export type UseInfiniteMaterialBasesResult = UseInfiniteQueryResult<
  ExtractApiData<GetMaterialBasesResponse>,
  Error
>;

export type UseInfiniteMaterialsResult = UseInfiniteQueryResult<
  ExtractApiData<GetMaterialsResponse>,
  Error
>;

export type UseInfiniteSuppliersResult = UseInfiniteQueryResult<
  ExtractApiData<GetSuppliersResponse>,
  Error
>;

export type UseInfiniteWarehousesResult = UseInfiniteQueryResult<
  ExtractApiData<GetWarehousesResponse>,
  Error
>;

export type UseInfiniteMaterialColorsResult = UseInfiniteQueryResult<
  ExtractApiData<GetMaterialColorsResponse>,
  Error
>;

export type UseInfiniteMaterialStockResult = UseInfiniteQueryResult<
  ExtractApiData<GetMaterialStockResponse>,
  Error
>;

export type UseInfiniteMaterialTransactionsResult = UseInfiniteQueryResult<
  ExtractApiData<GetMaterialTransactionsResponse>,
  Error
>;

// Hook 파라미터 타입들
export interface UseMaterialBasesOptions {
  params?: GetMaterialBasesParams;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseMaterialsOptions {
  params?: GetMaterialsParams;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseSuppliersOptions {
  params?: GetSuppliersParams;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseWarehousesOptions {
  params?: GetWarehousesParams;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseMaterialColorsOptions {
  params?: GetMaterialColorsParams;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseMaterialStockOptions {
  params?: GetMaterialStockParams;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseMaterialTransactionsOptions {
  params?: GetMaterialTransactionsParams;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseInventoryOptions {
  params?: InventoryQueryParams;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseTransactionReportOptions {
  params?: TransactionReportParams;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

// 에러 타입들
export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, string | number | boolean | null>;
}

export interface ValidationError extends ApiError {
  field: string;
  value: unknown;
}

export interface NetworkError extends ApiError {
  code: string;
  timeout?: boolean;
}

// 상태 타입들
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface QueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  isFetching: boolean;
  refetch: () => void;
}

export interface MutationState<T, V> {
  mutate: (variables: V) => void;
  mutateAsync: (variables: V) => Promise<T>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  data: T | undefined;
  reset: () => void;
}

// 유틸리티 타입들
export type QueryKey = readonly unknown[];
export type MutationKey = readonly unknown[];

export interface QueryOptions<T> {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  retry?: boolean | number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface MutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: Error, variables: V) => void;
  onSettled?: (data: T | undefined, error: Error | null, variables: V) => void;
  retry?: boolean | number;
  retryDelay?: number;
}
