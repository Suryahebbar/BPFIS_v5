'use client';

import { FiTrendingUp, FiTrendingDown, FiPackage } from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  sales: number;
  stock: number;
  change: number;
  image: string;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Organic Apples',
    category: 'Fruits',
    price: 2.99,
    sales: 1245,
    stock: 245,
    change: 12.5,
    image: '/images/products/apples.jpg'
  },
  {
    id: '2',
    name: 'Fresh Carrots',
    category: 'Vegetables',
    price: 1.49,
    sales: 987,
    stock: 178,
    change: 5.2,
    image: '/images/products/carrots.jpg'
  },
  {
    id: '3',
    name: 'Free Range Eggs',
    category: 'Dairy & Eggs',
    price: 4.99,
    sales: 856,
    stock: 92,
    change: -2.3,
    image: '/images/products/eggs.jpg'
  },
  {
    id: '4',
    name: 'Whole Grain Bread',
    category: 'Bakery',
    price: 3.49,
    sales: 723,
    stock: 64,
    change: 8.7,
    image: '/images/products/bread.jpg'
  },
  {
    id: '5',
    name: 'Organic Spinach',
    category: 'Vegetables',
    price: 2.29,
    sales: 612,
    stock: 45,
    change: 15.1,
    image: '/images/products/spinach.jpg'
  }
];

export default function TopProducts() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Top Selling Products</h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <FiPackage className="h-6 w-6" />
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </h3>
                <div className="ml-2 flex-shrink-0 flex">
                  {product.change >= 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <FiTrendingUp className="mr-1 h-3 w-3" />
                      {product.change}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      <FiTrendingDown className="mr-1 h-3 w-3" />
                      {Math.abs(product.change)}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm text-gray-500">{product.category}</p>
                <p className="text-sm font-medium text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Sales: {product.sales.toLocaleString()}</span>
                  <span>Stock: {product.stock} units</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className={`h-1.5 rounded-full ${
                      product.stock < 50 ? 'bg-red-500' : 
                      product.stock < 100 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (product.stock / 250) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-xl font-semibold text-gray-900">1,245</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Categories</p>
            <p className="text-xl font-semibold text-gray-900">24</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock</p>
            <p className="text-xl font-semibold text-red-600">12</p>
          </div>
        </div>
      </div>
    </div>
  );
}