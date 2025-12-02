"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    product: {
      _id: string;
      name: string;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  orderDate: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock orders data
  const orders: Order[] = [
    {
      _id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'delivered',
      items: [
        {
          product: {
            _id: '1',
            name: 'Organic Wheat Seeds Premium Quality',
            images: ['/api/placeholder/100/100']
          },
          quantity: 2,
          price: 2500
        }
      ],
      totalAmount: 5000,
      shippingAddress: {
        name: 'Ramesh Kumar',
        address: '123 Farm Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001'
      },
      paymentMethod: 'COD',
      orderDate: '2024-01-15',
      estimatedDelivery: '2024-01-18',
      trackingNumber: 'TRK123456789'
    },
    {
      _id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'shipped',
      items: [
        {
          product: {
            _id: '2',
            name: 'NPK 20-20-20 Fertilizer',
            images: ['/api/placeholder/100/100']
          },
          quantity: 1,
          price: 850
        }
      ],
      totalAmount: 850,
      shippingAddress: {
        name: 'Ramesh Kumar',
        address: '123 Farm Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001'
      },
      paymentMethod: 'Online',
      orderDate: '2024-01-18',
      estimatedDelivery: '2024-01-22',
      trackingNumber: 'TRK987654321'
    },
    {
      _id: '3',
      orderNumber: 'ORD-2024-003',
      status: 'processing',
      items: [
        {
          product: {
            _id: '3',
            name: 'Drip Irrigation Kit',
            images: ['/api/placeholder/100/100']
          },
          quantity: 1,
          price: 12000
        }
      ],
      totalAmount: 12000,
      shippingAddress: {
        name: 'Ramesh Kumar',
        address: '123 Farm Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001'
      },
      paymentMethod: 'COD',
      orderDate: '2024-01-20'
    }
  ];

  const statusOptions = [
    { id: 'all', name: 'All Orders', color: 'gray' },
    { id: 'pending', name: 'Pending', color: 'yellow' },
    { id: 'confirmed', name: 'Confirmed', color: 'blue' },
    { id: 'processing', name: 'Processing', color: 'purple' },
    { id: 'shipped', name: 'Shipped', color: 'orange' },
    { id: 'delivered', name: 'Delivered', color: 'green' },
    { id: 'cancelled', name: 'Cancelled', color: 'red' }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '⏳',
      confirmed: '✅',
      processing: '🔄',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌'
    };
    return icons[status] || '📦';
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h2>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === status.id
                    ? 'bg-[#1f3b2c] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.name}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'all' 
                ? "You haven't placed any orders yet" 
                : `No ${selectedStatus} orders found`}
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center px-6 py-3 bg-[#1f3b2c] text-white rounded-lg hover:bg-[#2d4f3c]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <Link
                        href={`/marketplace/orders/${order._id}`}
                        className="text-[#1f3b2c] hover:underline text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img
                          src={item.product.images[0] || '/api/placeholder/100/100'}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                        </div>
                        <span className="font-medium text-gray-900">
                          ₹{(item.quantity * item.price).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p>Payment: {order.paymentMethod}</p>
                        {order.trackingNumber && (
                          <p>Tracking: {order.trackingNumber}</p>
                        )}
                        {order.estimatedDelivery && (
                          <p>Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-xl font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {order.status === 'delivered' && (
                      <>
                        <button className="px-4 py-2 bg-[#1f3b2c] text-white rounded-lg hover:bg-[#2d4f3c] text-sm">
                          Rate Product
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                          Buy Again
                        </button>
                      </>
                    )}
                    {order.status === 'shipped' && order.trackingNumber && (
                      <button className="px-4 py-2 bg-[#1f3b2c] text-white rounded-lg hover:bg-[#2d4f3c] text-sm">
                        Track Order
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                        Contact Support
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                      Download Invoice
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/marketplace" className="text-gray-600 hover:text-[#1f3b2c]">
              Continue Shopping
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/marketplace/cart" className="text-gray-600 hover:text-[#1f3b2c]">
              View Cart
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/marketplace/help" className="text-gray-600 hover:text-[#1f3b2c]">
              Need Help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}