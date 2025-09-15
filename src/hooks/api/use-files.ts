import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/lib/axios';
import type { ApiResponse, FileUploadResponse } from '@/types/api';

// 파일 업로드 훅
export function useFileUpload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<ApiResponse<FileUploadResponse>>(
        '/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('File uploaded successfully:', data);
      // 필요한 경우 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('File upload error:', handleApiError(error));
    },
  });
}

// 다중 파일 업로드 훅
export function useMultipleFileUpload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (files: File[]) => {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiClient.post<ApiResponse<FileUploadResponse>>(
          '/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        if (!response.data.success) {
          throw new Error(`${file.name}: ${response.data.error}`);
        }
        
        return response.data.data;
      });
      
      return await Promise.all(uploadPromises);
    },
    onSuccess: (data) => {
      console.log('Files uploaded successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('Multiple file upload error:', handleApiError(error));
    },
  });
}

// 파일 업로드 진행률을 포함한 훅
export function useFileUploadWithProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      file, 
      onProgress 
    }: { 
      file: File; 
      onProgress?: (progress: number) => void;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<ApiResponse<FileUploadResponse>>(
        '/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('File uploaded successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('File upload error:', handleApiError(error));
    },
  });
}
