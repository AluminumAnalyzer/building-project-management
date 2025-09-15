'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  manager: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  planning: { label: '계획', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: '진행중', color: 'bg-green-100 text-green-800' },
  on_hold: { label: '보류', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: '완료', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: '취소', color: 'bg-red-100 text-red-800' },
};

export function ProjectsClient() {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // TODO: 실제 API 호출로 대체
      // 임시 데이터
      const mockProjects: Project[] = [
        {
          id: '1',
          name: '서울 아파트 신축공사',
          description: '서울시 강남구 아파트 신축 프로젝트',
          status: 'in_progress',
          startDate: '2024-01-15',
          endDate: '2024-12-31',
          budget: 5000000000,
          progress: 65,
          manager: '김건설',
          location: '서울시 강남구',
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-03-15T14:30:00Z',
        },
        {
          id: '2',
          name: '부산 상업시설 리모델링',
          description: '부산시 해운대구 상업시설 리모델링',
          status: 'planning',
          startDate: '2024-04-01',
          endDate: '2024-08-31',
          budget: 2000000000,
          progress: 15,
          manager: '이시공',
          location: '부산시 해운대구',
          createdAt: '2024-02-20T10:00:00Z',
          updatedAt: '2024-03-10T16:45:00Z',
        },
        {
          id: '3',
          name: '대구 오피스텔 건설',
          description: '대구시 수성구 오피스텔 신축',
          status: 'completed',
          startDate: '2023-06-01',
          endDate: '2024-02-29',
          budget: 3500000000,
          progress: 100,
          manager: '박건축',
          location: '대구시 수성구',
          createdAt: '2023-05-15T08:00:00Z',
          updatedAt: '2024-02-29T17:00:00Z',
        },
        {
          id: '4',
          name: '인천 물류센터 건설',
          description: '인천시 연수구 물류센터 신축',
          status: 'on_hold',
          startDate: '2024-02-01',
          endDate: '2024-10-31',
          budget: 4200000000,
          progress: 30,
          manager: '최물류',
          location: '인천시 연수구',
          createdAt: '2024-01-25T11:00:00Z',
          updatedAt: '2024-03-20T13:15:00Z',
        },
      ];

      setProjects(mockProjects);
      
      toast({
        title: "프로젝트 목록 로드 완료",
        description: `${mockProjects.length}개의 프로젝트를 불러왔습니다.`,
        variant: "default",
      });
    } catch (error) {
      console.error('프로젝트 데이터 로딩 실패:', error);
      toast({
        title: "오류 발생",
        description: "프로젝트 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    loadProjects();
  }, [loadProjects, status, router]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로젝트 관리</h1>
          <p className="text-gray-600 mt-1">건설 프로젝트를 관리하고 진행 상황을 추적하세요</p>
        </div>
        <Button 
          onClick={() => {
            toast({
              title: "새 프로젝트",
              description: "프로젝트 생성 기능이 곧 추가될 예정입니다.",
            });
          }}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          새 프로젝트
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="프로젝트명, 위치, 담당자로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                className="h-10 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="all">모든 상태</option>
                <option value="planning">계획</option>
                <option value="in_progress">진행중</option>
                <option value="on_hold">보류</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 프로젝트 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 목록</CardTitle>
          <CardDescription>
            총 {filteredProjects.length}개의 프로젝트
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>프로젝트명</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>진행률</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>위치</TableHead>
                  <TableHead>예산</TableHead>
                  <TableHead>기간</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{project.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[project.status].color}`}>
                        {statusConfig[project.status].label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 min-w-[3rem]">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900">{project.manager}</TableCell>
                    <TableCell className="text-gray-600">{project.location}</TableCell>
                    <TableCell className="text-gray-900 font-medium">
                      {formatCurrency(project.budget)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <div className="text-sm">
                        <div>{formatDate(project.startDate)}</div>
                        <div className="text-gray-400">~ {formatDate(project.endDate)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          toast({
                            title: "프로젝트 상세",
                            description: "프로젝트 상세 페이지가 곧 추가될 예정입니다.",
                          });
                        }}
                      >
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">검색 결과가 없습니다</div>
              <div className="text-sm text-gray-500">다른 검색어나 필터를 시도해보세요</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
