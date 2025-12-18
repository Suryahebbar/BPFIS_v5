'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: Array<{ url: string; alt?: string }>;
    rating?: number;
    reviewCount?: number;
    stock?: number;
    seller?: {
      companyName: string;
      verificationStatus?: 'verified' | 'pending' | 'unverified';
    };
    isInWishlist?: boolean;
  };
  onView?: () => void;
  onAddToWishlist?: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({ 
  product, 
  onView, 
  onAddToWishlist, 
  onAddToCart 
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(!!product.isInWishlist);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.();
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.();
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div 
      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.images?.[0]?.url || '/hero-bg.jpg'}
          alt={product.images?.[0]?.alt || product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          className={`absolute top-3 right-3 p-2 rounded-full ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} bg-white/90 hover:bg-white transition-colors`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        
        {/* Quick Add to Cart Button */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-white/95 p-3 transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
            onClick={handleAddToCartClick}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Seller Info */}
        {product.seller && (
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-600">{product.seller.companyName}</span>
            {product.seller.verificationStatus === 'verified' && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>
        )}
        
        {/* Product Name */}
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 h-12">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="mt-2 mb-3">
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        {/* Rating */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center">
            {typeof product.rating === 'number' ? (
              <>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= Math.round(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="ml-1 text-sm text-gray-600">
                  ({product.reviewCount || 0})
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">No reviews</span>
            )}
          </div>
          
          {product.stock !== undefined && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
