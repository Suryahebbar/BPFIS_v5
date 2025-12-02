"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Seller {
  _id: string;
  companyName: string;
  logo: string;
  rating: number;
  reviewCount: number;
  totalProducts: number;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  description: string;
  location: string;
  joinDate: string;
  responseRate: number;
  avgResponseTime: string;
}

export default function SellersPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Mock sellers data
  const sellers: Seller[] = [
    {
      _id: '1',
      companyName: 'AgriTech Solutions',
      logo: '/api/placeholder/100/100',
      rating: 4.7,
      reviewCount: 234,
      totalProducts: 156,
      verificationStatus: 'verified',
      description: 'Leading supplier of premium agricultural seeds and fertilizers',
      location: 'Bangalore, Karnataka',
      joinDate: '2022-01-15',
      responseRate: 98,
      avgResponseTime: '2 hours'
    },
    {
      _id: '2',
      companyName: 'GreenGrow Supplies',
      logo: '/api/placeholder/100/100',
      rating: 4.5,
      reviewCount: 189,
      totalProducts: 89,
      verificationStatus: 'verified',
      description: 'Specialized in organic fertilizers and pesticides',
      location: 'Pune, Maharashtra',
      joinDate: '2022-03-20',
      responseRate: 95,
      avgResponseTime: '3 hours'
    },
    {
      _id: '3',
      companyName: 'Irrigation Pro',
      logo: '/api/placeholder/100/100',
      rating: 4.8,
      reviewCount: 156,
      totalProducts: 67,
      verificationStatus: 'verified',
      description: 'Modern irrigation systems and water management solutions',
      location: 'Hyderabad, Telangana',
      joinDate: '2022-06-10',
      responseRate: 99,
      avgResponseTime: '1 hour'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Sellers' },
    { id: 'seeds', name: 'Seeds Suppliers' },
    { id: 'fertilizers', name: 'Fertilizer Sellers' },
    { id: 'irrigation', name: 'Irrigation Equipment' },
    { id: 'tools', name: 'Farm Tools' }
  ];

  const sortOptions = [
    { id: 'rating', name: 'Highest Rating' },
    { id: 'products', name: 'Most Products' },
    { id: 'newest', name: 'Newest Sellers' },
    { id: 'response', name: 'Fastest Response' }
  ];

  const getVerificationBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      verified: { text: 'Verified', color: 'bg-green-100 text-green-800' },
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      unverified: { text: 'Unverified', color: 'bg-gray-100 text-gray-800' }
    };
    return badges[status] || badges.unverified;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Verified Sellers</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with trusted agricultural suppliers and manufacturers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-[#1f3b2c]">{sellers.length}</div>
            <p className="text-gray-600">Active Sellers</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-[#1f3b2c]">98%</div>
            <p className="text-gray-600">Verified Sellers</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-[#1f3b2c">4.6</div>
            <p className="text-gray-600">Avg Rating</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-[#1f3b2c]">2h</div>
            <p className="text-gray-600">Avg Response Time</p>
          </div>
        </div>

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
                      ? 'bg-[#1f3b2c] text-white'
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
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c]"
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

        {/* Sellers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((seller) => (
            <div key={seller._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Seller Header */}
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={seller.logo || '/api/placeholder/100/100'}
                    alt={seller.companyName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{seller.companyName}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < Math.floor(seller.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{seller.rating} ({seller.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getVerificationBadge(seller.verificationStatus).color}`}>
                    ✓ {getVerificationBadge(seller.verificationStatus).text}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{seller.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{seller.totalProducts}</div>
                    <p className="text-xs text-gray-600">Products</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{seller.responseRate}%</div>
                    <p className="text-xs text-gray-600">Response Rate</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {seller.location}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/marketplace/seller/${seller._id}`}
                    className="flex-1 text-center bg-[#1f3b2c] text-white py-2 rounded-lg hover:bg-[#2d4f3c] text-sm"
                  >
                    View Store
                  </Link>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Become a Seller CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#1f3b2c] to-green-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Become a Seller</h2>
          <p className="mb-6">Join thousands of trusted sellers on AgriLink Marketplace</p>
          <button className="bg-white text-[#1f3b2c] px-6 py-3 rounded-lg hover:bg-gray-100 font-medium">
            Start Selling
          </button>
        </div>
      </div>
    </div>
  );
}