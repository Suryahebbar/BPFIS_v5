import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalFarmers: number;
  totalSuppliers: number;
  totalProducts: number;
  totalTransactions: number;
  totalRevenue: number;
  monthlyGrowth: number;
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
  }>;
  salesData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  systemStatus: {
    api: { status: string; message: string };
    database: { status: string; message: string };
    storage: { status: string; message: string; value: number };
    performance: { status: string; message: string; value: number };
  };
}

export function useDashboardData() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
