"use client";

import { useEffect } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateMaterialStock,
  useUpdateMaterialStock,
} from "@/hooks/use-material-stock";
import type { MaterialStock, Material, Warehouse } from "@/types/material";

const materialStockSchema = z.object({
  materialId: z.string().min(1, "자재를 선택해주세요"),
  warehouseId: z.string().min(1, "창고를 선택해주세요"),
  currentStock: z.number().min(0, "수량은 0 이상이어야 합니다"),
  safetyStock: z.number().min(0, "안전재고는 0 이상이어야 합니다").optional(),
  unitPrice: z.number().min(0, "단가는 0 이상이어야 합니다").optional(),
});

type MaterialStockFormData = z.infer<typeof materialStockSchema>;

interface MaterialStockDialogProps {
  stock?: MaterialStock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: Material[];
  warehouses: Warehouse[];
}

export function MaterialStockDialog({
  stock,
  open,
  onOpenChange,
  materials,
  warehouses,
}: MaterialStockDialogProps) {
  const createMaterialStock = useCreateMaterialStock();
  const updateMaterialStock = useUpdateMaterialStock();

  const form = useForm<MaterialStockFormData>({
    resolver: zodResolver(materialStockSchema),
    defaultValues: {
      materialId: "",
      warehouseId: "",
      currentStock: 0,
      safetyStock: 0,
      unitPrice: 0,
    },
  });

  useEffect(() => {
    if (stock) {
      form.reset({
        materialId: stock.materialId,
        warehouseId: stock.warehouseId,
        currentStock: stock.currentStock,
        safetyStock: stock.safetyStock || 0,
        unitPrice: stock.unitPrice || 0,
      });
    } else {
      form.reset({
        materialId: "",
        warehouseId: "",
        currentStock: 0,
        safetyStock: 0,
        unitPrice: 0,
      });
    }
  }, [stock, form]);

  const onSubmit = async (data: MaterialStockFormData) => {
    try {
      if (stock) {
        await updateMaterialStock.mutateAsync({
          id: stock.id,
          stock: data,
        });
      } else {
        await createMaterialStock.mutateAsync({
          ...data,
          safetyStock: data.safetyStock || 0,
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("재고 저장 실패:", error);
    }
  };

  const isLoading =
    createMaterialStock.isPending || updateMaterialStock.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{stock ? "재고 수정" : "재고 추가"}</DialogTitle>
          <DialogDescription>자재 재고 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="materialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>자재 *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!stock} // 수정 시에는 자재 변경 불가
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="자재를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.materialBase?.name || "Unknown"} (
                          {material.materialBase?.category || "N/A"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>창고 *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!stock} // 수정 시에는 창고 변경 불가
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="창고를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>현재고 *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                {isLoading ? "저장 중..." : stock ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
