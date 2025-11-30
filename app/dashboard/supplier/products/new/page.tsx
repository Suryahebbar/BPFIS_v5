"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    sku: '',
    category: '',
    description: '',
    tags: '',
    
    // Pricing & Inventory
    price: '',
    stockQuantity: '',
    reorderThreshold: '',
    
    // Specifications
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    
    // Images (will be handled separately)
    images: [] as string[]
  });

  const categories = [
    { value: 'seeds', label: 'Seeds' },
    { value: 'fertilizers', label: 'Fertilizers' },
    { value: 'pesticides', label: 'Pesticides' },
    { value: 'tools', label: 'Tools' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'feed', label: 'Feed' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        reorderThreshold: parseInt(formData.reorderThreshold),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        dimensions: {
          ...formData.dimensions,
          length: parseFloat(formData.dimensions.length) || undefined,
          width: parseFloat(formData.dimensions.width) || undefined,
          height: parseFloat(formData.dimensions.height) || undefined
        }
      };

      const response = await fetch('/api/supplier/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-seller-id': 'temp-seller-id' // TODO: Get from auth
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Product created successfully!');
        setTimeout(() => {
          router.push('/dashboard/supplier/products');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setError('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1f3b2c]">Add New Product</h1>
          <p className="text-sm text-[#6b7280] mt-1">Create a new product listing for your store</p>
        </div>
        <Link
          href="/dashboard/supplier/products"
          className="inline-flex items-center justify-center rounded-md border border-[#e2d4b7] px-4 py-2 text-sm font-medium text-[#1f3b2c] hover:bg-[#f9fafb]"
        >
          Back to Products
        </Link>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white border border-[#e2d4b7] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#1f3b2c] mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Product Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                SKU *
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                required
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                placeholder="PROD-001"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                placeholder="organic, premium, bestseller (comma separated)"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-[#1f3b2c] mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
              placeholder="Describe your product in detail..."
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white border border-[#e2d4b7] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#1f3b2c] mb-6">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Price (₹) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Stock Quantity *
              </label>
              <input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                required
                min="0"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="reorderThreshold" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Reorder Threshold *
              </label>
              <input
                id="reorderThreshold"
                name="reorderThreshold"
                type="number"
                required
                min="0"
                value={formData.reorderThreshold}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                placeholder="5"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white border border-[#e2d4b7] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#1f3b2c] mb-6">Specifications (Optional)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Weight (kg)
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                min="0"
                step="0.01"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="length" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Length (cm)
              </label>
              <input
                id="length"
                name="dimensions.length"
                type="number"
                min="0"
                step="0.01"
                value={formData.dimensions.length}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="width" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Width (cm)
              </label>
              <input
                id="width"
                name="dimensions.width"
                type="number"
                min="0"
                step="0.01"
                value={formData.dimensions.width}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Height (cm)
              </label>
              <input
                id="height"
                name="dimensions.height"
                type="number"
                min="0"
                step="0.01"
                value={formData.dimensions.height}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/dashboard/supplier/products"
            className="inline-flex items-center justify-center rounded-md border border-[#e2d4b7] px-6 py-2 text-sm font-medium text-[#1f3b2c] hover:bg-[#f9fafb]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-[#1f3b2c] px-6 py-2 text-sm font-medium text-white hover:bg-[#2d4f3c] disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
