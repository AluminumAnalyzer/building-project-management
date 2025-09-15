import axios, { AxiosError, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
import type { ApiResponse, ApiError } from '@/types/api';

// API 클라이언트 기본 설정
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - NextAuth 세션 확인
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      // NextAuth v5에서는 세션 존재 여부만 확인
      // JWT 토큰은 NextAuth가 내부적으로 관리
      if (session?.user) {
        // 세션이 있으면 쿠키를 통해 자동으로 인증됨
        config.withCredentials = true;
      }
    } catch (error) {
      console.warn('Failed to get session for API request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 에러 처리 및 응답 정규화
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;
    
    // 에러 로깅
    console.error('API Error:', {
      status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });
    
    // 상태별 에러 처리
    switch (status) {
      case 401:
        // 인증 오류 - NextAuth가 자동으로 처리
        console.error('Unauthorized access - redirecting to login');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin';
        }
        break;
      case 403:
        console.error('Forbidden access - insufficient permissions');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 422:
        console.error('Validation error:', error.response?.data);
        break;
      case 500:
        console.error('Internal server error');
        break;
      default:
        console.error('Unexpected error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 에러 핸들러 타입
export type ErrorHandler = (error: string) => void;

// API 응답 처리 헬퍼 함수
export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiResponse<unknown>;
    if (apiError && !apiError.success) {
      return (apiError as ApiError).error;
    }
    return error.message || '알 수 없는 오류가 발생했습니다.';
  }
  return '네트워크 오류가 발생했습니다.';
};

// 기본 API 클라이언트 export (하위 호환성)
export const api = apiClient;
