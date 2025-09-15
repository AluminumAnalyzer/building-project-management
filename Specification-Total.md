# 건설 시공 관리 시스템 명세서

## 1. 기술 스택

- **프레임워크**: Next.js 15
- **언어**: TypeScript 5
- **데이터베이스**: Prisma (최신 버전)
- **인증**: NextAuth + JWT (커스텀 로그인/회원가입 API)
- **상태 관리**: TanStack Query
- **API 통신**: Axios
- **배포**: Docker (docker-compose.yml)
- **파일 관리**: 파일서버 및 이미지 서버 구축
- **패키지 관리**: Yarn

## 2. 프로젝트 구조

```
/src
  /app                   # Next.js 15 앱 라우터 구조
    /api                 # API 라우트
    /(routes)            # 페이지 라우트
  /components            # 재사용 가능한 컴포넌트
    /ui                  # 기본 UI 컴포넌트
    /auth                # 인증 관련 컴포넌트
    /projects            # 프로젝트 관련 컴포넌트
    /dashboard           # 대시보드 컴포넌트
    /materials           # 자재 관리 컴포넌트
    /bom                 # BOM 관련 컴포넌트
  /lib                   # 유틸리티 및 설정
  /types                 # 타입 정의
  /hooks                 # 커스텀 훅
  /services              # 서비스 로직
  /utils                 # 유틸리티 함수
```

## 3. 주요 기능

### 3.1 인증 시스템

- NextAuth + JWT 기반 커스텀 인증
- 로그인, 회원가입, 비밀번호 재설정
- 역할 기반 접근 제어 (RBAC)

### 3.2 프로젝트 관리

- 프로젝트 CRUD 기능
- 프로젝트 상태 관리 (계획, 진행 중, 완료 등)
- 프로젝트 대시보드

### 3.3 작업 관리

- 작업 CRUD 기능
- 작업 할당 및 진행 상황 추적
- 작업 일정 관리

### 3.4 자재 관리

- 자재 목록 및 재고 관리
- 자재 입/출고 기록 관리
- 자재 발주 관리
- 공급업체 관리

### 3.5 자재 기본 정보 관리

- 자재 마스터 데이터 관리
  - 자재 코드 체계 관리
  - 자재 분류 체계 관리
  - 자재 기본 정보 등록/수정/삭제
- 자재 상세 정보
  - 기본 정보: 코드, 명칭, 분류, 규격, 단위, 단가
  - 재고 정보: 현재고, 최소/최대 재고 수준
  - 제조 정보: 제조사, 모델명
- 자재 이미지 및 첨부파일 관리

### 3.6 BOM(Bill of Materials) 관리

- 프로젝트별 BOM 생성 및 관리
- BOM 버전 관리
- 자재별 BOM 항목 관리
- BOM 기반 자재 소요량 계획

### 3.7 파일 및 이미지 관리

- 파일 업로드/다운로드 기능
- 이미지 갤러리 및 미리보기
- 파일 버전 관리

### 3.8 보고서 및 대시보드

- 프로젝트 진행 상황 보고서
- 작업 완료율 대시보드
- 자재 사용 현황 분석
- BOM 기반 자재 비용 분석

## 4. 데이터베이스 모델

```prisma
// 주요 모델 예시
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          UserRole  @default(USER)
  projects      Project[]
  tasks         Task[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Project {
  id            String    @id @default(cuid())
  name          String
  description   String?
  status        ProjectStatus @default(PLANNING)
  startDate     DateTime?
  endDate       DateTime?
  manager       User      @relation(fields: [managerId], references: [id])
  managerId     String
  tasks         Task[]
  documents     Document[]
  images        Image[]
  materials     MaterialUsage[]
  boms          BOM[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// 자재 관리 관련 모델
model Material {
  id                String    @id @default(cuid())
  code              String    @unique
  name              String
  category          Category  @relation(fields: [categoryId], references: [id])
  categoryId        String
  specification     String?
  unit              String
  unitPrice         Float
  stockQuantity     Float
  minStockLevel     Float?
  maxStockLevel     Float?
  manufacturer      String?
  model             String?
  description       String?
  status            MaterialStatus @default(ACTIVE)
  images            MaterialImage[]
  attachments       MaterialAttachment[]
  supplier          Supplier? @relation(fields: [supplierId], references: [id])
  supplierId        String?
  usages            MaterialUsage[]
  bomItems          BOMItem[]
  createdBy         User      @relation(fields: [createdById], references: [id])
  createdById       String
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Category {
  id            String    @id @default(cuid())
  name          String
  code          String    @unique
  parent        Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  parentId      String?
  children      Category[] @relation("CategoryHierarchy")
  materials     Material[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model BOM {
  id            String    @id @default(cuid())
  name          String
  description   String?
  project       Project   @relation(fields: [projectId], references: [id])
  projectId     String
  version       String
  status        BOMStatus @default(DRAFT)
  items         BOMItem[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## 5. API 엔드포인트

```
/api/auth
  /register       - 회원가입
  /login          - 로그인
  /logout         - 로그아웃
  /reset-password - 비밀번호 재설정

/api/projects     - 프로젝트 관리 API
/api/tasks        - 작업 관리 API
/api/materials    - 자재 관리 API
/api/categories   - 자재 분류 관리 API
/api/suppliers    - 공급업체 관리 API
/api/boms         - BOM 관리 API
/api/files        - 파일 관리 API
```

## 6. 구현 일정

1. 프로젝트 초기 설정 (1일)
2. 데이터베이스 설정 (1일)
3. 인증 시스템 구현 (2일)
4. 프로젝트 관리 기능 (3일)
5. 작업 관리 기능 (3일)
6. 자재 관리 기능 (5일)
   - 자재 분류 관리 (1일)
   - 자재 기본 정보 관리 (2일)
   - 재고 관리 (1일)
   - 공급업체 관리 (1일)
7. BOM 관리 기능 (3일)
8. 파일 및 이미지 관리 (2일)
9. 대시보드 및 보고서 (3일)
10. Docker 배포 설정 (1일)
11. 테스트 및 버그 수정 (2일)
12. 최종 검토 및 문서화 (1일)

## 7. Docker 배포

```yaml
# docker-compose.yml 예시
version: "3"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/project_management
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
      - file-server

  db:
    image: postgres:latest
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=project_management
    volumes:
      - postgres_data:/var/lib/postgresql/data

  file-server:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

volumes:
  postgres_data:
  minio_data:
```
