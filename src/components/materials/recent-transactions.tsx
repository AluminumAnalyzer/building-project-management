"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpCircle, ArrowDownCircle, Eye, Calendar } from "lucide-react";
import { useMaterialTransactions } from "@/hooks/use-material-transactions";
import { MaterialTransactionsResponse, MaterialTransaction } from "@/types";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export function RecentTransactions() {
  const { data: transactions, isLoading } = useMaterialTransactions({
    limit: 5,
    page: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const recentTransactions =
    (transactions as MaterialTransactionsResponse)?.items || [];

  if (recentTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">최근 거래 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentTransactions.map((transaction: MaterialTransaction) => (
        <div key={transaction.id} className="flex items-center space-x-4">
          <div
            className={`p-2 rounded-full ${
              transaction.type === "IN"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {transaction.type === "IN" ? (
              <ArrowUpCircle className="h-4 w-4" />
            ) : (
              <ArrowDownCircle className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">
                {transaction.material?.materialBase?.name || "자재명 없음"}
              </p>
              <Badge
                variant={transaction.type === "IN" ? "default" : "secondary"}
                className="text-xs"
              >
                {transaction.type === "IN" ? "입고" : "출고"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{transaction.warehouse?.name || "창고명 없음"}</span>
              <span>•</span>
              <span>
                {format(new Date(transaction.createdAt), "MM/dd HH:mm", {
                  locale: ko,
                })}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`text-sm font-medium ${
                transaction.type === "IN" ? "text-green-600" : "text-red-600"
              }`}
            >
              {transaction.type === "IN" ? "+" : "-"}
              {transaction.quantity}
            </div>
            <div className="text-xs text-muted-foreground">
              {transaction.material?.materialBase?.unit || "개"}
            </div>
          </div>
        </div>
      ))}

      <div className="pt-4 border-t">
        <Button variant="outline" className="w-full" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          전체 거래 내역 보기
        </Button>
      </div>
    </div>
  );
}
