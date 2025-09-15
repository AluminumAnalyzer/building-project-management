// 자재 관리 시스템 타입 정의

// 필요한 타입 import
import type { FileWithRelations } from "./file";
export interface User {
  id: string;
  name?: string;
  email: string;
}

export interface BOMItem {
  id: string;
  materialId: string;
  quantity: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
}

// 자재 관련 타입
export interface MaterialBase {
  id: string;
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
  safetyStock: number;
  isActive: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  createdBy?: User;
  materials?: Material[];
  suppliers?: MaterialSupplier[];
  images?: MaterialImage[];
  drawings?: MaterialDrawing[];
}

export interface Material {
  id: string;
  materialBaseId: string;
  colorId?: string;
  size?: string;
  finishType?: string;
  unitPrice?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  materialBase?: MaterialBase;
  color?: MaterialColor;
  stocks?: MaterialStock[];
  transactions?: MaterialTransaction[];
  bomItems?: BOMItem[];
}

// 거래처 관련 타입
export interface Supplier {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

// 창고 관련 타입
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location?: string;
  purpose?: string;
  layoutImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 자재 색상 관련 타입
export interface MaterialColor {
  id: string;
  code: string;
  name: string;
  finishType?: string; // 후처리 종류 (nullable로 수정)
  colorImage?: string; // 레거시 필드 (향후 제거 예정)

  createdAt: Date;
  updatedAt: Date;

  // Relations
  materials?: Material[];
  files?: MaterialColorFileRelation[]; // 색상 관련 파일들
}

// 자재색상-파일 연결 관련 타입
export interface MaterialColorFileRelation {
  id: string;
  colorId: string;
  fileId: string;
  role: string; // COLOR_IMAGE, THUMBNAIL, GALLERY, FINISH_SAMPLE
  order: number;
  createdAt: Date;
  updatedAt: Date;
  file?: FileWithRelations; // 파일 정보
}

// 확장된 MaterialColor 응답 타입 (파일 정보 포함)
export interface MaterialColorWithFiles extends MaterialColor {
  mainImage?: FileWithRelations; // 메인 색상 이미지
  thumbnail?: FileWithRelations; // 썸네일
  galleryImages?: FileWithRelations[]; // 갤러리 이미지들
  finishSamples?: FileWithRelations[]; // 후처리 샘플 이미지들
}

// 자재 재고 관련 타입
export interface MaterialStock {
  id: string;
  materialId: string; // Material 인스턴스 참조 (색상, 사이즈 포함)
  warehouseId: string;
  currentStock: number;
  safetyStock: number;
  unitPrice?: number;
  lastUpdated: Date;

  // Relations
  material?: Material;
  warehouse?: Warehouse;
}

// 자재 거래 내역 관련 타입
export interface MaterialTransaction {
  id: string;
  type: "IN" | "OUT";
  materialId: string; // Material 인스턴스 참조 (색상, 사이즈 포함)
  warehouseId: string;
  supplierId?: string; // 입고시만 사용
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  projectId?: string; // 출고시 프로젝트 연결
  userId: string;
  notes?: string;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  material?: Material;
  warehouse?: Warehouse;
  supplier?: Supplier;
  project?: Project;
  user?: User;
}

// 자재-거래처 연결 관련 타입
export interface MaterialSupplier {
  id: string;
  materialBaseId: string;
  supplierId: string;
  orderCode?: string;
  leadTime?: number;
  minOrder?: number;
  unitPrice?: number;
  isPreferred: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  materialBase?: MaterialBase;
  supplier?: Supplier;
}

// 자재 도면 관련 타입
export interface MaterialDrawing {
  id: string;
  materialBaseId: string;
  title: string;
  fileUrl: string;
  version?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  materialBase?: MaterialBase;
}

// 자재 이미지 관련 타입
export interface MaterialImage {
  id: string;
  url: string;
  isDefault: boolean;
  materialBaseId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  materialBase?: MaterialBase;
}

// API 요청/응답 타입
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
}

export interface UpdateMaterialBaseRequest
  extends Partial<CreateMaterialBaseRequest> {
  isActive?: boolean;
}

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

// 자재 색상 API 요청 타입
export interface CreateMaterialColorRequest {
  code: string;
  name: string;
  finishType?: string;
  colorImage?: string;
}

export interface UpdateMaterialColorRequest
  extends Partial<CreateMaterialColorRequest> {
  id?: string;
}

// 자재 재고 API 요청 타입
export interface CreateMaterialStockRequest {
  materialId: string;
  warehouseId: string;
  currentStock?: number;
  safetyStock?: number;
  unitPrice?: number;
}

export interface UpdateMaterialStockRequest {
  id: string;
  currentStock?: number;
  safetyStock?: number;
  unitPrice?: number;
}

// 자재 거래 API 요청 타입
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
  transactionDate?: Date;
}

// API 응답 타입
export interface MaterialSummaryResponse {
  overview: {
    totalMaterialBases: number;
    totalMaterials: number;
    totalWarehouses: number;
    totalSuppliers: number;
    totalColors: number;
    activeProjects: number;
  };
  inventory: {
    totalStockItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalStockValue: number;
    lowStockPercentage: number;
  };
  transactions: {
    period: number;
    totalTransactions: number;
    inTransactions: number;
    outTransactions: number;
    transactionValue: number;
    netFlow: number;
  };
  distribution: {
    materialsByCategory: Array<{
      category: string;
      count: number;
    }>;
    stockByWarehouse: Array<{
      warehouse: {
        code: string;
        name: string;
        location?: string;
      };
      itemCount: number;
      totalStock: number;
    }>;
  };
  recent: {
    transactions: MaterialTransaction[];
    lowStockItems: MaterialStock[];
  };
  trends: {
    monthlyTransactions: Array<{
      month: string;
      transactions: Array<{
        type: "IN" | "OUT";
        _count: { type: number };
        _sum: { totalPrice: number | null };
      }>;
    }>;
  };
}

export interface InventoryResponse {
  inventory: (MaterialStock & {
    material?: Material;
    warehouse?: Warehouse;
    color?: MaterialColor;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    stockValue?: number;
    shortage?: number;
    stockStatus?: "OUT_OF_STOCK" | "LOW_STOCK" | "NORMAL";
  })[];
  summary: {
    totalItems: number;
    totalStock: number;
    averagePrice: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    normalStockCount: number;
    lowStockPercentage: number;
  };
  groupBy: string;
  filters: {
    warehouseId?: string;
    category?: string;
    colorId?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
  };
}

export interface TransactionReportResponse {
  report: Array<{
    material?: Material;
    warehouse?: Warehouse;
    supplier?: Supplier;
    project?: Project;
    date?: string;
    inQuantity: number;
    outQuantity: number;
    inValue: number;
    outValue: number;
    inCount: number;
    outCount: number;
    netQuantity: number;
    netValue: number;
    totalTransactions: number;
  }>;
  summary: {
    totalTransactions: number;
    totalQuantity: number;
    totalValue: number;
    inTransactions: number;
    inQuantity: number;
    inValue: number;
    outTransactions: number;
    outQuantity: number;
    outValue: number;
    netQuantity: number;
    netValue: number;
  };
  filters: {
    startDate: string;
    endDate: string;
    warehouseId?: string;
    supplierId?: string;
    projectId?: string;
    materialId?: string;
    type?: string;
    groupBy: string;
    period: string;
  };
}

export interface MaterialStockSummary {
  materialId: string;
  materialName: string;
  materialCode: string;
  totalStock: number;
  safetyStock: number;
  stockStatus: "SUFFICIENT" | "LOW" | "OUT_OF_STOCK";
  warehouses: {
    warehouseId: string;
    warehouseName: string;
    currentStock: number;
  }[];
}

export interface MaterialTransactionReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalInQuantity: number;
    totalOutQuantity: number;
    totalInValue: number;
    totalOutValue: number;
  };
  transactions: MaterialTransaction[];
}

// 상수 정의
export const MATERIAL_TRANSACTION_TYPES = {
  IN: "IN",
  OUT: "OUT",
} as const;

export const STOCK_STATUS = {
  SUFFICIENT: "SUFFICIENT",
  LOW: "LOW",
  OUT_OF_STOCK: "OUT_OF_STOCK",
} as const;

export const SUPPLIER_TYPES = {
  MATERIAL_SUPPLIER: "자재업체",
  PROCESSING_COMPANY: "가공업체",
  TRANSPORT_COMPANY: "운송업체",
  EQUIPMENT_SUPPLIER: "장비업체",
} as const;

export const WAREHOUSE_PURPOSES = {
  RAW_MATERIAL: "원자재창고",
  FINISHED_PRODUCT: "완제품창고",
  TEMPORARY: "임시창고",
  EQUIPMENT: "장비창고",
} as const;

export type MaterialTransactionType =
  (typeof MATERIAL_TRANSACTION_TYPES)[keyof typeof MATERIAL_TRANSACTION_TYPES];
export type StockStatus = (typeof STOCK_STATUS)[keyof typeof STOCK_STATUS];
export type SupplierType = (typeof SUPPLIER_TYPES)[keyof typeof SUPPLIER_TYPES];
export type WarehousePurpose =
  (typeof WAREHOUSE_PURPOSES)[keyof typeof WAREHOUSE_PURPOSES];

// API 응답 타입들
export interface MaterialApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MaterialListResponse {
  materials: (Material & {
    materialBase?: MaterialBase;
    color?: MaterialColor;
    stocks?: MaterialStock[];
    totalStock?: number;
    _count?: {
      stocks: number;
      transactions: number;
      bomItems: number;
    };
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MaterialBaseListResponse {
  materialBases: (MaterialBase & {
    materials?: Material[];
    _count?: {
      materials: number;
    };
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MaterialColorListResponse {
  materialColors: (MaterialColor & {
    materials?: Material[];
    _count?: {
      materials: number;
    };
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MaterialStockListResponse {
  stocks: (MaterialStock & {
    material?: Material & {
      materialBase?: MaterialBase;
      color?: MaterialColor;
    };
    warehouse?: Warehouse;
    isLowStock?: boolean;
    stockValue?: number;
    shortage?: number;
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 에러 타입 정의
export interface MaterialApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Prisma 관련 타입 확장
export type MaterialWithRelations = Material & {
  materialBase?: MaterialBase;
  color?: MaterialColor;
  stocks?: MaterialStock[];
  transactions?: MaterialTransaction[];
  bomItems?: BOMItem[];
};

export type MaterialBaseWithRelations = MaterialBase & {
  createdBy?: User;
  materials?: Material[];
  suppliers?: MaterialSupplier[];
  images?: MaterialImage[];
  drawings?: MaterialDrawing[];
};

export type MaterialStockWithRelations = MaterialStock & {
  material?: Material & {
    materialBase?: MaterialBase;
    color?: MaterialColor;
  };
  warehouse?: Warehouse;
};

export type MaterialTransactionWithRelations = MaterialTransaction & {
  material?: Material & {
    materialBase?: MaterialBase;
    color?: MaterialColor;
  };
  warehouse?: Warehouse;
  supplier?: Supplier;
  project?: Project;
  user?: User;
};

// API에서 사용되는 추가 타입들

// 재고 현황 조회 관련 타입
export interface InventoryQueryParams {
  warehouseId?: string;
  category?: string;
  materialId?: string;
  lowStock?: boolean;
  groupBy?: "warehouse" | "category" | "material";
  includeValue?: boolean;
  page?: number;
  limit?: number;
}

// 재고 현황 응답 타입
export interface InventoryResponse {
  inventoryData: InventoryItem[];
  totalStats: {
    totalItems: number;
    totalStock: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue?: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 재고 아이템 타입 (계산된 필드 포함)
export interface InventoryItem {
  id: string;
  materialId: string;
  warehouseId: string;
  currentStock: number;
  safetyStock: number;
  unitPrice: number | null;
  lastUpdated: Date;
  material: {
    id: string;
    size: string | null;
    materialBase: {
      id: string;
      code: string;
      name: string;
      category: string;
      unit: string;
      specification: string | null;
    };
  };
  warehouse: {
    id: string;
    code: string;
    name: string;
    location: string | null;
  };
  isLowStock: boolean;
  isOutOfStock: boolean;
  stockValue: number;
  shortage: number;
  stockStatus: "OUT_OF_STOCK" | "LOW_STOCK" | "NORMAL";
}

// 창고별 재고 그룹 타입
export interface WarehouseInventoryGroup {
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  location: string | null;
  totalItems: number;
  totalStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  items: InventoryItem[];
}

// 카테고리별 재고 그룹 타입
export interface CategoryInventoryGroup {
  category: string;
  totalStock: number;
  itemCount: number;
  averagePrice: number;
  totalValue: number;
}

// 자재 거래 리포트 쿼리 파라미터
export interface TransactionReportParams {
  startDate?: string;
  endDate?: string;
  warehouseId?: string;
  materialId?: string;
  type?: "IN" | "OUT";
  groupBy?: "date" | "material" | "warehouse" | "supplier";
  period?: "daily" | "weekly" | "monthly";
}

// 자재 거래 리포트 API 응답 타입
export interface TransactionReportApiResponse {
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
  groupedData?: Record<
    string,
    {
      quantity: number;
      value: number;
      count: number;
    }
  >;
}

// 자재 상세 조회 응답 타입 (계산된 필드 포함)
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

// 창고 상세 조회 응답 타입 (요약 정보 포함)
export interface WarehouseDetailResponse extends Warehouse {
  summary: {
    totalItems: number;
    totalStock: number;
    lowStockItems: number;
  };
  stocks: Array<
    MaterialStockWithRelations & {
      isLowStock: boolean;
      stockValue: number;
    }
  >;
}

// 자재 요약 정보 타입
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

// 검색 조건 타입들
export interface MaterialSearchWhere {
  OR?: Array<{
    materialBase?: {
      OR?: Array<{
        code?: { contains: string };
        name?: { contains: string };
        category?: { contains: string };
      }>;
    };
    size?: { contains: string };
  }>;
  materialBase?: {
    category?: string;
    isActive?: boolean;
  };
  isActive?: boolean;
  colorId?: string;
}

export interface WarehouseSearchWhere {
  OR?: Array<{
    name?: { contains: string };
    code?: { contains: string };
    location?: { contains: string };
  }>;
  purpose?: string;
  isActive?: boolean;
}

export interface MaterialStockSearchWhere {
  materialId?: string;
  warehouseId?: string;
  material?: {
    materialBase?: {
      category?: string;
    };
  };
  currentStock?: {
    lte?: number;
  };
}

// 집계 결과 타입들
export interface MaterialStockAggregateResult {
  materialId: string;
  _sum: {
    currentStock: number | null;
  };
  _count: {
    id: number;
  };
  _avg: {
    unitPrice: number | null;
  };
}

export interface CategoryAggregateResult {
  category: string;
  totalStock: number;
  itemCount: number;
  averagePrice: number;
  totalValue: number;
}

// =============================================================================
// MaterialColor API 타입 정의
// =============================================================================

// MaterialColor API 상수
export const MATERIAL_COLOR_FILE_ROLES = {
  COLOR_IMAGE: "COLOR_IMAGE", // 메인 색상 이미지
  THUMBNAIL: "THUMBNAIL", // 썸네일 이미지
  GALLERY: "GALLERY", // 갤러리 이미지
  FINISH_SAMPLE: "FINISH_SAMPLE", // 후처리 샘플 이미지
} as const;

export type MaterialColorFileRole = keyof typeof MATERIAL_COLOR_FILE_ROLES;

// MaterialColor 생성 요청 타입
export interface CreateMaterialColorRequest {
  code: string;
  name: string;
  finishType?: string;
  colorImage?: string; // 레거시 필드
}

// MaterialColor 수정 요청 타입
export interface UpdateMaterialColorRequest {
  code?: string;
  name?: string;
  finishType?: string;
  colorImage?: string; // 레거시 필드
}

// MaterialColor 색상 이미지 업로드 요청 타입
export interface MaterialColorFileUploadRequest {
  role: MaterialColorFileRole;
  order?: number;
  replaceExisting?: boolean; // 기존 파일 대체 여부
}

// MaterialColor 목록 따어오기 쿼리 매개변수
export interface MaterialColorListParams {
  page?: number;
  limit?: number;
  search?: string; // 코드, 이름에서 검색
  finishType?: string; // 후처리 종류 필터
  includeFiles?: boolean; // 파일 정보 포함 여부
  sortBy?: "code" | "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// MaterialColor 목록 API 응답 타입
export interface MaterialColorListResponse {
  colors: MaterialColorWithFiles[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalColors: number;
    withImages: number;
    finishTypes: string[];
  };
}

// MaterialColor 상세 조회 API 응답 타입
export interface MaterialColorDetailResponse extends MaterialColorWithFiles {
  usageCount: number; // 이 색상을 사용하는 자재 수
  relatedMaterials: Material[]; // 관련 자재 목록 (제한된 수)
  fileStats: {
    totalFiles: number;
    imageCount: number;
    thumbnailCount: number;
    galleryCount: number;
    finishSampleCount: number;
  };
}

// MaterialColor 파일 관리 API 응답 타입
export interface MaterialColorFileManagementResponse {
  colorId: string;
  files: Array<{
    id: string;
    role: MaterialColorFileRole;
    order: number;
    file: FileWithRelations;
    createdAt: Date;
  }>;
  uploadUrls?: {
    [key in MaterialColorFileRole]?: string; // presigned URL
  };
}

// MaterialColor 검색 조건 타입
export interface MaterialColorSearchWhere {
  OR?: Array<{
    code?: { contains: string };
    name?: { contains: string };
  }>;
  finishType?: string;
  files?: {
    some?: {
      role?: MaterialColorFileRole;
    };
  };
}

// MaterialColor 통계 정보 타입
export interface MaterialColorStatsResponse {
  totalColors: number;
  activeColors: number;
  withImages: number;
  withoutImages: number;
  finishTypeDistribution: Array<{
    finishType: string;
    count: number;
  }>;
  recentlyAdded: MaterialColor[];
  mostUsed: Array<{
    color: MaterialColor;
    usageCount: number;
  }>;
}

// MaterialColor API 오류 타입
export interface MaterialColorApiError {
  code: string;
  message: string;
  details?: {
    field?: string;
    value?: unknown; // any 대신 unknown 사용
    constraint?: string;
  };
}

// 통일된 API 응답 래퍼 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: MaterialColorApiError;
  timestamp: string;
}

// MaterialColor 관련 API 엔드포인트 타입
export type MaterialColorApiEndpoints = {
  // 색상 CRUD
  list: {
    params: MaterialColorListParams;
    response: ApiResponse<MaterialColorListResponse>;
  };
  detail: {
    params: { id: string; includeFiles?: boolean };
    response: ApiResponse<MaterialColorDetailResponse>;
  };
  create: {
    body: CreateMaterialColorRequest;
    response: ApiResponse<MaterialColor>;
  };
  update: {
    params: { id: string };
    body: UpdateMaterialColorRequest;
    response: ApiResponse<MaterialColor>;
  };
  delete: {
    params: { id: string };
    response: ApiResponse<{ deleted: boolean }>;
  };

  // 파일 관리
  uploadFile: {
    params: { id: string };
    body: MaterialColorFileUploadRequest;
    response: ApiResponse<MaterialColorFileRelation>;
  };
  deleteFile: {
    params: { id: string; fileId: string };
    response: ApiResponse<{ deleted: boolean }>;
  };
  reorderFiles: {
    params: { id: string };
    body: { fileOrders: Array<{ fileId: string; order: number }> };
    response: ApiResponse<MaterialColorFileRelation[]>;
  };

  // 통계 및 검색
  stats: { response: ApiResponse<MaterialColorStatsResponse> };
  search: {
    params: { query: string; includeFiles?: boolean };
    response: ApiResponse<MaterialColor[]>;
  };
};
