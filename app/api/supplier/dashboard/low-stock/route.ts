import { NextRequest, NextResponse } from 'next/server';
import { Product, Seller } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import mongoose from 'mongoose';

// GET /api/supplier/dashboard/low-stock - Get low stock products
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    console.log('📦 Fetching low stock products:', { sellerId });

    // Validate seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Get real low stock products from database
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const products = await Product.aggregate([
      { $match: { sellerId: sellerObjectId } },
      { $match: { $expr: { $lte: ['$stockQuantity', '$reorderThreshold'] } } },
      { $sort: { stockQuantity: 1 } },
      { $limit: 10 },
      { $project: { name: 1, sku: 1, stockQuantity: 1, reorderThreshold: 1 } }
    ]);

    console.log('✅ Low stock products fetched:', { sellerId, count: products.length });

    return NextResponse.json({
      products
    });

  } catch (error) {
    console.error('❌ Error fetching low stock products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
