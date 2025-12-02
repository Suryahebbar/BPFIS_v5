"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Deal {
  _id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  seller: {
    companyName: string;
    verificationStatus: string;
  };
  expiresIn: string;
  stockLeft: number;
  totalStock: number;
}

export default function DealsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount');

  // Mock deals data
  const deals: Deal[] = [
    {
      _id: '1',
      name: 'Premium Organic Seeds Pack - Buy 2 Get 1 Free',
      originalPrice: 7500,
      discountedPrice: 5000,
      discount: 33,
      category: 'seeds',
      images: ['/api/placeholder/300/300'],
      rating: 4.7,
      reviewCount: 89,
      seller: {
        companyName: 'AgriTech Solutions',
        verificationStatus: 'verified'
      },
      expiresIn: '2 days',
      stockLeft: 15,
      totalStock: 50
    },
    {
      _id: '2',
      name: 'Complete Fertilizer Kit - 40% OFF',
      originalPrice: 4200,
      discountedPrice: 2520,
      discount: 40,
      category: 'fertilizers',
      images: ['/api/placeholder/300/300'],
      rating: 4.5,
      reviewCount: 67,
      seller: {
        companyName: 'GreenGrow Supplies',
        verificationStatus: 'verified'
      },
      expiresIn: '1 day',
      stockLeft: 8,
      totalStock: 30
    },
    {
      _id: '3',
      name: 'Smart Irrigation Controller - Limited Time Offer',
      originalPrice: 15000,
      discountedPrice: 10500,
      discount: 30,
      category: 'irrigation',
      images: ['/api/placeholder/300/300'],
      rating: 4.8,
      reviewCount: 124,
      seller: {
        companyName: 'Irrigation Pro',
        verificationStatus: 'verified'
      },
      expiresIn: '5 hours',
      stockLeft: 5,
      totalStock: 20
    },
    {
      _id: '4',
      name: 'Pesticide Bundle Pack - Save 35%',
      originalPrice: 3200,
      discountedPrice: 2080,
      discount: 35,
      category: 'pesticides',
      images: ['/api/placeholder/300/300'],
      rating: 4.3,
      reviewCount: 45,
      seller: {
        companyName: 'CropCare India',
        verificationStatus: 'verified'
      },
      expiresIn: '3 days',
      stockLeft: 22,
      totalStock: 40
    },
    {
      _id: '5',
      name: 'Farm Tools Starter Kit - 25% OFF',
      originalPrice: 8000,
      discountedPrice: 6000,
      discount: 25,
      category: 'tools',
      images: ['/api/placeholder/300/300'],
      rating: 4.6,
      reviewCount: 78,
      seller: {
        companyName: 'FarmEquip Direct',
        verificationStatus: 'verified'
      },
      expiresIn: '1 week',
      stockLeft: 18,
      totalStock: 25
    }
  ];

  const categories = [
    { id: 'all', name: 'All Deals' },
    { id: 'seeds', name: 'Seeds' },
    { id: 'fertilizers', name: 'Fertilizers' },
    { id: 'pesticides', name: 'Pesticides' },
    { id: 'irrigation', name: 'Irrigation' },
    { id: 'tools', name: 'Tools & Equipment' }
  ];

  const sortOptions = [
    { id: 'discount', name: 'Highest Discount' },
    { id: 'ending', name: 'Ending Soon' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'price-low', name: 'Price: Low to High' }
  ];

  const filteredDeals = deals.filter(deal => 
    selectedCategory === 'all' || deal.category === selectedCategory
  );

  const getTimeColor = (expiresIn: string) => {
    if (expiresIn.includes('hour')) return 'text-red-600';
    if (expiresIn.includes('day')) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getStockColor = (stockLeft: number, totalStock: number) => {
    const percentage = (stockLeft / totalStock) * 100;
    if (percentage < 20) return 'text-red-600';
    if (percentage < 50) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🔥 Hot Deals & Offers</h1>
            <p className="text-xl mb-8">Limited time offers on premium agricultural products</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold">{deals.length}</span> Active Deals
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold">Up to 40%</span> OFF
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold">Limited Stock</span> Available
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <div key={deal._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Deal Badge */}
              <div className="relative">
                <img
                  src={deal.images[0] || '/api/placeholder/300/200'}
                  alt={deal.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {deal.discount}% OFF
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  ⏰ {deal.expiresIn}
                </div>
              </div>

              <div className="p-4">
                {/* Stock Warning */}
                <div className={`text-sm font-medium mb-2 ${getStockColor(deal.stockLeft, deal.totalStock)}`}>
                  ⚠️ Only {deal.stockLeft} left in stock!
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(deal.stockLeft / deal.totalStock) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{deal.name}</h3>
                
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(deal.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{deal.rating} ({deal.reviewCount} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-2xl font-bold text-red-500">₹{deal.discountedPrice.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 line-through ml-2">₹{deal.originalPrice.toLocaleString()}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    deal.seller.verificationStatus === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {deal.seller.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                  </span>
                </div>

                {/* Savings */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                  <p className="text-green-800 text-sm font-medium">
                    💰 You save ₹{(deal.originalPrice - deal.discountedPrice).toLocaleString()}
                  </p>
                </div>

                <Link
                  href={`/dashboard/farmer/marketplace/products/${deal._id}`}
                  className="block w-full text-center bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Grab This Deal
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals available</h3>
            <p className="text-gray-600 mb-4">Check back soon for new offers!</p>
            <Link
              href="/marketplace"
              className="inline-flex items-center px-4 py-2 bg-[#1f3b2c] text-white rounded-lg hover:bg-[#2d4f3c]"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Deal Alerts */}
        <div className="mt-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🔔 Never Miss a Deal!</h2>
            <p className="text-gray-700 mb-6">Get notified about new deals and exclusive offers</p>
            <div className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}