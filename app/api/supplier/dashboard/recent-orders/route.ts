import { NextRequest, NextResponse } from 'next/server';
import { Order, Seller } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import mongoose from 'mongoose';

// GET /api/supplier/dashboard/recent-orders - Get recent orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    console.log('📋 Fetching recent orders:', { sellerId });

    // Validate seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Get real recent orders from database
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const orders = await Order.aggregate([
      { $match: { sellerId: sellerObjectId } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      { $project: { orderNumber: 1, customer: 1, totalAmount: 1, orderStatus: 1, createdAt: 1 } }
    ]);

    console.log('✅ Recent orders fetched:', { sellerId, count: orders.length });

    return NextResponse.json({
      orders
    });

  } catch (error) {
    console.error('❌ Error fetching recent orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
