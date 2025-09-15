import type {
  UserRole,
  TeamRole,
  ProjectRole,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  BOMType
} from './enums';

// 사용자 타입
export type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  password: string | null;
  image: string | null;
  role: UserRole;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// 팀 타입
export type Team = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  adminId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// 팀 멤버 타입
export type TeamMember = {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  createdAt: Date;
  updatedAt: Date;
};

// 프로젝트 타입
export type Project = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  preInspectionDate: Date | null;
  endDate: Date | null;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
};

// 프로젝트 팀 타입
export type ProjectTeam = {
  id: string;
  projectId: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
};

// 프로젝트 멤버 타입
export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  createdAt: Date;
  updatedAt: Date;
};

// 작업 타입
export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  projectId: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// 자재 기본 정보 타입
export type MaterialBase = {
  id: string;
  code: string;
  name: string;
  unitWeight: number | null;
  postProcessing: string | null;
  processingRequired: boolean;
  unit: string;
  packagingUnit: number | null;
  packagingMethod: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// 자재 이미지 타입
export type MaterialImage = {
  id: string;
  url: string;
  isDefault: boolean;
  materialBaseId: string;
  createdAt: Date;
  updatedAt: Date;
};

// 자재 타입
export type Material = {
  id: string;
  materialBaseId: string;
  colorCode: string | null;
  colorName: string | null;
  colorImageUrl: string | null;
  postProcessType: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// BOM 타입
export type BOM = {
  id: string;
  productCode: string;
  productName: string;
  productType: BOMType;
  description: string | null;
  drawingUrl: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// BOM 아이템 타입
export type BOMItem = {
  id: string;
  bomId: string;
  materialId: string;
  quantity: number;
  sizeFormula: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// 프로젝트 BOM 타입
export type ProjectBOM = {
  id: string;
  bomId: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
};

// 알림 타입
export type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// 파일 타입
export type File = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};
