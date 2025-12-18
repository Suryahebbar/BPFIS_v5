'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
  TooltipItem
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

const chartData: ChartData<'line'> = {
  labels,
  datasets: [
    {
      label: 'Sales',
      data: [0, 10000, 5000, 15000, 10000, 20000, 15000, 25000],
      borderColor: 'rgba(79, 70, 229, 1)',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      fill: true,
      borderWidth: 2,
      pointBackgroundColor: 'white',
      pointBorderColor: 'rgba(79, 70, 229, 1)',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
};

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'white',
      titleColor: '#111827',
      bodyColor: '#6B7280',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      padding: 12,
      callbacks: {
        label: (context: TooltipItem<'line'>) => {
          const value = context.parsed.y;
          return `$${value?.toLocaleString() ?? '0'}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#6B7280',
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        color: '#6B7280',
        callback: (value: string | number) => {
          if (typeof value === 'number') {
            return `$${value / 1000}k`;
          }
          return value;
        },
      },
    },
  },
};

export default function SalesChart() {
  return (
    <div className="h-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
