import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectsClient } from "@/components/projects/projects-client";

export const metadata: Metadata = {
  title: "프로젝트 | BuildPro",
  description: "건설 시공 관리 시스템 프로젝트 관리",
};

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <ProjectsClient />
    </DashboardLayout>
  );
}
