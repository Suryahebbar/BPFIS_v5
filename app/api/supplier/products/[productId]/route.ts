import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Product } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';

const { ObjectId } = mongoose.Types;

function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

function toObjectId(id: string): mongoose.Types.ObjectId {
  return new ObjectId(id);
}

// GET /api/supplier/products/[productId] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    const { productId } = await params;

    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const sellerObjectId = toObjectId(auth.sellerId);
    const productObjectId = toObjectId(productId);

    const product = await Product.findOne({
      _id: productObjectId,
      sellerId: sellerObjectId
    } as any).lean();

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
    await connectDB();

    const auth = await requireAuth(request);
    const { productId } = await params;

    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const sellerObjectId = toObjectId(auth.sellerId);
    const productObjectId = toObjectId(productId);

    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    const assignIfProvided = (key: string, value: unknown) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    };

    assignIfProvided('name', body.name);
    assignIfProvided('category', body.category);
    assignIfProvided('description', body.description);
    assignIfProvided('status', body.status);

    if (body.price !== undefined) {
      assignIfProvided('price', Number(body.price));
    }

    if (body.stockQuantity !== undefined) {
      assignIfProvided('stockQuantity', Number(body.stockQuantity));
    }

    if (body.reorderThreshold !== undefined) {
      assignIfProvided('reorderThreshold', Number(body.reorderThreshold));
    }

    if (body.tags !== undefined) {
      assignIfProvided('tags', Array.isArray(body.tags) ? body.tags : []);
    }

    if (body.specifications !== undefined) {
      assignIfProvided('specifications', body.specifications);
    }

    if (body.dimensions !== undefined) {
      assignIfProvided('dimensions', body.dimensions);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields provided to update' }, { status: 400 });
    }

    const product = await Product.findOneAndUpdate(
      { _id: productObjectId, sellerId: sellerObjectId } as any,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

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
    await connectDB();

    const auth = await requireAuth(request);
    const { productId } = await params;

    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const sellerObjectId = toObjectId(auth.sellerId);
    const productObjectId = toObjectId(productId);

    const product = await Product.findOneAndDelete({
      _id: productObjectId,
      sellerId: sellerObjectId
    } as any);

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
    await connectDB();

    const auth = await requireAuth(request);
    const { productId } = await params;

    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const sellerObjectId = toObjectId(auth.sellerId);
    const productObjectId = toObjectId(productId);

    const product = await Product.findOne({
      _id: productObjectId,
      sellerId: sellerObjectId
    } as any);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    product.status = newStatus;
    await product.save();

    return NextResponse.json({
      message: `Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      product
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    return NextResponse.json({ error: 'Failed to toggle product status' }, { status: 500 });
  }
}
