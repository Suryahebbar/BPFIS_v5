import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Seller, Product, Order } from '@/lib/models/supplier';
import { requireAuth } from '@/lib/supplier-auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const [seller, products, orders] = await Promise.all([
      Seller.findById(sellerId).select('-passwordHash -emailOtp -phoneOtp').lean(),
      Product.find({ sellerId }).lean(),
      Order.find({ sellerId }).lean(),
    ]);

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const exportData = {
      seller,
      products,
      orders,
      exportedAt: new Date().toISOString(),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="supplier-data.json"',
      },
    });
  } catch (error: any) {
    console.error('Error exporting supplier data:', error);
    return NextResponse.json({ error: error.message || 'Failed to export data' }, { status: 500 });
  }
}
