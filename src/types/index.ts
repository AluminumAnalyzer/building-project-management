// 타입 정의 중앙화 - 명시적 export로 충돌 방지

// 기본 모델 타입들 (models.ts에서만 export)
export type {
  User,
  Project,
  Team,
  TeamMember,
  ProjectTeam,
  ProjectMember,
  Task,
  MaterialBase,
  Material,
  MaterialImage,
  BOM,
  BOMItem,
  ProjectBOM,
  Notification,
  File
} from './models';

// Material 관련 타입들 (material.ts에서 export)
export type {
  MaterialColor,
  MaterialStock,
  MaterialTransaction,
  Supplier,
  Warehouse,
  MaterialSupplier,
  MaterialDrawing,
  MaterialWithRelations
} from './material';

// Enum 타입들
export * from './enums';

// API 기본 타입들 (api.ts에서만 export)
export type {
  ApiSuccess,
  ApiError as BaseApiError,
  ApiResponse,
  PaginationMeta,
  PaginatedResponse,
  FileUploadResponse,
  SearchRequest,
  IdParam,
  StatusUpdateRequest
} from './api';

// API 요청 타입들 (api-requests.ts에서만 export)
export type {
  CreateMaterialBaseRequest,
  UpdateMaterialBaseRequest,
  GetMaterialBasesParams,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  GetMaterialsParams,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  GetSuppliersParams,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  GetWarehousesParams,
  CreateMaterialColorRequest,
  UpdateMaterialColorRequest,
  GetMaterialColorsParams,
  CreateMaterialStockRequest,
  UpdateMaterialStockRequest,
  CreateMaterialTransactionRequest,
  GetMaterialTransactionsParams,
  InventoryQueryParams,
  TransactionReportParams,
  UpdateMaterialSupplierRequest,
  CreateMaterialImageRequest,
  UpdateMaterialImageRequest,
  CreateMaterialDrawingRequest,
  UpdateMaterialDrawingRequest,
  FileUploadRequest,
  ExportRequest,
  ImportRequest,
  StatsQueryParams
} from './api-requests';

// API 응답 타입들 (api-responses.ts에서만 export)
export type {
  MaterialBasesResponse,
  MaterialsResponse,
  SuppliersResponse,
  WarehousesResponse,
  MaterialColorsResponse,
  MaterialStockResponse,
  MaterialTransactionsResponse,
  MaterialSummaryResponse,
  MaterialDetailResponse,
  WarehouseDetailResponse,
  SupplierDetailResponse,
  InventoryResponse,
  TransactionReportResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiResult,
  // Specific API endpoint response types
  GetMaterialsResponse,
  GetMaterialResponse,
  CreateMaterialResponse,
  UpdateMaterialResponse,
  DeleteMaterialResponse,
  GetMaterialBasesResponse,
  GetMaterialBaseResponse,
  CreateMaterialBaseResponse,
  UpdateMaterialBaseResponse,
  DeleteMaterialBaseResponse,
  GetSuppliersResponse,
  GetSupplierResponse,
  CreateSupplierResponse,
  UpdateSupplierResponse,
  DeleteSupplierResponse,
  GetWarehousesResponse,
  GetWarehouseResponse,
  CreateWarehouseResponse,
  UpdateWarehouseResponse,
  DeleteWarehouseResponse,
  GetMaterialColorsResponse,
  GetMaterialColorResponse,
  CreateMaterialColorResponse,
  UpdateMaterialColorResponse,
  DeleteMaterialColorResponse,
  GetMaterialStockResponse,
  CreateMaterialStockResponse,
  UpdateMaterialStockResponse,
  DeleteMaterialStockResponse,
  GetMaterialTransactionsResponse,
  CreateMaterialTransactionResponse,
  GetMaterialSummaryResponse,
  GetInventoryResponse,
  GetTransactionReportResponse
} from './api-responses';

// Hook 타입들 (hooks.ts에서만 export)
export type {
  UseMaterialBasesResult,
  UseMaterialBaseResult,
  UseCreateMaterialBaseMutation,
  UseUpdateMaterialBaseMutation,
  UseDeleteMaterialBaseMutation,
  UseMaterialsResult,
  UseMaterialResult,
  UseCreateMaterialMutation,
  UseUpdateMaterialMutation,
  UseDeleteMaterialMutation,
  UseSuppliersResult,
  UseSupplierResult,
  UseCreateSupplierMutation,
  UseUpdateSupplierMutation,
  UseDeleteSupplierMutation,
  UseWarehousesResult,
  UseWarehouseResult,
  UseCreateWarehouseMutation,
  UseUpdateWarehouseMutation,
  UseDeleteWarehouseMutation,
  UseMaterialColorsResult,
  UseMaterialColorResult,
  UseCreateMaterialColorMutation,
  UseUpdateMaterialColorMutation,
  UseDeleteMaterialColorMutation,
  UseMaterialStockResult,
  UseCreateMaterialStockMutation,
  UseUpdateMaterialStockMutation,
  UseMaterialTransactionsResult,
  UseCreateMaterialTransactionMutation,
  UseInfiniteMaterialBasesResult,
  UseInfiniteMaterialsResult,
  UseInfiniteSuppliersResult,
  UseInfiniteWarehousesResult,
  UseInfiniteMaterialColorsResult,
  UseInfiniteMaterialTransactionsResult,
  UseMaterialBasesOptions,
  UseMaterialsOptions,
  UseSuppliersOptions,
  UseWarehousesOptions,
  UseMaterialColorsOptions,
  UseMaterialTransactionsOptions,
  ApiError,
  ValidationError,
  NetworkError
} from './hooks';

// NextAuth 타입 확장
export * from './next-auth';
