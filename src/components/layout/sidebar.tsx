"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  FolderIcon,
  CalendarIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  { name: "대시보드", href: "/dashboard", icon: HomeIcon },
  { name: "프로젝트", href: "/dashboard/projects", icon: BuildingOfficeIcon },
  { name: "작업자", href: "/workers", icon: UsersIcon },
  { name: "문서", href: "/documents", icon: DocumentTextIcon },
  { name: "보고서", href: "/reports", icon: ChartBarIcon },
  { name: "일정", href: "/calendar", icon: CalendarIcon },
  { name: "알림", href: "/notifications", icon: BellIcon, badge: "3" },
  { name: "파일", href: "/files", icon: FolderIcon },
  { name: "설정", href: "/settings", icon: Cog6ToothIcon },
  { name: "관리자", href: "/admin", icon: Cog6ToothIcon, adminOnly: true },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const filteredNavigation = navigation.filter(
    (item) =>
      !item.adminOnly || (item.adminOnly && session?.user?.role === "ADMIN")
  );

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col bg-white border-r border-gray-200",
        className
      )}
    >
      {/* 로고 */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">BuildPro</span>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-1 flex-col px-4 py-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {filteredNavigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors duration-200",
                      isActive
                        ? "text-gray-900"
                        : "text-gray-400 group-hover:text-gray-600"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 사용자 정보 */}
        {session && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-x-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
