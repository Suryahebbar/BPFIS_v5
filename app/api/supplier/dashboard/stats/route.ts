import { NextRequest, NextResponse } from 'next/server';
import { Seller, Product, Order } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import mongoose from 'mongoose';

// GET /api/supplier/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    console.log('📊 Fetching dashboard stats:', { sellerId });

    // Validate seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Get real statistics from database
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const [
      totalOrders,
      revenueResult,
      activeProducts,
      avgOrderResult
    ] = await Promise.all([
      Order.aggregate([
        { $match: { sellerId: sellerObjectId } },
        { $count: "total" }
      ]),
      Order.aggregate([
        { $match: { sellerId: sellerObjectId, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Product.aggregate([
        { $match: { sellerId: sellerObjectId, status: 'active' } },
        { $count: "total" }
      ]),
      Order.aggregate([
        { $match: { sellerId: sellerObjectId, paymentStatus: 'paid' } },
        { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
      ])
    ]);

    const totalOrdersCount = totalOrders[0]?.total || 0;
    const totalRevenue = revenueResult[0]?.total || 0;
    const activeProductsCount = activeProducts[0]?.total || 0;
    const avgOrderValue = avgOrderResult[0]?.avg || 0;

    // Get previous month data for growth calculation
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const [lastMonthOrders, lastMonthRevenue] = await Promise.all([
      Order.aggregate([
        { $match: { 
          sellerId: sellerObjectId,
          createdAt: { $gte: lastMonth, $lt: new Date() } 
        }},
        { $count: "total" }
      ]),
      Order.aggregate([
        { 
          $match: { 
            sellerId: sellerObjectId,
            paymentStatus: 'paid',
            createdAt: { $gte: lastMonth, $lt: new Date() }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const lastMonthOrdersCount = lastMonthOrders[0]?.total || 0;
    const lastMonthRevenueTotal = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRevenueTotal > 0 
      ? ((totalRevenue - lastMonthRevenueTotal) / lastMonthRevenueTotal * 100).toFixed(1)
      : '0';
    
    const orderGrowth = lastMonthOrdersCount > 0
      ? ((totalOrdersCount - lastMonthOrdersCount) / lastMonthOrdersCount * 100).toFixed(1)
      : '0';

    console.log('✅ Dashboard stats fetched:', { sellerId, totalOrders, totalRevenue });

    return NextResponse.json({
      totalRevenue,
      totalOrders: totalOrdersCount,
      activeProducts: activeProductsCount,
      avgOrderValue,
      revenueGrowth: parseFloat(revenueGrowth),
      orderGrowth: parseFloat(orderGrowth)
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
