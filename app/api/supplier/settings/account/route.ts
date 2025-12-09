import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Seller, Product } from '@/lib/models/supplier';
import { requireAuth } from '@/lib/supplier-auth-middleware';

// DELETE /api/supplier/settings/account - Soft-delete supplier account
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { isActive: false },
      { new: true }
    );

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Optionally deactivate all products
    await Product.updateMany({ sellerId }, { status: 'inactive' });

    return NextResponse.json({ message: 'Account deactivated and products set to inactive' });
  } catch (error: any) {
    console.error('Error deleting supplier account:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete account' }, { status: 500 });
  }
}
