import { NextRequest, NextResponse } from 'next/server';
import { Product, Seller, Order } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    console.log('🏆 Fetching top products:', { sellerId });

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Get top products based on actual order data
    const topProducts = await Order.aggregate([
      { $match: { sellerId, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { 
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    const formattedProducts = topProducts.map(product => ({
      _id: product._id,
      name: product.name,
      quantity: product.totalSold,
      revenue: product.totalRevenue
    }));

    return NextResponse.json({ products: formattedProducts });

  } catch (error) {
    console.error('❌ Error fetching top products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
