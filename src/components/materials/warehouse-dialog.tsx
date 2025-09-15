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

import { Switch } from "@/components/ui/switch";
import { useCreateWarehouse, useUpdateWarehouse } from "@/hooks/use-warehouses";
import type { Warehouse } from "@/types";

const warehouseSchema = z.object({
  code: z.string().min(1, "창고 코드를 입력해주세요"),
  name: z.string().min(1, "창고명을 입력해주세요"),
  location: z.string().optional(),
  purpose: z.string().optional(),
  isActive: z.boolean(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseDialogProps {
  warehouse?: Warehouse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WarehouseDialog({ warehouse, open, onOpenChange }: WarehouseDialogProps) {
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();

  const form = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      code: "",
      name: "",
      location: "",
      purpose: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (warehouse) {
      form.reset({
        code: warehouse.code,
        name: warehouse.name,
        location: warehouse.location || "",
        purpose: warehouse.purpose || "",
        isActive: warehouse.isActive,
      });
    } else {
      form.reset({
        code: "",
        name: "",
        location: "",
        purpose: "",
        isActive: true,
      });
    }
  }, [warehouse, form]);

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      if (warehouse) {
        await updateWarehouse.mutateAsync({
          id: warehouse.id,
          warehouse: data,
        });
      } else {
        await createWarehouse.mutateAsync(data);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("창고 저장 실패:", error);
    }
  };

  const isLoading = createWarehouse.isPending || updateWarehouse.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {warehouse ? "창고 수정" : "창고 추가"}
          </DialogTitle>
          <DialogDescription>
            창고 정보를 입력해주세요.
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
                    <FormLabel>창고 코드 *</FormLabel>
                    <FormControl>
                      <Input placeholder="창고 코드를 입력하세요" {...field} />
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
                    <FormLabel>창고명 *</FormLabel>
                    <FormControl>
                      <Input placeholder="창고명을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>위치</FormLabel>
                  <FormControl>
                    <Input placeholder="창고 위치를 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>용도</FormLabel>
                  <FormControl>
                    <Input placeholder="창고 용도를 입력하세요 (예: 원자재창고, 완제품창고)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">활성 상태</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      창고를 활성화하면 재고 관리가 가능합니다
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
                {isLoading ? "저장 중..." : warehouse ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
