"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  specifications: Record<string, string>;
  stock: number;
  seller: {
    companyName: string;
    verificationStatus: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Mock product data
  const product: Product = {
    _id: params.id as string,
    name: 'Organic Wheat Seeds Premium Quality',
    price: 2500,
    originalPrice: 3000,
    images: ['/api/placeholder/600/400'],
    category: 'seeds',
    rating: 4.5,
    reviewCount: 23,
    description: 'Premium quality organic wheat seeds suitable for all seasons. High germination rate and disease resistant. Perfect for modern farming practices.',
    specifications: {
      'Brand': 'AgriTech Solutions',
      'Variety': 'HD-2967',
      'Purity': '98%',
      'Germination Rate': '85%',
      'Moisture': '12%',
      'Packaging': '25 kg bag',
      'Shelf Life': '12 months',
      'Origin': 'India'
    },
    stock: 50,
    seller: {
      companyName: 'AgriTech Solutions',
      verificationStatus: 'verified'
    }
  };

  const relatedProducts: Product[] = [
    {
      _id: '2',
      name: 'Organic Rice Seeds Basmati',
      price: 3200,
      images: ['/api/placeholder/300/300'],
      category: 'seeds',
      rating: 4.3,
      reviewCount: 18,
      description: '',
      specifications: {},
      stock: 30,
      seller: {
        companyName: 'GreenGrow Supplies',
        verificationStatus: 'verified'
      }
    }
  ];

  const addToCart = () => {
    console.log('Added to cart:', product._id, quantity);
  };

  const buyNow = () => {
    console.log('Buy now:', product._id, quantity);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex text-sm text-gray-600">
            <Link href="/marketplace" className="hover:text-[#1f3b2c]">Marketplace</Link>
            <span className="mx-2">/</span>
            <Link href={`/marketplace/category/${product.category}`} className="hover:text-[#1f3b2c] capitalize">{product.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={product.images[0] || '/api/placeholder/600/400'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg">
                  <img
                    src={product.images[0] || '/api/placeholder/150/150'}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">{product.rating} ({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="ml-3 text-xl text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
                {product.originalPrice && (
                  <span className="ml-3 bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="mb-6">
                <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 10 ? '✓ In Stock' : `Only ${product.stock} left`}
                </span>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border border-gray-300 rounded-md py-1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={addToCart}
                  className="flex-1 bg-[#1f3b2c] text-white py-3 rounded-lg hover:bg-[#2d4f3c] font-medium"
                >
                  Add to Cart
                </button>
                <button
                  onClick={buyNow}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-medium"
                >
                  Buy Now
                </button>
              </div>

              {/* Seller Info */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sold by</p>
                    <p className="font-medium text-gray-900">{product.seller.companyName}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    product.seller.verificationStatus === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.seller.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Tabs */}
            <div className="bg-white rounded-lg shadow-md mt-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {['description', 'specifications', 'reviews'].map((tab) => (
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

              <div className="p-6">
                {activeTab === 'description' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Description</h3>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-medium text-gray-900 mr-2">{key}:</span>
                          <span className="text-gray-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Reviews</h3>
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">⭐</div>
                      <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={relatedProduct.images[0] || '/api/placeholder/300/200'}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < Math.floor(relatedProduct.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{relatedProduct.rating}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">₹{relatedProduct.price.toLocaleString()}</span>
                    </div>
                    <Link
                      href={`/marketplace/products/${relatedProduct._id}`}
                      className="block w-full text-center bg-[#1f3b2c] text-white py-2 rounded-lg hover:bg-[#2d4f3c] transition-colors text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}