// 파일 관련 타입 정의

// Prisma에서 생성된 File 타입 확장
export interface FileWithRelations {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  url: string;
  size: number;
  mimeType: string;
  extension: string;
  category: string;
  description?: string | null;
  tags?: string | null;
  isPublic: boolean;
  downloadCount: number;
  width?: number | null;
  height?: number | null;
  thumbnailUrl?: string | null;
  version: number;
  parentFileId?: string | null;
  isLatest: boolean;
  metadata?: string | null;
  uploadedById: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  uploadedBy?: {
    id: string;
    name?: string | null;
    email: string;
  };
  parentFile?: FileWithRelations | null;
  childFiles?: FileWithRelations[];
}

// 파일 업로드 요청 타입
export interface FileUploadRequest {
  file: File;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  category?: string;
}

// 파일 업로드 응답 타입
export interface FileUploadResponse {
  success: boolean;
  file?: FileWithRelations;
  error?: string;
}

// 다중 파일 업로드 응답 타입
export interface MultipleFileUploadResponse {
  success: boolean;
  files: FileWithRelations[];
  results: Array<{
    success: boolean;
    file?: FileWithRelations;
    error?: string;
    originalName: string;
  }>;
  totalFiles: number;
  successCount: number;
  failureCount: number;
  failures: Array<{
    originalName: string;
    error: string;
  }>;
}

// 파일 검색 파라미터
export interface FileSearchParams {
  query?: string;
  category?: string;
  mimeType?: string;
  uploadedById?: string;
  isPublic?: boolean;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  minSize?: number;
  maxSize?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'size' | 'downloadCount' | 'originalName';
  sortOrder?: 'asc' | 'desc';
}

// 파일 검색 응답 타입
export interface FileSearchResponse {
  files: FileWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 파일 업데이트 요청 타입
export interface FileUpdateRequest {
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

// 파일 버전 생성 요청 타입
export interface FileVersionRequest {
  file: File;
  description?: string;
}

// 파일 통계 타입
export interface FileStats {
  totalFiles: number;
  totalSize: number;
  categoryStats: {
    category: string;
    count: number;
    totalSize: number;
  }[];
  recentUploads: FileWithRelations[];
  popularFiles: FileWithRelations[];
}

// 파일 통계 응답 타입 (API용)
export interface FileStatsResponse {
  totalFiles: number;
  totalSize: number;
  publicFiles: number;
  privateFiles: number;
  recentFiles: number;
  categoryStats: {
    category: string;
    count: number;
    totalSize: number;
  }[];
  monthlyStats: {
    month: string;
    count: number;
    totalSize: number;
  }[];
  mimeTypeStats: {
    mimeType: string;
    count: number;
    totalSize: number;
  }[];
  topDownloads: {
    id: string;
    originalName: string;
    downloadCount: number;
    mimeType: string;
    size: number;
    createdAt: Date;
  }[];
}

// 파일 연결 관련 타입들
export interface ProjectFileRelation {
  id: string;
  projectId: string;
  fileId: string;
  role: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  file: FileWithRelations;
}

export interface MaterialFileRelation {
  id: string;
  materialId: string;
  fileId: string;
  role: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  file: FileWithRelations;
}

export interface BOMFileRelation {
  id: string;
  bomId: string;
  fileId: string;
  role: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  file: FileWithRelations;
}

export interface TaskFileRelation {
  id: string;
  taskId: string;
  fileId: string;
  role: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  file: FileWithRelations;
}

export interface MaterialColorFileRelation {
  id: string;
  colorId: string;
  fileId: string;
  role: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  file: FileWithRelations;
}

// 파일 연결 생성 요청 타입
export interface FileRelationRequest {
  fileId: string;
  role?: string;
  order?: number;
}

// 파일 연결 응답 타입
export interface FileRelationResponse {
  success: boolean;
  relation?: ProjectFileRelation | MaterialFileRelation | BOMFileRelation | TaskFileRelation;
  error?: string;
}

// 파일 카테고리 enum 값들 (문자열로 사용)
export const FILE_CATEGORIES = {
  DOCUMENT: 'DOCUMENT',
  IMAGE: 'IMAGE',
  CAD: 'CAD',
  DRAWING: 'DRAWING',
  SPECIFICATION: 'SPECIFICATION',
  MANUAL: 'MANUAL',
  CERTIFICATE: 'CERTIFICATE',
  SPREADSHEET: 'SPREADSHEET',
  ARCHIVE: 'ARCHIVE',
  OTHER: 'OTHER',
} as const;

// 파일 역할 enum 값들 (문자열로 사용)
export const FILE_ROLES = {
  MAIN_IMAGE: 'MAIN_IMAGE',
  THUMBNAIL: 'THUMBNAIL',
  GALLERY: 'GALLERY',
  DRAWING: 'DRAWING',
  SPECIFICATION: 'SPECIFICATION',
  MANUAL: 'MANUAL',
  CERTIFICATE: 'CERTIFICATE',
  ATTACHMENT: 'ATTACHMENT',
  REFERENCE: 'REFERENCE',
} as const;

// MaterialColor 파일 역할 enum 값들
export const MATERIAL_COLOR_FILE_ROLES = {
  COLOR_IMAGE: 'COLOR_IMAGE',
  THUMBNAIL: 'THUMBNAIL',
  GALLERY: 'GALLERY',
  FINISH_SAMPLE: 'FINISH_SAMPLE',
} as const;

// 파일 MIME 타입 그룹
export const MIME_TYPE_GROUPS = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
  ],
  SPREADSHEET: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
  CAD: [
    'application/dwg',
    'application/dxf',
    'model/step',
    'model/iges',
    'application/x-autocad',
  ],
  ARCHIVE: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ],
} as const;

// 파일 크기 포맷팅 유틸리티
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 파일 확장자에서 카테고리 추정
export function getCategoryFromExtension(extension: string): string {
  const ext = extension.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return FILE_CATEGORIES.IMAGE;
  }
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
    return FILE_CATEGORIES.DOCUMENT;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return FILE_CATEGORIES.SPREADSHEET;
  }
  if (['dwg', 'dxf', 'step', 'iges'].includes(ext)) {
    return FILE_CATEGORIES.CAD;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return FILE_CATEGORIES.ARCHIVE;
  }
  
  return FILE_CATEGORIES.OTHER;
}

// 태그 문자열 파싱
export function parseTags(tagsString?: string | null): string[] {
  if (!tagsString) return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
}

// 태그 배열을 문자열로 변환
export function stringifyTags(tags: string[]): string {
  return tags.filter(tag => tag.trim().length > 0).join(', ');
}
