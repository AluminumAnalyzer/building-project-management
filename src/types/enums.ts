/**
 * 시스템에서 사용되는 각종 상수 타입 정의
 * Prisma의 SQLite에서는 enum을 지원하지 않으므로 String 타입으로 저장됨
 * TypeScript에서는 타입 안전성을 위해 아래와 같이 타입을 정의하여 사용
 */

// User 역할
export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Team 역할
export const TeamRole = {
  ADMIN: 'ADMIN',
  LEADER: 'LEADER',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
} as const;

export type TeamRole = typeof TeamRole[keyof typeof TeamRole];

// Project 역할
export const ProjectRole = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

export type ProjectRole = typeof ProjectRole[keyof typeof ProjectRole];

// Project 상태
export const ProjectStatus = {
  PLANNING: 'PLANNING',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

// Task 상태
export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  DONE: 'DONE',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

// Task 우선순위
export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

// WorkOrder 상태
export const WorkOrderStatus = {
  PENDING: 'PENDING',
  IN_PRODUCTION: 'IN_PRODUCTION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type WorkOrderStatus = typeof WorkOrderStatus[keyof typeof WorkOrderStatus];

// Shipment 상태
export const ShipmentStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PREPARATION: 'IN_PREPARATION',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
} as const;

export type ShipmentStatus = typeof ShipmentStatus[keyof typeof ShipmentStatus];

// BOM 타입
export const BOMType = {
  FINISHED_PRODUCT: 'FINISHED_PRODUCT',
  SEMI_FINISHED_PRODUCT: 'SEMI_FINISHED_PRODUCT',
} as const;

export type BOMType = typeof BOMType[keyof typeof BOMType];
