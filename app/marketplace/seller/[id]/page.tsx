"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
}

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
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

export default function SellerDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('products');

  // Mock seller data
  const seller: Seller = {
    _id: params.id as string,
    companyName: 'AgriTech Solutions',
    logo: '/api/placeholder/150/150',
    rating: 4.7,
    reviewCount: 234,
    totalProducts: 156,
    verificationStatus: 'verified',
    description: 'Leading supplier of premium agricultural seeds, fertilizers, and farming equipment. We have been serving farmers across India for over 10 years with quality products and excellent service.',
    location: 'Bangalore, Karnataka',
    joinDate: '2022-01-15',
    responseRate: 98,
    avgResponseTime: '2 hours',
    contactInfo: {
      email: 'info@agritechsolutions.com',
      phone: '+91 8012345678',
      address: '123 Industrial Area, Bangalore, Karnataka - 560001'
    }
  };

  // Mock products data
  const products: Product[] = [
    {
      _id: '1',
      name: 'Organic Wheat Seeds Premium Quality',
      price: 2500,
      images: ['/api/placeholder/300/300'],
      rating: 4.5,
      reviewCount: 23,
      category: 'seeds'
    },
    {
      _id: '2',
      name: 'NPK 20-20-20 Fertilizer Complete Nutrition',
      price: 850,
      images: ['/api/placeholder/300/300'],
      rating: 4.2,
      reviewCount: 15,
      category: 'fertilizers'
    },
    {
      _id: '3',
      name: 'Drip Irrigation Kit Smart System',
      price: 12000,
      images: ['/api/placeholder/300/300'],
      rating: 4.8,
      reviewCount: 31,
      category: 'irrigation'
    }
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
        <div className="mb-8">
          <Link href="/marketplace/sellers" className="text-[#1f3b2c] hover:underline mb-4 inline-block">
            ← Back to Sellers
          </Link>
        </div>

        {/* Seller Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={seller.logo || '/api/placeholder/150/150'}
              alt={seller.companyName}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{seller.companyName}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getVerificationBadge(seller.verificationStatus).color}`}>
                  ✓ {getVerificationBadge(seller.verificationStatus).text}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < Math.floor(seller.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">{seller.rating} ({seller.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {seller.location}
                </div>
              </div>

              <p className="text-gray-600 mb-4">{seller.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{seller.totalProducts}</div>
                  <p className="text-sm text-gray-600">Products</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{seller.responseRate}%</div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{seller.avgResponseTime}</div>
                  <p className="text-sm text-gray-600">Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{new Date().getFullYear() - new Date(seller.joinDate).getFullYear()}</div>
                  <p className="text-sm text-gray-600">Years Active</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="bg-[#1f3b2c] text-white px-6 py-2 rounded-lg hover:bg-[#2d4f3c]">
                  Contact Seller
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50">
                  Follow Store
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {['products', 'about', 'reviews', 'contact'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-[#1f3b2c] text-[#1f3b2c]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'products' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Products ({products.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={product.images[0] || '/api/placeholder/300/200'}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">{product.rating} ({product.reviewCount})</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                            {product.category}
                          </span>
                        </div>
                        <Link
                          href={`/dashboard/farmer/marketplace/products/${product._id}`}
                          className="block w-full text-center bg-[#1f3b2c] text-white py-2 rounded-lg hover:bg-[#2d4f3c] transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About {seller.companyName}</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 mb-4">{seller.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Business Information</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>Founded: {new Date(seller.joinDate).getFullYear()}</li>
                        <li>Location: {seller.location}</li>
                        <li>Total Products: {seller.totalProducts}</li>
                        <li>Customer Rating: {seller.rating}/5</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Service Metrics</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>Response Rate: {seller.responseRate}%</li>
                        <li>Average Response Time: {seller.avgResponseTime}</li>
                        <li>Total Reviews: {seller.reviewCount}</li>
                        <li>Verification Status: {seller.verificationStatus}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Reviews coming soon!</h3>
                  <p className="text-gray-600">Be the first to review this seller.</p>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Get in Touch</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{seller.contactInfo.email}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{seller.contactInfo.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 mr-3 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{seller.contactInfo.address}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Send Message</h3>
                    <form className="space-y-4">
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c]"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c]"
                      />
                      <textarea
                        placeholder="Your Message"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c]"
                      ></textarea>
                      <button
                        type="submit"
                        className="w-full bg-[#1f3b2c] text-white py-2 rounded-lg hover:bg-[#2d4f3c]"
                      >
                        Send Message
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}