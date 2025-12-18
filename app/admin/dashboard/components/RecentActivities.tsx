import { FiCheckCircle, FiAlertCircle, FiDollarSign, FiUser, FiPackage, FiClock, FiInfo } from 'react-icons/fi';

interface Activity {
  id: number;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  time: string;
  user: string;
}

const activities: Activity[] = [
  {
    id: 1,
    type: 'success',
    title: 'New order received',
    description: 'Order #ORD-2023-0012 has been placed',
    time: '2 min ago',
    user: 'John Doe'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Low stock alert',
    description: 'Product "Organic Tomatoes" is running low in stock',
    time: '1 hour ago',
    user: 'System'
  },
  {
    id: 3,
    type: 'info',
    title: 'New farmer registered',
    description: 'Farmer "Green Valley Farms" has registered',
    time: '3 hours ago',
    user: 'System'
  },
  {
    id: 4,
    type: 'error',
    title: 'Payment failed',
    description: 'Payment for Order #ORD-2023-0011 has failed',
    time: '5 hours ago',
    user: 'System'
  },
  {
    id: 5,
    type: 'success',
    title: 'Product approved',
    description: 'Product "Organic Apples" has been approved',
    time: '1 day ago',
    user: 'Admin User'
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <FiCheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <FiAlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'error':
      return <FiAlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <FiInfo className="h-5 w-5 text-blue-500" />;
  }
};

export default function RecentActivities() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View All
        </button>
      </div>
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, activityIdx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span 
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-800">
                        <span className="font-medium text-gray-900">{activity.title}</span>
                        {' '}{activity.description}
                      </p>
                      <div className="mt-1 text-xs text-gray-500 flex items-center">
                        <FiUser className="mr-1 h-3 w-3" />
                        {activity.user}
                        <span className="mx-1">•</span>
                        <FiClock className="mr-1 h-3 w-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}