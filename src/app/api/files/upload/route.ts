import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processFileUpload, extractFileFromFormData } from '@/lib/file-upload';
import { FileUploadResponse, MultipleFileUploadResponse, FileWithRelations, stringifyTags } from '@/types/file';
import type { ApiResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '인증이 필요합니다.',
      }, { status: 401 });
    }

    // FormData에서 파일과 추가 정보 추출
    const formData = await request.formData();
    
    // 단일 파일 또는 다중 파일 확인
    const singleFile = formData.get('file') as File;
    const multipleFiles = formData.getAll('files') as File[];
    
    const description = formData.get('description') as string || undefined;
    const tags = formData.get('tags') as string || undefined;
    const isPublic = formData.get('isPublic') === 'true';
    
    // 파일 배열 준비
    let filesToProcess: File[] = [];
    
    if (singleFile && singleFile.size > 0) {
      // 단일 파일 업로드
      filesToProcess = [singleFile];
    } else if (multipleFiles && multipleFiles.length > 0) {
      // 다중 파일 업로드
      filesToProcess = multipleFiles.filter(file => file && file.size > 0);
    }
    
    if (filesToProcess.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '업로드할 파일이 선택되지 않았습니다.',
      }, { status: 400 });
    }

    // 단일 파일 처리
    if (filesToProcess.length === 1) {
      const file = filesToProcess[0];
      
      // 파일 업로드 처리
      const uploadedFileInfo = await processFileUpload(file);

      // 데이터베이스에 파일 정보 저장
      const savedFile = await prisma.file.create({
        data: {
          originalName: uploadedFileInfo.originalName,
          fileName: uploadedFileInfo.storedName,
          filePath: uploadedFileInfo.path,
          url: uploadedFileInfo.url,
          size: uploadedFileInfo.size,
          mimeType: uploadedFileInfo.mimeType,
          extension: uploadedFileInfo.extension,
          category: uploadedFileInfo.category,
          description: description || null,
          tags: tags || null,
          isPublic,
          downloadCount: 0,
          width: uploadedFileInfo.width || null,
          height: uploadedFileInfo.height || null,
          thumbnailUrl: uploadedFileInfo.thumbnailUrl || null,
          version: 1,
          isLatest: true,
          uploadedById: session.user.id,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const response: FileUploadResponse = {
        success: true,
        file: savedFile,
      };

      return NextResponse.json<ApiResponse<FileUploadResponse>>({
        success: true,
        data: response,
        message: '파일이 성공적으로 업로드되었습니다.',
      });
    }
    
    // 다중 파일 처리
    const uploadResults: Array<{ success: boolean; file?: FileWithRelations; error?: string; originalName: string }> = [];
    const successfulUploads: FileWithRelations[] = [];
    const failedUploads: Array<{ originalName: string; error: string }> = [];
    
    for (const file of filesToProcess) {
      try {
        // 파일 업로드 처리
        const uploadedFileInfo = await processFileUpload(file);

        // 데이터베이스에 파일 정보 저장
        const savedFile = await prisma.file.create({
          data: {
            originalName: uploadedFileInfo.originalName,
            fileName: uploadedFileInfo.storedName,
            filePath: uploadedFileInfo.path,
            url: uploadedFileInfo.url,
            size: uploadedFileInfo.size,
            mimeType: uploadedFileInfo.mimeType,
            extension: uploadedFileInfo.extension,
            category: uploadedFileInfo.category,
            description: description || null,
            tags: tags || null,
            isPublic,
            downloadCount: 0,
            width: uploadedFileInfo.width || null,
            height: uploadedFileInfo.height || null,
            thumbnailUrl: uploadedFileInfo.thumbnailUrl || null,
            version: 1,
            isLatest: true,
            uploadedById: session.user.id,
          },
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        
        uploadResults.push({
          success: true,
          file: savedFile,
          originalName: file.name,
        });
        
        successfulUploads.push(savedFile);
        
      } catch (fileError) {
        console.error(`File upload error for ${file.name}:`, fileError);
        
        const errorMessage = fileError instanceof Error ? fileError.message : '파일 업로드 중 오류가 발생했습니다.';
        
        uploadResults.push({
          success: false,
          error: errorMessage,
          originalName: file.name,
        });
        
        failedUploads.push({
          originalName: file.name,
          error: errorMessage,
        });
      }
    }
    
    const multipleResponse: MultipleFileUploadResponse = {
      success: successfulUploads.length > 0,
      files: successfulUploads,
      results: uploadResults,
      totalFiles: filesToProcess.length,
      successCount: successfulUploads.length,
      failureCount: failedUploads.length,
      failures: failedUploads,
    };
    
    const statusCode = successfulUploads.length > 0 ? 200 : 400;
    const message = successfulUploads.length === filesToProcess.length 
      ? `${successfulUploads.length}개 파일이 모두 성공적으로 업로드되었습니다.`
      : failedUploads.length === filesToProcess.length
      ? '모든 파일 업로드에 실패했습니다.'
      : `${successfulUploads.length}개 파일이 업로드되었습니다. ${failedUploads.length}개 파일은 실패했습니다.`;

    if (successfulUploads.length > 0) {
      return NextResponse.json<ApiResponse<MultipleFileUploadResponse>>({
        success: true,
        data: multipleResponse,
        message,
      }, { status: statusCode });
    } else {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: message,
      }, { status: statusCode });
    }

  } catch (error) {
    console.error('File upload error:', error);
    
    const errorMessage = error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.';
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error: 'GET 메서드는 지원되지 않습니다.',
  }, { status: 405 });
}
