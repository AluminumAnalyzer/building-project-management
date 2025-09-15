"use client";

import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileImage, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface FileUploadPreview {
  file: File | null;
  url: string;
  id: string;
  name?: string;
  size?: number;
  type?: string;
}

interface FileUploadProps {
  value?: FileUploadPreview[];
  onChange?: (files: FileUploadPreview[]) => void;
  onRemove?: (id: string) => void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  value = [],
  onChange,
  onRemove,
  maxFiles = 5,
  accept = "image/*",
  disabled = false,
  className,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles || disabled) return;

      const newFiles: FileUploadPreview[] = [];
      const remainingSlots = maxFiles - value.length;

      for (let i = 0; i < Math.min(selectedFiles.length, remainingSlots); i++) {
        const file = selectedFiles[i];
        const url = URL.createObjectURL(file);
        const id = `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`;

        newFiles.push({ file, url, id });
      }

      if (newFiles.length > 0) {
        onChange?.([...value, ...newFiles]);
      }
    },
    [value, onChange, maxFiles, disabled]
  );

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect, disabled]
  );

  const handleRemove = (id: string) => {
    const fileToRemove = value.find((f) => f.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.url);
      const newFiles = value.filter((f) => f.id !== id);
      onChange?.(newFiles);
      onRemove?.(id);
    }
  };

  const canUploadMore = value.length < maxFiles;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            클릭하거나 파일을 드래그하여 업로드
          </p>
          <p className="text-xs text-muted-foreground">
            {maxFiles > 1 && `최대 ${maxFiles}개 파일, `}
            {accept === "image/*" ? "이미지 파일만 지원" : accept}
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* File Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {value.map((filePreview) => (
            <div
              key={filePreview.id}
              className="relative group bg-muted rounded-lg overflow-hidden"
            >
              {(filePreview.file?.type || filePreview.type || "").startsWith("image/") ? (
                <div className="aspect-square relative">
                  <Image
                    src={filePreview.url}
                    alt={filePreview.file?.name || filePreview.name || "Image"}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center">
                  <FileImage className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Remove Button */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(filePreview.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>

              {/* File Name */}
              <div className="p-2 bg-white/90 backdrop-blur-sm">
                <p className="text-xs text-gray-600 truncate" title={filePreview.file?.name || filePreview.name || "Unknown"}>
                  {filePreview.file?.name || filePreview.name || "Unknown"}
                </p>
                <p className="text-xs text-gray-500">
                  {((filePreview.file?.size || filePreview.size || 0) / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Count */}
      {maxFiles > 1 && (
        <p className="text-sm text-muted-foreground">
          {value.length}/{maxFiles} 파일 선택됨
        </p>
      )}
    </div>
  );
}

// 색상 전용 파일 업로드 컴포넌트
interface ColorFileUploadProps extends Omit<FileUploadProps, "accept"> {
  role?: "COLOR_IMAGE" | "THUMBNAIL" | "GALLERY" | "FINISH_SAMPLE";
}

export function ColorFileUpload({
  role = "COLOR_IMAGE",
  maxFiles = 1,
  ...props
}: ColorFileUploadProps) {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "COLOR_IMAGE":
        return "메인 색상 이미지";
      case "THUMBNAIL":
        return "썸네일";
      case "GALLERY":
        return "갤러리 이미지";
      case "FINISH_SAMPLE":
        return "후처리 샘플";
      default:
        return "이미지";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {getRoleLabel(role)}
      </label>
      <FileUpload
        {...props}
        accept="image/*"
        maxFiles={maxFiles}
      />
    </div>
  );
}
