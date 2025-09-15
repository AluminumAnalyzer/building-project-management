"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MaterialColor } from "@/types/material";
import {
  useCreateMaterialColor,
  useUpdateMaterialColor,
} from "@/hooks/use-material-colors";
import { toast } from "@/hooks/use-toast";
import {
  ColorFileUpload,
  FileUploadPreview,
} from "@/components/ui/file-upload";
import { MATERIAL_COLOR_FILE_ROLES } from "@/types/file";
import axios from "axios";

const materialColorSchema = z.object({
  code: z.string().min(1, "색상 코드는 필수입니다"),
  name: z.string().min(1, "색상명은 필수입니다"),
  finishType: z.string().optional(),
});

type FormValues = z.infer<typeof materialColorSchema>;

interface MaterialColorDialogProps {
  materialColor: MaterialColor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialColorDialog({
  materialColor,
  open,
  onOpenChange,
}: MaterialColorDialogProps) {
  const createMutation = useCreateMaterialColor();
  const updateMutation = useUpdateMaterialColor();

  // 파일 업로드 상태
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(materialColorSchema),
    defaultValues: {
      code: "",
      name: "",
      finishType: "",
    },
  });

  // 다이얼로그가 열릴 때 폼 데이터 및 파일 설정
  useEffect(() => {
    if (open) {
      if (materialColor) {
        form.reset({
          code: materialColor.code,
          name: materialColor.name,
          finishType: materialColor.finishType || "",
        });

        console.log(materialColor);

        // 기존 파일을 uploadedFiles 상태에 설정
        if (materialColor.files && materialColor.files.length > 0) {
          const existingFiles: FileUploadPreview[] = materialColor.files
            .filter((relation) => relation.file != null)
            .map((relation) => ({
              id: relation.file!.id,
              url: relation.file!.url,
              file: null, // 기존 파일의 경우 File 객체가 없음
              name: relation.file!.originalName,
              size: relation.file!.size,
              type: relation.file!.mimeType,
            }));
          setUploadedFiles(existingFiles);
        } else {
          setUploadedFiles([]);
        }
      } else {
        form.reset({
          code: "",
          name: "",
          finishType: "",
        });
        setUploadedFiles([]);
      }
    }
  }, [open, materialColor, form]);

  // 파일 업로드 함수
  const uploadFiles = async (
    files: FileUploadPreview[],
    role: keyof typeof MATERIAL_COLOR_FILE_ROLES
  ): Promise<string[]> => {
    console.log("[MaterialColor] uploadFiles called with:", {
      filesCount: files.length,
      role,
      files: files.map((f) => ({
        fileName: f.file?.name,
        fileSize: f.file?.size,
        fileType: f.file?.type,
      })),
    });

    const uploadedFileIds: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const filePreview = files[i];

      // 기존 파일(file이 null)인 경우 업로드 건너뛰기
      if (!filePreview.file) {
        console.log(
          `[MaterialColor] Skipping existing file ${i + 1}/${files.length}:`,
          {
            fileName: filePreview.name,
            id: filePreview.id,
          }
        );
        continue;
      }

      console.log(`[MaterialColor] Uploading file ${i + 1}/${files.length}:`, {
        fileName: filePreview.file.name,
        fileSize: filePreview.file.size,
        fileType: filePreview.file.type,
      });

      const formData = new FormData();
      formData.append("files", filePreview.file);
      formData.append("category", "material");
      formData.append("description", `Material color ${role} image`);

      try {
        const response = await axios.post("/api/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log(`[MaterialColor] Upload response for file ${i + 1}:`, {
          success: response.data.success,
          data: response.data.data,
          fullResponse: response.data,
        });

        if (response.data.success && response.data.data) {
          // 단일 파일 업로드 응답: data.file
          // 다중 파일 업로드 응답: data.files
          let fileId: string | undefined;

          if (response.data.data.file) {
            // 단일 파일 업로드 응답
            fileId = response.data.data.file.id;
            console.log(
              `[MaterialColor] Single file uploaded successfully, ID: ${fileId}`
            );
          } else if (
            response.data.data.files &&
            response.data.data.files.length > 0
          ) {
            // 다중 파일 업로드 응답
            fileId = response.data.data.files[0].id;
            console.log(
              `[MaterialColor] Multiple files uploaded, first file ID: ${fileId}`
            );
          }

          if (fileId) {
            uploadedFileIds.push(fileId);
          } else {
            console.error(
              `[MaterialColor] No file ID found in response:`,
              response.data.data
            );
          }
        } else {
          console.error(
            `[MaterialColor] File upload failed or no data returned:`,
            response.data
          );
        }
      } catch (error) {
        console.error(
          `[MaterialColor] File upload error for file ${i + 1}:`,
          error
        );
        throw error;
      }
    }

    console.log(
      "[MaterialColor] uploadFiles completed, returning IDs:",
      uploadedFileIds
    );
    return uploadedFileIds;
  };

  // 색상-파일 관계 생성
  const createFileRelations = async (
    colorId: string,
    fileIds: string[],
    role: keyof typeof MATERIAL_COLOR_FILE_ROLES
  ) => {
    console.log("[MaterialColor] Creating file relations:", {
      colorId,
      fileIds,
      role,
      roleValue: MATERIAL_COLOR_FILE_ROLES[role],
    });

    for (let i = 0; i < fileIds.length; i++) {
      const relationData = {
        colorId,
        fileId: fileIds[i],
        role: MATERIAL_COLOR_FILE_ROLES[role],
        order: i,
      };

      console.log(
        `[MaterialColor] Creating relation ${i + 1}/${fileIds.length}:`,
        relationData
      );

      try {
        const response = await axios.post(
          "/api/material-colors/files",
          relationData
        );
        console.log(
          `[MaterialColor] Relation created successfully:`,
          response.data
        );
      } catch (error) {
        console.error(`[MaterialColor] Failed to create relation:`, error);
        throw error;
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsUploading(true);

      let colorId: string;

      if (materialColor) {
        await updateMutation.mutateAsync({
          id: materialColor.id,
          color: {
            code: data.code,
            name: data.name,
            finishType: data.finishType,
          },
        });
        colorId = materialColor.id;
        toast({
          title: "성공",
          description: "색상이 수정되었습니다.",
        });
      } else {
        console.log("[MaterialColor] Creating new color with data:", {
          code: data.code,
          name: data.name,
          finishType: data.finishType,
        });

        const result = await createMutation.mutateAsync({
          code: data.code,
          name: data.name,
          finishType: data.finishType,
        });

        console.log("[MaterialColor] Create mutation result:", result);

        colorId = result?.id || "";

        console.log("[MaterialColor] Set colorId to:", colorId);

        toast({
          title: "성공",
          description: "색상이 생성되었습니다.",
        });
      }

      // 파일 업로드 및 관계 생성
      if (uploadedFiles.length > 0) {
        console.log(
          "[MaterialColor] Processing uploaded files:",
          uploadedFiles
        );

        // 새로운 파일과 기존 파일을 구분
        const newFiles = uploadedFiles.filter((file) => file.file !== null);
        const existingFiles = uploadedFiles.filter(
          (file) => file.file === null
        );

        console.log("[MaterialColor] File categorization:", {
          newFiles: newFiles.length,
          existingFiles: existingFiles.length,
        });

        // 새로운 파일만 업로드
        let allFileIds: string[] = [];
        if (newFiles.length > 0) {
          console.log("[MaterialColor] Uploading new files...");
          const newFileIds = await uploadFiles(newFiles, "COLOR_IMAGE");
          console.log("[MaterialColor] New file IDs:", newFileIds);
          allFileIds = [...allFileIds, ...newFileIds];
        }

        // 기존 파일 ID 추가
        const existingFileIds = existingFiles
          .map((file) => file.id)
          .filter(Boolean) as string[];
        console.log("[MaterialColor] Existing file IDs:", existingFileIds);
        allFileIds = [...allFileIds, ...existingFileIds];

        console.log("[MaterialColor] All file IDs to process:", allFileIds);

        // 기존 관계를 삭제하고 새로운 관계 생성 (순서 유지를 위해)
        if (materialColor) {
          console.log("[MaterialColor] Deleting existing file relations...");
          try {
            const deleteResponse = await axios.delete(
              `/api/material-colors/${colorId}/files`
            );
            console.log(
              "[MaterialColor] Existing relations deleted:",
              deleteResponse.data
            );
          } catch (error) {
            console.error(
              "[MaterialColor] Failed to delete existing relations:",
              error
            );
            // 기존 관계 삭제 실패해도 계속 진행
          }
        }

        // 새로운 관계 생성
        if (allFileIds.length > 0) {
          console.log("[MaterialColor] Creating new file relations...");
          await createFileRelations(colorId, allFileIds, "COLOR_IMAGE");
          console.log("[MaterialColor] File relations created successfully");
        } else {
          console.log("[MaterialColor] No files to create relations for");
        }
      } else {
        console.log("[MaterialColor] No files to upload");
      }

      // 파일 업로드 상태 초기화
      setUploadedFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Color save error:", error);
      toast({
        title: "오류",
        description: "색상 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {materialColor ? "색상 수정" : "새 색상 추가"}
          </DialogTitle>
          <DialogDescription>
            자재에 사용할 색상 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>색상 코드</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: RAL9016, #FFFFFF, White"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>색상명</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 화이트, 검정" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="finishType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>후처리 종류 (선택사항)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 아노다이징, 파우더코팅, 도장"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 파일 업로드 섹션 */}
            <div className="space-y-6 border-t pt-6">
              <div className="space-y-4">
                <ColorFileUpload
                  role="COLOR_IMAGE"
                  value={uploadedFiles}
                  onChange={setUploadedFiles}
                  maxFiles={1}
                  disabled={isLoading}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "저장 중..." : materialColor ? "수정" : "생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// 프리셋 색상 정의
