import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';

// GET /api/supplier/inventory/low-stock - Get low stock products for authenticated supplier
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate supplier via cookie-based session
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    // Find products where stock is zero or at/below reorder threshold
    const products = await Product.find({
      // Cast sellerId to any to avoid TS/ObjectId generic mismatch while still filtering correctly
      sellerId: sellerId as any,
      status: 'active',
      $or: [
        { stockQuantity: { $lte: 0 } },
        { $expr: { $lte: ['$stockQuantity', '$reorderThreshold'] } }
      ]
    })
      .select('name sku category stockQuantity reorderThreshold price status')
      .sort({ stockQuantity: 1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      products,
      total: products.length,
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return NextResponse.json({ error: 'Failed to fetch low stock products' }, { status: 500 });
  }
}
