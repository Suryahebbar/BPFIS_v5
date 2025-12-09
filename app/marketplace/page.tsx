"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  seller: {
    companyName: string;
    verificationStatus: string;
  };
  discount?: number;
  featured?: boolean;
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'seeds', name: 'Seeds' },
    { id: 'fertilizers', name: 'Fertilizers' },
    { id: 'pesticides', name: 'Pesticides' },
    { id: 'irrigation', name: 'Irrigation' },
    { id: 'tools', name: 'Tools & Equipment' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'all') {
          params.set('category', selectedCategory);
        }
        if (searchTerm) {
          params.set('search', searchTerm);
        }

        const response = await fetch(`/api/marketplace/products?${params.toString()}`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error((data && data.error) || 'Failed to load products');
        }

        setProducts((data.products as Product[]) || []);
      } catch (e) {
        console.error('Error loading marketplace products:', e);
        setError(e instanceof Error ? e.message : 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">AgriLink Marketplace</h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/marketplace/cart"
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
              </Link>
              <Link
                href="/marketplace/orders"
                className="text-gray-600 hover:text-gray-900"
              >
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c]"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/marketplace/deals"
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                🔥 Hot Deals
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#1f3b2c] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Featured Products */}
        {!loading && selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(product => product.featured).map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={product.images[0] || '/api/placeholder/300/200'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.discount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {product.discount}% OFF
                      </span>
                    )}
                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                      FEATURED
                    </span>
                  </div>
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
                      <div>
                        <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.seller.verificationStatus === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.seller.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
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

        {/* Loading state */}
        {loading && (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3b2c]"></div>
          </div>
        )}

        {/* All Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.images[0] || '/api/placeholder/300/200'}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                  {product.discount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-600">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-500 line-through ml-1">₹{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/farmer/marketplace/products/${product._id}`}
                    className="block w-full text-center bg-[#1f3b2c] text-white py-2 rounded-lg hover:bg-[#2d4f3c] transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}