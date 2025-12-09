import { NextRequest, NextResponse } from 'next/server';
import { Product, InventoryLog } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const body = await request.json();
    const { productId, quantity, reason, notes } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
    }

    const parsedQuantity = Number(quantity);

    if (Number.isNaN(parsedQuantity)) {
      return NextResponse.json({ error: 'Quantity must be a valid number' }, { status: 400 });
    }

    // Find and update the product
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const product = await Product.findOne({
      _id: productObjectId,
      sellerId: sellerObjectId
    } as any);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const previousStock = product.stockQuantity;
    const change = parsedQuantity - previousStock;

    // Validate new stock
    if (parsedQuantity < 0) {
      return NextResponse.json({ error: 'Stock quantity cannot be negative' }, { status: 400 });
    }

    // Create inventory log
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const allowedReasons: Array<'manual' | 'sale' | 'return' | 'restock' | 'adjustment'> = ['manual', 'sale', 'return', 'restock', 'adjustment'];
      const normalizedReason = allowedReasons.includes(reason) ? reason : 'manual';

      const log = new InventoryLog({
        productId: productObjectId,
        sellerId: sellerObjectId,
        change,
        reason: normalizedReason,
        previousStock,
        newStock: parsedQuantity,
        notes
      });

      await log.save({ session });

      product.stockQuantity = parsedQuantity;
      await product.save({ session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    return NextResponse.json({
      message: 'Inventory updated successfully',
      update: {
        productId,
        previousStock,
        newStock: parsedQuantity,
        change,
        reason: (reason || 'manual').toString(),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update inventory'
    }, { status: 500 });
  }
}
