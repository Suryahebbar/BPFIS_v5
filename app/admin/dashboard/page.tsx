'use client';

import { useEffect, useState } from 'react';
import { FiPackage, FiUsers, FiDollarSign } from 'react-icons/fi';
import StatCard from './components/StatCard';
import SalesChart from './components/SalesChart';
import RecentActivities from './components/RecentActivities';
import TopProducts from './components/TopProducts';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalSuppliers: 0,
    totalProducts: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Mock data for demo purposes
        setStats({
          totalFarmers: 1245,
          totalSuppliers: 342,
          totalProducts: 5678,
          totalTransactions: 8923,
          totalRevenue: 124567.89,
          monthlyGrowth: 12.5,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Farmers"
          value={stats.totalFarmers.toLocaleString()}
          change={stats.monthlyGrowth}
          icon={<FiUsers className="h-6 w-6 text-white" />}
          color="bg-indigo-500"
          isLoading={isLoading}
        />
        
        <StatCard
          title="Total Suppliers"
          value={stats.totalSuppliers.toLocaleString()}
          change={8.2}
          icon={<FiPackage className="h-6 w-6 text-white" />}
          color="bg-green-500"
          isLoading={isLoading}
        />
        
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          change={5.7}
          icon={<FiPackage className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
          isLoading={isLoading}
        />
        
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          change={stats.monthlyGrowth}
          icon={<FiDollarSign className="h-6 w-6 text-white" />}
          color="bg-red-500"
          isLoading={isLoading}
        />
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h2>
            <div className="h-64">
              <SalesChart />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h2>
            <RecentActivities />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Top Products</h2>
            <TopProducts />
          </div>
        </div>
      </div>
    </div>
  );
}
