"use client";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateMaterialTransaction } from "@/hooks/use-material-transactions";
import type { MaterialWithRelations, Warehouse } from "@/types";

const materialTransactionSchema = z.object({
  materialId: z.string().min(1, "자재를 선택해주세요"),
  warehouseId: z.string().min(1, "창고를 선택해주세요"),
  type: z.enum(["IN", "OUT"], {
    required_error: "거래 유형을 선택해주세요",
  }),
  quantity: z.number().min(1, "수량은 1 이상이어야 합니다"),
  unitPrice: z.number().min(0, "단가는 0 이상이어야 합니다").optional(),
  notes: z.string().optional(),
  transactionDate: z.string().min(1, "거래일시를 입력해주세요"),
});

type MaterialTransactionFormData = z.infer<typeof materialTransactionSchema>;

interface MaterialTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: MaterialWithRelations[];
  warehouses: Warehouse[];
}

export function MaterialTransactionDialog({
  open,
  onOpenChange,
  materials,
  warehouses,
}: MaterialTransactionDialogProps) {
  const createMaterialTransaction = useCreateMaterialTransaction();

  const form = useForm<MaterialTransactionFormData>({
    resolver: zodResolver(materialTransactionSchema),
    defaultValues: {
      materialId: "",
      warehouseId: "",
      type: "IN",
      quantity: 1,
      unitPrice: 0,
      notes: "",
      transactionDate: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    },
  });

  const onSubmit = async (data: MaterialTransactionFormData) => {
    try {
      await createMaterialTransaction.mutateAsync({
        ...data,
        transactionDate: new Date(data.transactionDate).toISOString(),
      });
      onOpenChange(false);
      form.reset({
        materialId: "",
        warehouseId: "",
        type: "IN",
        quantity: 1,
        unitPrice: 0,
        notes: "",
        transactionDate: new Date().toISOString().slice(0, 16),
      });
    } catch (error) {
      console.error("거래 저장 실패:", error);
    }
  };

  const isLoading = createMaterialTransaction.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>거래 추가</DialogTitle>
          <DialogDescription>
            자재 입출고 거래 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="materialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>자재 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="자재를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.materialBase?.name ||
                              material.materialBaseId}{" "}
                            ({material.materialBase?.category || "미분류"})
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>거래 유형 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IN">입고</SelectItem>
                        <SelectItem value="OUT">출고</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>수량 *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
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
            </div>

            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>거래일시 *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메모</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="거래에 대한 추가 정보를 입력하세요"
                      className="resize-none"
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
                {isLoading ? "저장 중..." : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
