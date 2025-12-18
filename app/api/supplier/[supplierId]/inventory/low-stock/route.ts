import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/supplier';
import { requireAuth } from '@/lib/supplier-auth-middleware';

// GET /api/supplier/[supplierId]/inventory/low-stock - Get low stock products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    
    // Authenticate supplier
    const auth = await requireAuth(request, { params: resolvedParams });
    const sellerId = auth.sellerId;
    
    // Get low stock products (where stockQuantity <= reorderThreshold)
    const lowStockProducts = await Product.find({
      sellerId: sellerId as any,
      status: 'active',
      $expr: { $lte: ['$stockQuantity', '$reorderThreshold'] }
    })
    .select('name sku category stockQuantity reorderThreshold price images')
    .sort({ stockQuantity: 1 })
    .lean();
    
    return NextResponse.json({ 
      products: lowStockProducts.map(product => ({
        ...product,
        lowStockLevel: product.reorderThreshold - product.stockQuantity,
        percentageRemaining: Math.round((product.stockQuantity / product.reorderThreshold) * 100)
      }))
    });
    
  } catch (error: any) {
    console.error('Error fetching low stock products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch low stock products' },
      { status: 500 }
    );
  }
}
