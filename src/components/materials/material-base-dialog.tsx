"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Check, ChevronsUpDown, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  FileUpload,
  type FileUploadPreview,
} from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";

import {
  useCreateMaterialBase,
  useUpdateMaterialBase,
} from "@/hooks/use-material-bases";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { MaterialBase } from "@/types/material";

const materialBaseSchema = z.object({
  code: z.string().min(1, "자재 코드는 필수입니다"),
  name: z.string().min(1, "자재명은 필수입니다"),
  type: z.string().optional(),
  specification: z.string().optional(),
  unit: z.string().min(1, "단위는 필수입니다"),
  unitPrice: z.number().min(0, "단가는 0 이상이어야 합니다").optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  safetyStock: z.number().min(0, "안전재고는 0 이상이어야 합니다"),
  isActive: z.boolean(),
  suppliers: z.array(z.string()).optional(), // 선택된 거래처 ID들
});

type FormValues = z.infer<typeof materialBaseSchema>;

interface MaterialBaseDialogProps {
  materialBase?: MaterialBase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialBaseDialog({
  materialBase,
  open,
  onOpenChange,
}: MaterialBaseDialogProps) {
  const createMutation = useCreateMaterialBase();
  const updateMutation = useUpdateMaterialBase();

  // 거래처 목록 조회
  const { data: suppliersData } = useSuppliers({ limit: 100 });
  const suppliers = suppliersData?.items || [];

  // 선택된 거래처 상태
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [supplierOpen, setSupplierOpen] = useState(false);

  // 파일 업로드 상태
  const [imageFiles, setImageFiles] = useState<FileUploadPreview[]>([]);
  const [drawingFiles, setDrawingFiles] = useState<FileUploadPreview[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(materialBaseSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "",
      specification: "",
      unit: "",
      unitPrice: undefined,
      description: "",
      category: "",
      brand: "",
      model: "",
      safetyStock: 0,
      isActive: true,
    },
  });

  // 다이얼로그가 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      if (materialBase) {
        // 편집 모드: 기존 데이터로 폼 설정
        form.reset({
          code: materialBase.code || "",
          name: materialBase.name || "",
          type: materialBase.type || "",
          specification: materialBase.specification || "",
          unit: materialBase.unit || "",
          unitPrice: materialBase.unitPrice || undefined,
          description: materialBase.description || "",
          category: materialBase.category || "",
          brand: materialBase.brand || "",
          model: materialBase.model || "",
          safetyStock: materialBase.safetyStock || 0,
          isActive: materialBase.isActive ?? true,
          suppliers: materialBase.suppliers?.map((s) => s.supplierId) || [],
        });

        // 거래처 상태 설정
        setSelectedSuppliers(
          materialBase.suppliers?.map((s) => s.supplierId) || []
        );

        // 기존 이미지 파일 설정 (편집 모드)
        if (materialBase.images) {
          const existingImages = materialBase.images.map((img) => ({
            id: img.id,
            url: img.url,
            file: null, // 기존 파일은 file 객체가 없음
            name: `이미지 ${img.id}`,
            type: "image/*",
          }));
          setImageFiles(existingImages);
        }

        // 기존 도면 파일 설정 (편집 모드)
        if (materialBase.drawings) {
          const existingDrawings = materialBase.drawings.map((drawing) => ({
            id: drawing.id,
            url: drawing.fileUrl,
            file: null, // 기존 파일은 file 객체가 없음
            name: drawing.title,
            type: "application/*",
          }));
          setDrawingFiles(existingDrawings);
        }
      } else {
        // 새로 생성 모드: 기본값으로 폼 초기화
        form.reset({
          code: "",
          name: "",
          type: "",
          specification: "",
          unit: "",
          unitPrice: undefined,
          description: "",
          category: "",
          brand: "",
          model: "",
          safetyStock: 0,
          isActive: true,
          suppliers: [],
        });

        // 상태 초기화
        setSelectedSuppliers([]);
        setImageFiles([]);
        setDrawingFiles([]);
      }
    }
  }, [open, materialBase, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const processedData = {
        ...data,
        type: data.type || undefined,
        specification: data.specification || undefined,
        description: data.description || undefined,
        category: data.category || undefined,
        brand: data.brand || undefined,
        model: data.model || undefined,
        suppliers: selectedSuppliers,
      };

      console.log("[MaterialBase] Submitting data:", processedData);
      console.log("[MaterialBase] Image files:", imageFiles);
      console.log("[MaterialBase] Drawing files:", drawingFiles);

      let materialBaseId: string;

      if (materialBase) {
        await updateMutation.mutateAsync({
          id: materialBase.id,
          data: processedData,
        });
        materialBaseId = materialBase.id;
        toast.success("자재 기본정보가 수정되었습니다.");
      } else {
        const result = await createMutation.mutateAsync(processedData);
        materialBaseId = result?.id || "";
        console.log("[MaterialBase] Created with ID:", materialBaseId);
        toast.success("자재 기본정보가 생성되었습니다.");
      }

      // TODO: 파일 업로드 및 관계 생성 API 구현 필요
      // 이미지 파일 업로드 및 MaterialImage 생성
      // 도면 파일 업로드 및 MaterialDrawing 생성

      onOpenChange(false);
    } catch (error) {
      console.error("MaterialBase 저장 오류:", error);
      toast.error(
        materialBase
          ? "자재 기본정보 수정 중 오류가 발생했습니다."
          : "자재 기본정보 생성 중 오류가 발생했습니다."
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {materialBase ? "자재 기본정보 수정" : "자재 기본정보 추가"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* 자재 코드 */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>자재 코드 *</FormLabel>
                    <FormControl>
                      <Input placeholder="MB001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 자재명 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>자재명 *</FormLabel>
                    <FormControl>
                      <Input placeholder="알루미늄 프로파일" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 자재 종류 */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>자재 종류</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="종류 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RAW_MATERIAL">원자재</SelectItem>
                        <SelectItem value="COMPONENT">부품</SelectItem>
                        <SelectItem value="CONSUMABLE">소모품</SelectItem>
                        <SelectItem value="TOOL">공구</SelectItem>
                        <SelectItem value="HARDWARE">하드웨어</SelectItem>
                        <SelectItem value="FINISHING">마감재</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 규격 */}
              <FormField
                control={form.control}
                name="specification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>규격</FormLabel>
                    <FormControl>
                      <Input placeholder="50x50x3T" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 단위 */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>단위 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="단위 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EA">EA</SelectItem>
                        <SelectItem value="SET">SET</SelectItem>
                        <SelectItem value="MM">mm</SelectItem>
                        <SelectItem value="KG">KG</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="BOX">BOX</SelectItem>
                        <SelectItem value="ROLL">ROLL</SelectItem>
                        <SelectItem value="SHEET">SHEET</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 단가 */}
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>단가 (원)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 카테고리 */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카테고리</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STRUCTURE">구조재</SelectItem>
                        <SelectItem value="PANEL">패널</SelectItem>
                        <SelectItem value="HARDWARE">하드웨어</SelectItem>
                        <SelectItem value="FASTENER">체결재</SelectItem>
                        <SelectItem value="FINISHING">마감재</SelectItem>
                        <SelectItem value="ELECTRICAL">전기재</SelectItem>
                        <SelectItem value="TOOL">공구</SelectItem>
                        <SelectItem value="CONSUMABLE">소모품</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 브랜드 */}
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>브랜드</FormLabel>
                    <FormControl>
                      <Input placeholder="삼성, LG, 보쉬 등" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 모델 */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>모델명</FormLabel>
                    <FormControl>
                      <Input placeholder="AL-5050-3T" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 안전재고 */}
              <FormField
                control={form.control}
                name="safetyStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>안전재고</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : 0
                          )
                        }
                        value={field.value || 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 활성상태 */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>활성 상태</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        비활성 시 선택 목록에서 제외됩니다
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* 거래처 선택 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  거래처 선택
                </label>
                <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={supplierOpen}
                      className="w-full justify-between"
                    >
                      {selectedSuppliers.length > 0
                        ? `${selectedSuppliers.length}개 거래처 선택됨`
                        : "거래처를 선택하세요..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="거래처 검색..." />
                      <CommandEmpty>거래처가 없습니다.</CommandEmpty>
                      <CommandGroup>
                        {suppliers.map((supplier) => (
                          <CommandItem
                            key={supplier.id}
                            value={supplier.name}
                            onSelect={() => {
                              const isSelected = selectedSuppliers.includes(
                                supplier.id
                              );
                              if (isSelected) {
                                setSelectedSuppliers((prev) =>
                                  prev.filter((id) => id !== supplier.id)
                                );
                              } else {
                                setSelectedSuppliers((prev) => [
                                  ...prev,
                                  supplier.id,
                                ]);
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSuppliers.includes(supplier.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{supplier.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {supplier.type}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* 선택된 거래처 표시 */}
                {selectedSuppliers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSuppliers.map((supplierId) => {
                      const supplier = suppliers.find(
                        (s) => s.id === supplierId
                      );
                      return supplier ? (
                        <Badge
                          key={supplierId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {supplier.name}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => {
                              setSelectedSuppliers((prev) =>
                                prev.filter((id) => id !== supplierId)
                              );
                            }}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                자재 이미지
              </label>
              <FileUpload
                value={imageFiles}
                onChange={setImageFiles}
                accept="image/*"
                maxFiles={5}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                이미지 파일만 업로드 가능합니다. (최대 5개)
              </p>
            </div>

            {/* 도면 업로드 */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                도면 파일
              </label>
              <FileUpload
                value={drawingFiles}
                onChange={setDrawingFiles}
                accept=".pdf,.dwg,.dxf,.step,.igs,.iges"
                maxFiles={10}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                PDF, DWG, DXF, STEP, IGS 파일만 업로드 가능합니다. (최대 10개)
              </p>
            </div>

            {/* 설명 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="자재에 대한 상세 설명을 입력하세요..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "저장 중..." : materialBase ? "수정" : "생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
