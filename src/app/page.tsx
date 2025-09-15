import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import {
  ArrowRightIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "건설 시공 관리 플랫폼 - 차세대 건설 관리 솔루션",
  description: "AI 기반 건설 프로젝트 관리로 효율성을 극대화하세요. 실시간 협업, 자동화된 워크플로우, 통합 대시보드를 제공합니다.",
};

const features = [
  {
    icon: ChartBarIcon,
    title: "실시간 대시보드",
    description: "프로젝트 진행 상황을 실시간으로 모니터링하고 데이터 기반 의사결정을 지원합니다.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: UserGroupIcon,
    title: "협업 및 소통",
    description: "팀 간 원활한 소통과 협업을 위한 통합 플랫폼으로 생산성을 극대화합니다.",
    color: "bg-green-50 text-green-600"
  },
  {
    icon: CogIcon,
    title: "자동화 워크플로우",
    description: "반복적인 작업을 자동화하여 인적 오류를 줄이고 효율성을 향상시킵니다.",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: ShieldCheckIcon,
    title: "보안 및 규정 준수",
    description: "업계 표준 보안 프로토콜과 규정 준수를 위한 완전한 솔루션을 제공합니다.",
    color: "bg-red-50 text-red-600"
  },
  {
    icon: ClockIcon,
    title: "시간 및 비용 추적",
    description: "정확한 시간 추적과 비용 관리로 프로젝트 예산을 효율적으로 관리합니다.",
    color: "bg-yellow-50 text-yellow-600"
  },
  {
    icon: LightBulbIcon,
    title: "AI 기반 인사이트",
    description: "머신러닝 기반 분석으로 프로젝트 성과를 예측하고 개선 방안을 제시합니다.",
    color: "bg-indigo-50 text-indigo-600"
  }
];

const stats = [
  { value: "300%", label: "효율성 향상" },
  { value: "90%", label: "시간 절약" },
  { value: "98%", label: "오류 감소" },
  { value: "24/7", label: "실시간 모니터링" }
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8 border border-blue-200">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                차세대 건설 관리 플랫폼
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8">
                건설 프로젝트의
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  완전한 디지털 혁신
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                AI 기반 스마트 관리로 프로젝트 효율성을 300% 향상시키고,
                <br className="hidden md:block" />
                실시간 협업과 자동화된 워크플로우로 혁신을 경험하세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center px-8 py-4 bg-black text-white rounded-lg font-semibold transition-all duration-200 hover:bg-gray-800 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  무료로 시작하기
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
                >
                  로그인
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                건설 관리의 모든 것을
                <br />
                <span className="text-blue-600">하나의 플랫폼에서</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                복잡한 건설 프로젝트를 간단하고 효율적으로 관리할 수 있는
                통합 솔루션을 제공합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200"
                  >
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              수천 개의 건설 회사가 이미 우리 플랫폼으로 혁신을 경험하고 있습니다.
              당신의 프로젝트도 다음 성공 사례가 되어보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-50 hover:scale-105 shadow-lg"
              >
                무료 체험 시작
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:text-blue-600"
              >
                문의하기
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-2xl font-bold mb-4">건설 시공 관리</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  차세대 건설 관리 플랫폼으로 프로젝트의 성공을 보장합니다.
                  AI 기반 스마트 솔루션으로 건설 업계의 디지털 혁신을 이끌어갑니다.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">제품</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/features" className="hover:text-white transition-colors">기능</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">요금제</Link></li>
                  <li><Link href="/integrations" className="hover:text-white transition-colors">연동</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">지원</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/docs" className="hover:text-white transition-colors">문서</Link></li>
                  <li><Link href="/support" className="hover:text-white transition-colors">고객지원</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">문의</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2024 건설 시공 관리 플랫폼. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
