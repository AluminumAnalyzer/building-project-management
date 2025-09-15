import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// 허용된 파일 타입
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  CAD: ['application/dwg', 'application/dxf', 'model/step', 'model/iges'],
  SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
};

// 파일 크기 제한 (바이트)
export const MAX_FILE_SIZE = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB
  CAD: 100 * 1024 * 1024, // 100MB
  DEFAULT: 25 * 1024 * 1024, // 25MB
};

// 업로드된 파일 정보 타입
export interface UploadedFileInfo {
  originalName: string;
  storedName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  extension: string;
  category: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

// 파일 카테고리 결정
export function getFileCategory(mimeType: string): string {
  if (ALLOWED_FILE_TYPES.IMAGE.includes(mimeType)) return 'IMAGE';
  if (ALLOWED_FILE_TYPES.DOCUMENT.includes(mimeType)) return 'DOCUMENT';
  if (ALLOWED_FILE_TYPES.CAD.includes(mimeType)) return 'CAD';
  if (ALLOWED_FILE_TYPES.SPREADSHEET.includes(mimeType)) return 'SPREADSHEET';
  if (ALLOWED_FILE_TYPES.ARCHIVE.includes(mimeType)) return 'ARCHIVE';
  return 'OTHER';
}

// 파일 확장자 추출
export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase().substring(1);
}

// 안전한 파일명 생성
export function generateSafeFileName(originalName: string): string {
  const extension = getFileExtension(originalName);
  const uuid = uuidv4();
  const timestamp = Date.now();
  return `${timestamp}_${uuid}.${extension}`;
}

// 업로드 디렉토리 생성
export async function ensureUploadDirectory(category: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', category.toLowerCase());
  
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  
  return uploadDir;
}

// 이미지 메타데이터 추출
export async function getImageMetadata(filePath: string): Promise<{ width: number; height: number } | null> {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  } catch (error) {
    console.error('Error getting image metadata:', error);
    return null;
  }
}

// 썸네일 생성
export async function generateThumbnail(
  originalPath: string,
  thumbnailPath: string,
  width: number = 300,
  height: number = 300
): Promise<void> {
  try {
    await sharp(originalPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
}

// 파일 유효성 검사
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // 파일 크기 검사
  const category = getFileCategory(file.type);
  const maxSize = MAX_FILE_SIZE[category as keyof typeof MAX_FILE_SIZE] || MAX_FILE_SIZE.DEFAULT;
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `파일 크기가 너무 큽니다. 최대 ${Math.round(maxSize / (1024 * 1024))}MB까지 허용됩니다.`,
    };
  }

  // 파일 타입 검사
  const allAllowedTypes = Object.values(ALLOWED_FILE_TYPES).flat();
  if (!allAllowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: '지원하지 않는 파일 형식입니다.',
    };
  }

  return { isValid: true };
}

// FormData에서 파일 추출
export async function extractFileFromFormData(request: NextRequest): Promise<File | null> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file || file.size === 0) {
      return null;
    }
    
    return file;
  } catch (error) {
    console.error('Error extracting file from FormData:', error);
    return null;
  }
}

// 파일 업로드 처리
export async function processFileUpload(file: File): Promise<UploadedFileInfo> {
  // 파일 유효성 검사
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const category = getFileCategory(file.type);
  const extension = getFileExtension(file.name);
  const storedName = generateSafeFileName(file.name);
  
  // 업로드 디렉토리 생성
  const uploadDir = await ensureUploadDirectory(category);
  const filePath = path.join(uploadDir, storedName);
  const relativePath = path.join('uploads', category.toLowerCase(), storedName);
  const url = `/${relativePath}`;

  // 파일 저장
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);

  // 기본 파일 정보
  const fileInfo: UploadedFileInfo = {
    originalName: file.name,
    storedName,
    path: relativePath,
    url,
    size: file.size,
    mimeType: file.type,
    extension,
    category,
  };

  // 이미지인 경우 추가 처리
  if (category === 'IMAGE' && file.type !== 'image/svg+xml') {
    try {
      // 이미지 메타데이터 추출
      const metadata = await getImageMetadata(filePath);
      if (metadata) {
        fileInfo.width = metadata.width;
        fileInfo.height = metadata.height;
      }

      // 썸네일 생성
      const thumbnailName = `thumb_${storedName}`;
      const thumbnailPath = path.join(uploadDir, thumbnailName);
      const thumbnailRelativePath = path.join('uploads', category.toLowerCase(), thumbnailName);
      
      await generateThumbnail(filePath, thumbnailPath);
      fileInfo.thumbnailUrl = `/${thumbnailRelativePath}`;
    } catch (error) {
      console.error('Error processing image:', error);
      // 이미지 처리 실패해도 파일 업로드는 성공으로 처리
    }
  }

  return fileInfo;
}

// 다중 파일 업로드 처리
export async function processMultipleFileUploads(files: File[]): Promise<UploadedFileInfo[]> {
  const results: UploadedFileInfo[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const fileInfo = await processFileUpload(file);
      results.push(fileInfo);
    } catch (error) {
      errors.push(`${file.name}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  if (errors.length > 0 && results.length === 0) {
    throw new Error(`모든 파일 업로드 실패: ${errors.join(', ')}`);
  }

  return results;
}
