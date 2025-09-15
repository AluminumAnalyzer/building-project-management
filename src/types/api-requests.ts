// API 요청 타입 정의 - 클라이언트에서 서버로 보내는 요청 타입들

// 기본 페이지네이션 쿼리 파라미터
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 기본 검색 쿼리 파라미터
export interface SearchParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// 자재 베이스 관련 요청 타입
export interface CreateMaterialBaseRequest {
  code: string;
  name: string;
  type?: string;
  specification?: string;
  unit: string;
  unitPrice?: number;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  safetyStock?: number;
  suppliers?: string[]; // 거래처 ID 배열
}

export interface UpdateMaterialBaseRequest
  extends Partial<CreateMaterialBaseRequest> {
  isActive?: boolean;
}

export interface GetMaterialBasesParams extends PaginationParams, SearchParams {
  category?: string;
  type?: string;
  isActive?: boolean;
}

// 자재 관련 요청 타입
export interface CreateMaterialRequest {
  materialBaseId: string;
  colorId?: string;
  size?: string;
  finishType?: string;
  unitPrice?: number;
  description?: string;
}

export interface UpdateMaterialRequest extends Partial<CreateMaterialRequest> {
  isActive?: boolean;
}

export interface GetMaterialsParams extends PaginationParams, SearchParams {
  materialBaseId?: string;
  colorId?: string;
  category?: string;
  isActive?: boolean;
}

// 공급업체 관련 요청 타입
export interface CreateSupplierRequest {
  name: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  fax?: string;
  type: string;
  businessLicense?: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  isActive?: boolean;
}

export interface GetSuppliersParams extends PaginationParams, SearchParams {
  type?: string;
  isActive?: boolean;
}

// 창고 관련 요청 타입
export interface CreateWarehouseRequest {
  code: string;
  name: string;
  location?: string;
  purpose?: string;
  layoutImage?: string;
}

export interface UpdateWarehouseRequest
  extends Partial<CreateWarehouseRequest> {
  isActive?: boolean;
}

export interface GetWarehousesParams extends PaginationParams, SearchParams {
  purpose?: string;
  isActive?: boolean;
}

// 자재 색상 관련 요청 타입
export interface CreateMaterialColorRequest {
  code: string;
  name: string;
  finishType?: string;
  colorImage?: string;
}

export type UpdateMaterialColorRequest = Partial<CreateMaterialColorRequest>;

export interface GetMaterialColorsParams
  extends PaginationParams,
    SearchParams {
  code?: string;
  name?: string;
}

// 자재 재고 관련 요청 타입
export interface CreateMaterialStockRequest {
  materialId: string;
  warehouseId: string;
  currentStock: number;
  safetyStock: number;
  unitPrice?: number;
}

export interface UpdateMaterialStockRequest {
  currentStock?: number;
  safetyStock?: number;
  unitPrice?: number;
}

export interface GetMaterialStockParams extends PaginationParams, SearchParams {
  materialId?: string;
  warehouseId?: string;
  category?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
}

// 자재 거래 관련 요청 타입
export interface CreateMaterialTransactionRequest {
  type: "IN" | "OUT";
  materialId: string;
  warehouseId: string;
  supplierId?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  projectId?: string;
  notes?: string;
  transactionDate?: string; // ISO string
}

export interface GetMaterialTransactionsParams
  extends PaginationParams,
    SearchParams {
  type?: "IN" | "OUT";
  materialId?: string;
  warehouseId?: string;
  supplierId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

// 재고 현황 조회 파라미터
export interface InventoryQueryParams extends PaginationParams, SearchParams {
  warehouseId?: string;
  category?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  groupBy?: "warehouse" | "category";
}

// 거래 리포트 조회 파라미터
export interface TransactionReportParams extends PaginationParams {
  startDate?: string;
  endDate?: string;
  warehouseId?: string;
  materialId?: string;
  supplierId?: string;
  type?: "IN" | "OUT";
  groupBy?: "date" | "material" | "warehouse" | "supplier";
  period?: "daily" | "weekly" | "monthly";
}

// 자재-공급업체 연결 관련 요청 타입
export interface CreateMaterialSupplierRequest {
  materialBaseId: string;
  supplierId: string;
  orderCode?: string;
  leadTime?: number;
  minOrder?: number;
  unitPrice?: number;
  isPreferred?: boolean;
}

export type UpdateMaterialSupplierRequest =
  Partial<CreateMaterialSupplierRequest>;

// 자재 이미지 관련 요청 타입
export interface CreateMaterialImageRequest {
  materialBaseId: string;
  url: string;
  isDefault?: boolean;
}

export interface UpdateMaterialImageRequest {
  isDefault?: boolean;
}

// 자재 도면 관련 요청 타입
export interface CreateMaterialDrawingRequest {
  materialBaseId: string;
  title: string;
  fileUrl: string;
  version?: string;
}

export type UpdateMaterialDrawingRequest =
  Partial<CreateMaterialDrawingRequest>;

// 파일 업로드 관련 요청 타입
export interface FileUploadRequest {
  file: File;
  category: "image" | "drawing" | "document";
  materialBaseId?: string;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// 벌크 작업 관련 요청 타입
export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest<T> {
  ids: string[];
  data: Partial<T>;
}

// 내보내기 관련 요청 타입
export interface ExportRequest {
  format: "csv" | "excel" | "pdf";
  filters?: Record<string, string | number | boolean | string[] | null>;
  columns?: string[];
}

// 가져오기 관련 요청 타입
export interface ImportRequest {
  file: File;
  type: "materials" | "suppliers" | "warehouses" | "stock";
  options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
  };
}

export interface ImportResponse {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

// 통계 조회 관련 요청 타입
export interface StatsQueryParams {
  period?: "week" | "month" | "quarter" | "year";
  startDate?: string;
  endDate?: string;
  warehouseId?: string;
  category?: string;
}

// 알림 설정 관련 요청 타입
export interface NotificationSettingsRequest {
  lowStockAlert: boolean;
  outOfStockAlert: boolean;
  expirationAlert: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// 사용자 권한 관련 요청 타입
export interface UserPermissionRequest {
  userId: string;
  permissions: {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canExport: boolean;
    canImport: boolean;
  };
}
