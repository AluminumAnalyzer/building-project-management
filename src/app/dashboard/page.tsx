import { Metadata } from "next";
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import DashboardClient from '@/components/dashboard/dashboard-client-new';

export const metadata: Metadata = {
  title: "대시보드 | BuildPro",
  description: "건설 시공 관리 시스템 대시보드",
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardClient />
    </DashboardLayout>
  );
}
