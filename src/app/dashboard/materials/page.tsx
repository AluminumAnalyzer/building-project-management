"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Warehouse,
  TrendingUp,
  Search,
  Plus,
  Filter,
  Download,
  ArrowRight,
  Palette,
  BarChart3,
  History,
} from "lucide-react";
// 임시 주석 추후 구현
// import { useMaterialSummary } from "@/hooks/use-materials";
// import { useMaterialInventory } from "@/hooks/use-material-stock";
// import { MaterialDashboardStats } from "@/components/materials/material-dashboard-stats";
// import { MaterialInventoryChart } from "@/components/materials/material-inventory-chart";
import { LowStockAlert } from "@/components/materials/low-stock-alert";
import { RecentTransactions } from "@/components/materials/recent-transactions";

export default function MaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // 임시 주석 추후 구현
  /*
  const { data: summary, isLoading: summaryLoading } = useMaterialSummary();
  const { data: inventory, isLoading: inventoryLoading } = useMaterialInventory(
    {
      groupBy: "warehouse",
    }
  );
  */

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">자재 관리</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            자재 추가
          </Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="자재 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          필터
        </Button>
      </div>

      {/* 대시보드 통계 임시 주석 추후 구현*/}
      {/* <MaterialDashboardStats summary={summary} isLoading={summaryLoading} /> */}

      {/* 빠른 액세스 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/materials/suppliers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                공급업체 관리
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  공급업체 정보 관리
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/materials/warehouses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">창고 관리</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  창고 정보 및 위치 관리
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/materials/inventory">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">재고 현황</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  실시간 재고 현황 조회
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/materials/transactions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">입출고 관리</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  입출고 내역 및 거래 관리
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 추가 관리 메뉴 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/materials/colors">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">색상 관리</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  자재 색상 정보 관리
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="opacity-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">리포트</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                자재 분석 리포트 (준비중)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* materialbase settings */}
        <Link href="/dashboard/materials/materialbase">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                자재 기본설정
              </CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  자재 기본 정보 설정
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="inventory">재고 현황</TabsTrigger>
          <TabsTrigger value="transactions">입출고 내역</TabsTrigger>
          <TabsTrigger value="alerts">알림</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>재고 현황</CardTitle>
                <CardDescription>창고별 재고 분포 및 트렌드</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {/* <MaterialInventoryChart
                  data={inventory}
                  isLoading={inventoryLoading}
                /> */}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>최근 거래</CardTitle>
                <CardDescription>최근 입출고 내역</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>재고 현황</CardTitle>
              <CardDescription>
                전체 자재의 재고 현황을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 재고 현황 테이블 컴포넌트 */}
              <div className="text-center py-8 text-muted-foreground">
                재고 현황 테이블이 여기에 표시됩니다
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>입출고 내역</CardTitle>
              <CardDescription>
                자재 입출고 거래 내역을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 거래 내역 테이블 컴포넌트 */}
              <div className="text-center py-8 text-muted-foreground">
                입출고 내역 테이블이 여기에 표시됩니다
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <LowStockAlert />
        </TabsContent>
      </Tabs>
    </div>
  );
}
