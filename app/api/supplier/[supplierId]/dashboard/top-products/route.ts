import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order, Product } from '@/lib/models/supplier';
import { FarmerOrder } from '@/lib/models/FarmerOrder';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    await connectDB();
    
    // Authenticate supplier and validate supplierId
    const resolvedParams = await params;
    const auth = await requireAuth(request, { params: resolvedParams });
    const sellerId = auth.sellerId;
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const period = searchParams.get('period') || '30'; // Default to 30 days

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Get top selling products from supplier orders
    const supplierTopProducts = await Order.aggregate([
      { 
        $match: { 
          sellerId: sellerObjectId as any, 
          createdAt: { $gte: startDate },
          orderStatus: { $nin: ['cancelled', 'returned'] }
        } 
      },
      { $unwind: '$items' },
      { 
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit * 2 }, // Get more to account for filtering
      {
        $lookup: {
          from: 'supplierproducts',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: '$product._id',
          name: '$product.name',
          sku: '$product.sku',
          price: '$product.price',
          stockQuantity: '$product.stockQuantity',
          totalSold: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      }
    ]);

    // Get top products from farmer orders
    const farmerOrders = await FarmerOrder.find({
      createdAt: { $gte: startDate },
      status: { $nin: ['cancelled'] },
      'items.sellerId': { $in: [sellerId, sellerObjectId.toString()] }
    }).lean();

    // Aggregate farmer order items
    const farmerProductMap = new Map();
    farmerOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (item.sellerId?.toString() === sellerId || item.sellerId?.toString() === sellerObjectId.toString()) {
          const productId = item.productId?.toString();
          if (productId) {
            const existing = farmerProductMap.get(productId) || { totalSold: 0, totalRevenue: 0, orderCount: 0 };
            farmerProductMap.set(productId, {
              totalSold: existing.totalSold + (item.quantity || 0),
              totalRevenue: existing.totalRevenue + ((item.price || 0) * (item.quantity || 0)),
              orderCount: existing.orderCount + 1
            });
          }
        }
      });
    });

    // Combine results
    const combinedMap = new Map();
    
    // Add supplier order products
    supplierTopProducts.forEach(product => {
      const id = product._id.toString();
      combinedMap.set(id, {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        quantity: product.totalSold,
        revenue: product.totalRevenue
      });
    });
    
    // Add/merge farmer order products
    for (const [productId, stats] of farmerProductMap.entries()) {
      const existing = combinedMap.get(productId);
      if (existing) {
        existing.quantity += stats.totalSold;
        existing.revenue += stats.totalRevenue;
      } else {
        // Try to get product details
        try {
          const product = await Product.findById(productId).lean();
          if (product) {
            combinedMap.set(productId, {
              _id: product._id,
              name: product.name,
              sku: product.sku,
              quantity: stats.totalSold,
              revenue: stats.totalRevenue
            });
          }
        } catch (e) {
          console.error('Error fetching product:', e);
        }
      }
    }

    // Convert to array and sort
    const topProducts = Array.from(combinedMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    return NextResponse.json({ products: topProducts });
  } catch (error) {
    console.error('Error fetching top products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top products' },
      { status: 500 }
    );
  }
}
