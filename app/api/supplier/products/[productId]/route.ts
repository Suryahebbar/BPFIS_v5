import { NextRequest, NextResponse } from 'next/server';
import { Product, InventoryLog } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { Types } from 'mongoose';

// GET /api/supplier/products/[productId] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    await connectDB();
    
    // Get seller ID from session/auth
    const sellerId = request.headers.get('x-seller-id');
    if (!sellerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await Product.findOne({
      _id: productId as any,
      sellerId: sellerId as any
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/supplier/products/[productId] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    await connectDB();
    
    // Get seller ID from session/auth
    const sellerId = request.headers.get('x-seller-id');
    if (!sellerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, description, price, stockQuantity, reorderThreshold, tags, specifications, dimensions, status } = body;

    // Find current product to track stock changes
    const currentProduct = await Product.findOne({
      _id: productId as any,
      sellerId: sellerId as any
    });

    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Track stock changes
    const oldStock = currentProduct.stockQuantity;
    const newStock = stockQuantity !== undefined ? stockQuantity : oldStock;
    
    if (oldStock !== newStock) {
      // Create inventory log
      const change = newStock - oldStock;
      await new InventoryLog({
        productId: productId as any,
        sellerId: sellerId as any,
        change,
        reason: 'manual',
        previousStock: oldStock,
        newStock,
        notes: 'Stock updated via product edit'
      }).save();
    }

    // Update product
    const updateData: any = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stockQuantity !== undefined) updateData.stockQuantity = stockQuantity;
    if (reorderThreshold !== undefined) updateData.reorderThreshold = reorderThreshold;
    if (tags) updateData.tags = tags;
    if (specifications) updateData.specifications = specifications;
    if (dimensions) updateData.dimensions = dimensions;
    if (status) updateData.status = status;

    const product = await Product.findByIdAndUpdate(
      productId as any,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/supplier/products/[productId] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    await connectDB();
    
    // Get seller ID from session/auth
    const sellerId = request.headers.get('x-seller-id');
    if (!sellerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await Product.findOneAndDelete({
      _id: productId as any,
      sellerId: sellerId as any
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

// POST /api/supplier/products/[productId]/toggle-active - Toggle product status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    await connectDB();
    
    // Get seller ID from session/auth
    const sellerId = request.headers.get('x-seller-id');
    if (!sellerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await Product.findOne({
      _id: productId as any,
      sellerId: sellerId as any
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Toggle between active and inactive
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId as any,
      { status: newStatus },
      { new: true }
    );

    return NextResponse.json({ 
      message: `Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    return NextResponse.json({ error: 'Failed to toggle product status' }, { status: 500 });
  }
}
