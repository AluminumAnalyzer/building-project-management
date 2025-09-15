// API 응답 타입 정의 - 클라이언트에서 사용하는 정규화된 응답 타입들

import type {
  Material,
  MaterialBase,
  MaterialColor,
  MaterialStock,
  MaterialTransaction,
  Supplier,
  Warehouse,
  MaterialStockWithRelations,
  MaterialTransactionWithRelations,
  InventoryItem,
  WarehouseInventoryGroup,
  CategoryInventoryGroup,
} from './material';

// 기본 API 응답 래퍼
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 자재 관련 API 응답 타입들
export type MaterialsResponse = PaginatedResponse<Material>;

export type MaterialBasesResponse = PaginatedResponse<MaterialBase>;

export type MaterialColorsResponse = PaginatedResponse<MaterialColor>;

export type SuppliersResponse = PaginatedResponse<Supplier>;

export type WarehousesResponse = PaginatedResponse<Warehouse>;

export type MaterialStockResponse = PaginatedResponse<MaterialStockWithRelations>;

export type MaterialTransactionsResponse = PaginatedResponse<MaterialTransactionWithRelations>;

// 대시보드 통계 응답
export interface MaterialSummaryResponse {
  totalMaterials: number;
  totalMaterialBases: number;
  totalStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  recentTransactions: MaterialTransaction[];
  topCategories: Array<{
    category: string;
    count: number;
    totalStock: number;
    totalValue: number;
  }>;
  warehouseSummary: Array<{
    warehouse: Warehouse;
    itemCount: number;
    totalStock: number;
    lowStockItems: number;
  }>;
}

// 재고 현황 응답
export interface InventoryResponse {
  items: InventoryItem[];
  summary: {
    totalItems: number;
    totalStock: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
  };
  groupedByWarehouse?: WarehouseInventoryGroup[];
  groupedByCategory?: CategoryInventoryGroup[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 거래 리포트 응답
export interface TransactionReportResponse {
  summary: {
    totalTransactions: number;
    totalInQuantity: number;
    totalOutQuantity: number;
    totalInValue: number;
    totalOutValue: number;
    netQuantity: number;
    netValue: number;
  };
  transactions: MaterialTransactionWithRelations[];
  groupedData?: Record<string, {
    quantity: number;
    value: number;
    count: number;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 자재 상세 조회 응답
export interface MaterialDetailResponse extends Material {
  materialBase: MaterialBase;
  totalStock: number;
  totalSafetyStock: number;
  isLowStock: boolean;
  stocksByWarehouse: Array<{
    warehouse: Warehouse;
    currentStock: number;
    safetyStock: number;
    unitPrice: number | null;
  }>;
  recentTransactions: MaterialTransaction[];
}

// 창고 상세 조회 응답
export interface WarehouseDetailResponse extends Warehouse {
  summary: {
    totalItems: number;
    totalStock: number;
    lowStockItems: number;
  };
  stocks: Array<MaterialStockWithRelations & {
    isLowStock: boolean;
    stockValue: number;
  }>;
}

// 공급업체 상세 조회 응답
export interface SupplierDetailResponse extends Supplier {
  materials: MaterialBase[];
  recentTransactions: MaterialTransaction[];
  summary: {
    totalMaterials: number;
    totalTransactions: number;
    totalValue: number;
  };
}

// 색상 상세 조회 응답
export interface MaterialColorDetailResponse extends MaterialColor {
  materials: Material[];
  usage: {
    totalMaterials: number;
    activeMaterials: number;
  };
}

// 에러 응답 타입
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, string | number | boolean | null>;
}

// 성공 응답 타입
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

// 통합 API 응답 타입
export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// 특정 API 엔드포인트별 응답 타입들 (ES2015 module syntax)

// Materials API Response Types
export type GetMaterialsResponse = ApiResult<MaterialsResponse>;
export type GetMaterialResponse = ApiResult<MaterialDetailResponse>;
export type CreateMaterialResponse = ApiResult<Material>;
export type UpdateMaterialResponse = ApiResult<Material>;
export type DeleteMaterialResponse = ApiResult<{ id: string }>;

// Material Bases API Response Types
export type GetMaterialBasesResponse = ApiResult<MaterialBasesResponse>;
export type GetMaterialBaseResponse = ApiResult<MaterialBase>;
export type CreateMaterialBaseResponse = ApiResult<MaterialBase>;
export type UpdateMaterialBaseResponse = ApiResult<MaterialBase>;
export type DeleteMaterialBaseResponse = ApiResult<{ id: string }>;

// Suppliers API Response Types
export type GetSuppliersResponse = ApiResult<SuppliersResponse>;
export type GetSupplierResponse = ApiResult<SupplierDetailResponse>;
export type CreateSupplierResponse = ApiResult<Supplier>;
export type UpdateSupplierResponse = ApiResult<Supplier>;
export type DeleteSupplierResponse = ApiResult<{ id: string }>;

// Warehouses API Response Types
export type GetWarehousesResponse = ApiResult<WarehousesResponse>;
export type GetWarehouseResponse = ApiResult<WarehouseDetailResponse>;
export type CreateWarehouseResponse = ApiResult<Warehouse>;
export type UpdateWarehouseResponse = ApiResult<Warehouse>;
export type DeleteWarehouseResponse = ApiResult<{ id: string }>;

// Material Colors API Response Types
export type GetMaterialColorsResponse = ApiResult<MaterialColorsResponse>;
export type GetMaterialColorResponse = ApiResult<MaterialColorDetailResponse>;
export type CreateMaterialColorResponse = ApiResult<MaterialColor>;
export type UpdateMaterialColorResponse = ApiResult<MaterialColor>;
export type DeleteMaterialColorResponse = ApiResult<{ id: string }>;

// Material Stock API Response Types
export type GetMaterialStockResponse = ApiResult<MaterialStockResponse>;
export type CreateMaterialStockResponse = ApiResult<MaterialStock>;
export type UpdateMaterialStockResponse = ApiResult<MaterialStock>;
export type DeleteMaterialStockResponse = ApiResult<{ id: string }>;

// Material Transactions API Response Types
export type GetMaterialTransactionsResponse = ApiResult<MaterialTransactionsResponse>;
export type CreateMaterialTransactionResponse = ApiResult<MaterialTransaction>;

// Dashboard & Reports API Response Types
export type GetMaterialSummaryResponse = ApiResult<MaterialSummaryResponse>;
export type GetInventoryResponse = ApiResult<InventoryResponse>;
export type GetTransactionReportResponse = ApiResult<TransactionReportResponse>;

// Hook에서 사용할 타입 유틸리티
export type ExtractApiData<T> = T extends ApiResult<infer U> ? U : never;
export type ExtractPaginatedData<T> = T extends PaginatedResponse<infer U> ? U : never;
