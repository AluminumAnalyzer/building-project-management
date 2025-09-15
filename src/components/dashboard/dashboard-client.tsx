"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BuildingOfficeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalWorkers: number;
  pendingTasks: number;
  completedTasks: number;
  upcomingDeadlines: number;
}

interface Project {
  id: string;
  name: string;
  status: "planning" | "in_progress" | "completed" | "on_hold";
  progress: number;
  deadline: string;
  manager: string;
}

interface RecentActivity {
  id: string;
  type:
    | "project_created"
    | "task_completed"
    | "worker_assigned"
    | "deadline_approaching";
  message: string;
  timestamp: string;
  projectId?: string;
}

const DashboardClient = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalWorkers: 0,
    pendingTasks: 0,
    completedTasks: 0,
    upcomingDeadlines: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    // 대시보드 데이터 로딩
    loadDashboardData();
  }, [status, router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // TODO: 실제 API 호출로 대체
      // 임시 데이터
      setStats({
        totalProjects: 12,
        activeProjects: 8,
        totalWorkers: 45,
        pendingTasks: 23,
        completedTasks: 156,
        upcomingDeadlines: 5,
      });

      setRecentProjects([
        {
          id: "1",
          name: "아파트 A동 건설",
          status: "in_progress",
          progress: 65,
          deadline: "2024-08-15",
          manager: "김현수",
        },
        {
          id: "2",
          name: "상업시설 리모델링",
          status: "planning",
          progress: 15,
          deadline: "2024-09-30",
          manager: "이민정",
        },
        {
          id: "3",
          name: "도로 포장 공사",
          status: "in_progress",
          progress: 80,
          deadline: "2024-07-20",
          manager: "박철수",
        },
      ]);

      setRecentActivities([
        {
          id: "1",
          type: "task_completed",
          message: "아파트 A동 기초 공사 완료",
          timestamp: "2024-07-02T10:30:00Z",
          projectId: "1",
        },
        {
          id: "2",
          type: "worker_assigned",
          message: "새로운 작업자 5명이 상업시설 프로젝트에 배정됨",
          timestamp: "2024-07-02T09:15:00Z",
          projectId: "2",
        },
        {
          id: "3",
          type: "deadline_approaching",
          message: "도로 포장 공사 마감일이 18일 남았습니다",
          timestamp: "2024-07-02T08:00:00Z",
          projectId: "3",
        },
      ]);
    } catch (error) {
      console.error("대시보드 데이터 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Project["status"]): string => {
    switch (status) {
      case "planning":
        return "text-blue-600 bg-blue-100";
      case "in_progress":
        return "text-green-600 bg-green-100";
      case "completed":
        return "text-gray-600 bg-gray-100";
      case "on_hold":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: Project["status"]): string => {
    switch (status) {
      case "planning":
        return "계획중";
      case "in_progress":
        return "진행중";
      case "completed":
        return "완료";
      case "on_hold":
        return "보류";
      default:
        return "알 수 없음";
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            접근 권한이 없습니다
          </h1>
          <p className="text-gray-600">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-1">
            안녕하세요, {session.user.name}님! 프로젝트 현황을 확인하세요.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200">
            새 프로젝트
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">전체</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalProjects}
            </p>
            <p className="text-sm text-gray-600">프로젝트</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">활성</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats.activeProjects}
            </p>
            <p className="text-sm text-gray-600">진행중인 프로젝트</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <UsersIcon className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">팀</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalWorkers}
            </p>
            <p className="text-sm text-gray-600">전체 작업자</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <ClockIcon className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">대기중</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats.pendingTasks}
            </p>
            <p className="text-sm text-gray-600">대기 작업</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">완료</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats.completedTasks}
            </p>
            <p className="text-sm text-gray-600">완료된 작업</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">긴급</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats.upcomingDeadlines}
            </p>
            <p className="text-sm text-gray-600">임박한 마감일</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 최근 프로젝트 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              최근 프로젝트
            </h2>
            <p className="text-sm text-gray-600">진행중인 주요 프로젝트들</p>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                최근 프로젝트
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                진행중인 주요 프로젝트들
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          {project.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          담당자: {project.manager}
                        </p>

                        {/* 진행률 바 */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>진행률</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {getStatusText(project.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            마감:{" "}
                            {new Date(project.deadline).toLocaleDateString(
                              "ko-KR"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="w-full text-sm text-gray-600 hover:text-gray-900 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  모든 프로젝트 보기
                </button>
              </div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
              <p className="text-sm text-gray-600 mt-1">
                시스템 내 최근 활동 내역
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {activity.type === "task_completed" && (
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                      {activity.type === "worker_assigned" && (
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <UsersIcon className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      {activity.type === "deadline_approaching" && (
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                          <ExclamationTriangleIcon className="w-4 h-4 text-orange-600" />
                        </div>
                      )}
                      {activity.type === "project_created" && (
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <BuildingOfficeIcon className="w-4 h-4 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="w-full text-sm text-gray-600 hover:text-gray-900 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  모든 활동 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
