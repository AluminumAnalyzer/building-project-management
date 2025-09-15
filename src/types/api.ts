/**
 * API 응답 타입 정의
 * NextAuth v5와 호환되는 타입들만 유지
 */

// API 성공 응답 타입
export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

// API 오류 응답 타입
export type ApiError = {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
};

// API 응답 통합 타입
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// 페이지네이션 메타데이터
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// 페이지네이션된 응답 타입
export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

// 파일 업로드 응답 타입
export type FileUploadResponse = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
};

// 검색 요청 타입
export type SearchRequest = {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
};

// 일반적인 ID 파라미터 타입
export type IdParam = {
  id: string;
};

// 상태 업데이트 요청 타입
export type StatusUpdateRequest = {
  status: string;
  reason?: string;
};
