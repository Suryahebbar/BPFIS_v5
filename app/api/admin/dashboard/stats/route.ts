import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth.config';

export async function GET() {
  try {
    // Verify admin authentication
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real application, you would fetch this data from your database
    // This is mock data for demonstration
    const stats = {
      totalFarmers: 1245,
      totalSuppliers: 342,
      totalProducts: 5678,
      totalTransactions: 8923,
      totalRevenue: 124567.89,
      monthlyGrowth: 12.5,
      recentOrders: [
        { id: 'ORD-001', customer: 'John Doe', amount: 125.99, status: 'completed' },
        { id: 'ORD-002', customer: 'Jane Smith', amount: 89.50, status: 'processing' },
        { id: 'ORD-003', customer: 'Bob Johnson', amount: 210.25, status: 'shipped' },
      ],
      salesData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Sales',
            data: [5000, 8000, 6000, 9000, 12000, 10000, 15000],
            borderColor: 'rgba(79, 70, 229, 1)',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
          },
        ],
      },
      topProducts: [
        { id: '1', name: 'Organic Apples', sales: 1245, revenue: 3725.55 },
        { id: '2', name: 'Fresh Carrots', sales: 987, revenue: 1470.63 },
        { id: '3', name: 'Free Range Eggs', sales: 856, revenue: 4271.44 },
      ],
      systemStatus: {
        api: { status: 'operational', message: 'API is running normally' },
        database: { status: 'operational', message: 'Connection stable' },
        storage: { status: 'warning', message: '75% of 100GB used', value: 75 },
        performance: { status: 'good', message: 'System is running fast', value: 98 },
      },
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
