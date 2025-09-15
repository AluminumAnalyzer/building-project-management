import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/lib/axios';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  SearchRequest, 
  StatusUpdateRequest 
} from '@/types/api';

// 사용자 타입 정의
export type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// 사용자 목록 조회 훅
export function useUsers(params?: SearchRequest) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params?.query) searchParams.append('query', params.query);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
      if (params?.filters?.role) searchParams.append('role', params.filters.role as string);

      const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
        `/users?${searchParams.toString()}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 사용자 상태 업데이트 훅
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: StatusUpdateRequest }) => {
      const response = await apiClient.patch<ApiResponse<User>>(
        `/users/${userId}/status`,
        status
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      
      return response.data.data;
    },
    onSuccess: () => {
      // 사용자 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User status update error:', handleApiError(error));
    },
  });
}

// 사용자 삭제 훅
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.delete<ApiResponse<null>>(`/users/${userId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      
      return response.data;
    },
    onSuccess: () => {
      // 사용자 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User delete error:', handleApiError(error));
    },
  });
}
