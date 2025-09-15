# Material Management API Documentation

## 개요

자재 관리 시스템의 RESTful API 문서입니다. 모든 API는 인증이 필요하며, NextAuth v5를 통한 JWT 토큰 인증을 사용합니다.

## 인증

모든 API 요청에는 유효한 인증 세션이 필요합니다.

```javascript
// 클라이언트에서 사용 예시
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
if (!session) {
  // 로그인 필요
}
```

## API 엔드포인트

### 1. Material Colors (자재 색상)

#### GET /api/material-colors
자재 색상 목록 조회

**Query Parameters:**
- `page` (number): 페이지 번호 (기본값: 1)
- `limit` (number): 페이지당 항목 수 (기본값: 10)
- `search` (string): 검색어 (코드, 이름)
- `finishType` (string): 후처리 타입 필터

**Response:**
```json
{
  "colors": [
    {
      "id": "string",
      "code": "string",
      "name": "string",
      "finishType": "string",
      "colorImage": "string",
      "materials": [],
      "totalStock": 0,
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### POST /api/material-colors
새 자재 색상 생성

**Request Body:**
```json
{
  "code": "WHITE",
  "name": "화이트",
  "finishType": "아노다이징",
  "colorImage": "optional-image-url"
}
```

#### GET /api/material-colors/[id]
특정 자재 색상 상세 조회

#### PUT /api/material-colors/[id]
자재 색상 정보 수정

#### DELETE /api/material-colors/[id]
자재 색상 삭제

### 2. Material Stock (자재 재고)

#### GET /api/material-stock
자재 재고 목록 조회

**Query Parameters:**
- `page`, `limit`: 페이지네이션
- `materialId`: 자재 ID 필터
- `warehouseId`: 창고 ID 필터
- `colorId`: 색상 ID 필터
- `lowStock`: 안전재고 미달 필터 (boolean)
- `search`: 검색어

**Response:**
```json
{
  "stocks": [
    {
      "id": "string",
      "material": { "id": "string", "name": "string" },
      "warehouse": { "id": "string", "name": "string" },
      "color": { "id": "string", "name": "string" },
      "size": "string",
      "currentStock": 100,
      "safetyStock": 20,
      "unitPrice": 15000,
      "isLowStock": false,
      "isOutOfStock": false,
      "stockValue": 1500000,
      "shortage": 0,
      "lastUpdated": "datetime"
    }
  ],
  "pagination": { ... }
}
```

#### POST /api/material-stock
초기 재고 생성

**Request Body:**
```json
{
  "materialId": "string",
  "warehouseId": "string",
  "colorId": "string",
  "size": "3M",
  "currentStock": 100,
  "safetyStock": 20,
  "unitPrice": 15000
}
```

#### PUT /api/material-stock
재고 수량 업데이트

**Request Body:**
```json
{
  "id": "string",
  "currentStock": 150,
  "safetyStock": 25,
  "unitPrice": 16000
}
```

### 3. Material Transactions (자재 거래)

#### GET /api/material-transactions
자재 거래 내역 조회

**Query Parameters:**
- `page`, `limit`: 페이지네이션
- `materialId`: 자재 ID 필터
- `warehouseId`: 창고 ID 필터
- `supplierId`: 공급업체 ID 필터
- `projectId`: 프로젝트 ID 필터
- `type`: 거래 타입 (IN/OUT)
- `startDate`, `endDate`: 날짜 범위
- `search`: 검색어

**Response:**
```json
{
  "transactions": [
    {
      "id": "string",
      "type": "IN",
      "material": { "id": "string", "name": "string" },
      "warehouse": { "id": "string", "name": "string" },
      "color": { "id": "string", "name": "string" },
      "supplier": { "id": "string", "name": "string" },
      "project": { "id": "string", "name": "string" },
      "quantity": 50,
      "unitPrice": 15000,
      "totalPrice": 750000,
      "reference": "PO-2024-001",
      "notes": "정기 입고",
      "user": { "id": "string", "name": "string" },
      "createdAt": "datetime"
    }
  ],
  "pagination": { ... }
}
```

#### POST /api/material-transactions
새 거래 생성 (입고/출고)

**Request Body:**
```json
{
  "type": "IN",
  "materialId": "string",
  "warehouseId": "string",
  "colorId": "string",
  "size": "3M",
  "quantity": 50,
  "unitPrice": 15000,
  "totalPrice": 750000,
  "supplierId": "string",
  "projectId": "string",
  "reference": "PO-2024-001",
  "notes": "정기 입고"
}
```

### 4. Special APIs (특수 기능)

#### GET /api/materials/summary
자재 관리 요약 정보

**Response:**
```json
{
  "overview": {
    "totalMaterialBases": 150,
    "totalMaterials": 300,
    "totalWarehouses": 5,
    "totalSuppliers": 25,
    "totalColors": 12,
    "activeProjects": 8
  },
  "inventory": {
    "totalStockItems": 500,
    "lowStockItems": 15,
    "outOfStockItems": 3,
    "totalStockValue": 50000000,
    "lowStockPercentage": 3.0
  },
  "transactions": {
    "period": 30,
    "totalTransactions": 120,
    "inTransactions": 80,
    "outTransactions": 40,
    "transactionValue": 15000000,
    "netFlow": 5000000
  },
  "distribution": {
    "materialsByCategory": [...],
    "stockByWarehouse": [...]
  },
  "recent": {
    "transactions": [...],
    "lowStockItems": [...]
  },
  "trends": {
    "monthlyTransactions": [...]
  }
}
```

#### GET /api/materials/inventory
재고 현황 조회

**Query Parameters:**
- `groupBy`: 그룹화 기준 (material, category, warehouse, color)
- `warehouseId`: 창고 필터
- `category`: 카테고리 필터
- `colorId`: 색상 필터
- `lowStock`: 안전재고 미달 필터
- `outOfStock`: 품절 필터

#### GET /api/material-transactions/report
거래 내역 리포트

**Query Parameters:**
- `startDate`, `endDate`: 날짜 범위
- `groupBy`: 그룹화 기준 (date, material, warehouse, supplier, project)
- `period`: 기간 단위 (daily, weekly, monthly)
- `warehouseId`, `supplierId`, `projectId`, `materialId`: 필터
- `type`: 거래 타입 필터

### 5. Suppliers (공급업체)

#### GET /api/suppliers
공급업체 목록 조회

#### POST /api/suppliers
새 공급업체 생성

#### GET /api/suppliers/[id]
공급업체 상세 조회

#### PUT /api/suppliers/[id]
공급업체 정보 수정

#### DELETE /api/suppliers/[id]
공급업체 삭제

### 6. Warehouses (창고)

#### GET /api/warehouses
창고 목록 조회

#### POST /api/warehouses
새 창고 생성

#### GET /api/warehouses/[id]
창고 상세 조회

#### PUT /api/warehouses/[id]
창고 정보 수정

#### DELETE /api/warehouses/[id]
창고 삭제

### 7. Material Bases (기본 자재)

#### GET /api/material-bases
기본 자재 목록 조회

#### POST /api/material-bases
새 기본 자재 생성

#### GET /api/material-bases/[id]
기본 자재 상세 조회

#### PUT /api/material-bases/[id]
기본 자재 정보 수정

#### DELETE /api/material-bases/[id]
기본 자재 삭제

### 8. Materials (자재 인스턴스)

#### GET /api/materials
자재 인스턴스 목록 조회

#### POST /api/materials
새 자재 인스턴스 생성

#### GET /api/materials/[id]
자재 인스턴스 상세 조회

#### PUT /api/materials/[id]
자재 인스턴스 정보 수정

#### DELETE /api/materials/[id]
자재 인스턴스 삭제

## 에러 응답

모든 API는 다음과 같은 표준 에러 응답을 반환합니다:

```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "details": "상세 정보 (선택적)"
}
```

**HTTP 상태 코드:**
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 필요
- `403`: 권한 없음
- `404`: 리소스 없음
- `409`: 충돌 (중복 등)
- `500`: 서버 오류

## 사용 예시

### React + TanStack Query 사용 예시

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// 자재 색상 목록 조회
export function useMaterialColors(params?: {
  page?: number;
  limit?: number;
  search?: string;
  finishType?: string;
}) {
  return useQuery({
    queryKey: ['material-colors', params],
    queryFn: async () => {
      const { data } = await axios.get('/api/material-colors', { params });
      return data;
    }
  });
}

// 자재 색상 생성
export function useCreateMaterialColor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (colorData: CreateMaterialColorRequest) => {
      const { data } = await axios.post('/api/material-colors', colorData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-colors'] });
    }
  });
}

// 재고 현황 조회
export function useMaterialInventory(params?: {
  groupBy?: string;
  warehouseId?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: ['material-inventory', params],
    queryFn: async () => {
      const { data } = await axios.get('/api/materials/inventory', { params });
      return data;
    }
  });
}
```

### 컴포넌트 사용 예시

```typescript
import { useMaterialColors, useCreateMaterialColor } from '@/hooks/useMaterials';

export function MaterialColorsPage() {
  const { data: colors, isLoading } = useMaterialColors({ page: 1, limit: 20 });
  const createColor = useCreateMaterialColor();

  const handleCreateColor = async (colorData: CreateMaterialColorRequest) => {
    try {
      await createColor.mutateAsync(colorData);
      toast.success('색상이 생성되었습니다.');
    } catch (error) {
      toast.error('색상 생성에 실패했습니다.');
    }
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div>
      {colors?.colors.map(color => (
        <div key={color.id}>
          <h3>{color.name} ({color.code})</h3>
          <p>총 재고: {color.totalStock}</p>
        </div>
      ))}
    </div>
  );
}
```

## 테스트

API 테스트를 위한 스크립트가 제공됩니다:

```bash
# 서버 실행
yarn dev

# API 테스트 실행
node test-material-apis.js
```

## 주의사항

1. **인증**: 모든 API 요청에는 유효한 세션이 필요합니다.
2. **트랜잭션**: 재고 변경을 수반하는 작업은 데이터베이스 트랜잭션으로 처리됩니다.
3. **검증**: 모든 입력 데이터는 서버에서 검증됩니다.
4. **관계 데이터**: 삭제 시 연관된 데이터가 있으면 삭제가 거부됩니다.
5. **페이지네이션**: 대용량 데이터는 페이지네이션을 통해 조회합니다.
