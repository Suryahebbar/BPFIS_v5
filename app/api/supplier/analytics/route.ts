import { NextRequest, NextResponse } from 'next/server';
import { Order, Product, DailyAnalytics } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get analytics data
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const [
      revenueData,
      ordersData,
      topProductsAggregation,
      categoryData,
      dailyStats,
      activeProductsCount
    ] = await Promise.all([
      // Total revenue
      Order.aggregate([
        { $match: { sellerId: sellerObjectId, paymentStatus: 'paid', createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      // Total orders
      Order.aggregate([
        { $match: { sellerId: sellerObjectId, createdAt: { $gte: startDate } } },
        { $count: "total" }
      ]),
      // Top products
      Order.aggregate([
        { $match: { sellerId: sellerObjectId, paymentStatus: 'paid', createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.total' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),
      // Category breakdown
      Order.aggregate([
        { $match: { sellerId: sellerObjectId, paymentStatus: 'paid', createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'supplierproducts',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.category',
            revenue: { $sum: '$items.total' },
            orders: { $sum: 1 }
          }
        }
      ]),
      // Daily analytics
      DailyAnalytics.aggregate([
        { $match: { sellerId: sellerObjectId, date: { $gte: startDate } } },
        { $sort: { date: -1 } }
      ]),
      Product.countDocuments({ sellerId: sellerObjectId, status: 'active' } as any)
    ]);

    const totalRevenue = revenueData[0]?.total || 0;
    const totalOrders = ordersData[0]?.total || 0;

    const topProducts = topProductsAggregation.map((product) => ({
      productId: product._id?.toString() ?? '',
      name: product.name,
      quantity: product.quantity,
      revenue: product.revenue
    }));

    // Format category data
    const totalCategoryRevenue = categoryData.reduce((sum: number, cat: any) => sum + (cat.revenue || 0), 0);
    const categoryBreakdown = categoryData.map((cat: any) => ({
      category: cat._id || 'other',
      revenue: cat.revenue || 0,
      orders: cat.orders || 0,
      percentage: totalCategoryRevenue > 0 ? parseFloat(((cat.revenue || 0) / totalCategoryRevenue * 100).toFixed(2)) : 0
    }));

    // Calculate growth metrics
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (range === '7d' ? 7 : range === '30d' ? 30 : 90));

    const [previousRevenue, previousOrders] = await Promise.all([
      Order.aggregate([
        { $match: { sellerId: sellerObjectId, paymentStatus: 'paid', createdAt: { $gte: previousStartDate, $lt: startDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { sellerId: sellerObjectId, createdAt: { $gte: previousStartDate, $lt: startDate } } },
        { $count: "total" }
      ])
    ]);

    const previousRevenueTotal = previousRevenue[0]?.total || 0;
    const previousOrdersCount = previousOrders[0]?.total || 0;
    const revenueGrowth = previousRevenueTotal > 0 
      ? ((totalRevenue - previousRevenueTotal) / previousRevenueTotal * 100).toFixed(1)
      : '0';
    
    const orderGrowth = previousOrdersCount > 0
      ? ((totalOrders - previousOrdersCount) / previousOrdersCount * 100).toFixed(1)
      : '0';

    const overview = {
      totalRevenue,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      activeProducts: activeProductsCount || 0,
      revenueGrowth: parseFloat(revenueGrowth),
      orderGrowth: parseFloat(orderGrowth)
    };

    const salesChart = dailyStats
      .map((day: any) => ({
        date: day.date,
        revenue: day.revenue ?? 0,
        orders: day.orders ?? 0
      }))
      .sort((a: { date: Date }, b: { date: Date }) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      overview,
      salesChart,
      topProducts,
      categoryBreakdown
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
