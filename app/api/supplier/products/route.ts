import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    // Get supplier's products
    const products = await Product.find({ sellerId: sellerId as any })
      .select('name sku status category price')
      .sort({ name: 1 });

    return NextResponse.json({
      message: 'Products fetched successfully',
      data: {
        products: products.map(product => ({
          id: product._id,
          name: product.name,
          sku: product.sku,
          status: product.status,
          category: product.category,
          price: product.price
        })),
        total: products.length
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
