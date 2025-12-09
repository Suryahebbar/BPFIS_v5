import { NextRequest, NextResponse } from 'next/server';
import { Product, InventoryLog } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import mongoose from 'mongoose';

// GET /api/supplier/inventory/logs - Get inventory change logs
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // Get inventory logs with pagination
    const skip = (page - 1) * limit;
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    
    const [logs, totalCount] = await Promise.all([
      InventoryLog.aggregate([
        { $match: { sellerId: sellerObjectId } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'supplierproducts',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            productId: 1,
            sellerId: 1,
            change: 1,
            reason: 1,
            referenceId: 1,
            previousStock: 1,
            newStock: 1,
            notes: 1,
            createdAt: 1,
            updatedAt: 1,
            'product.name': 1,
            'product.sku': 1
          }
        }
      ]),
      InventoryLog.aggregate([
        { $match: { sellerId: sellerObjectId } },
        { $count: "total" }
      ])
    ]);

    const total = totalCount[0]?.total || 0;

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory logs' }, { status: 500 });
  }
}

// POST /api/supplier/inventory/logs - Add inventory change log
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const body = await request.json();
    const {
      productId,
      change,
      reason,
      referenceId,
      notes
    } = body;

    // Validate required fields
    if (!productId || change === undefined || !reason) {
      return NextResponse.json(
        { error: 'Product ID, change, and reason are required' },
        { status: 400 }
      );
    }

    // Get current product stock
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const productObjectId = new mongoose.Types.ObjectId(productId);
    const products = await Product.aggregate([
      { $match: { _id: productObjectId, sellerId: sellerObjectId } },
      { $limit: 1 }
    ]);
    
    const product = products[0];
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const previousStock = product.stockQuantity;
    const newStock = previousStock + change;

    // Validate new stock
    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Insufficient stock for this operation' },
        { status: 400 }
      );
    }

    // Create inventory log
    const log = new InventoryLog({
      productId,
      sellerId,
      change,
      reason,
      referenceId,
      previousStock,
      newStock,
      notes
    });

    await log.save();

    // Update product stock
    product.stockQuantity = newStock;
    await product.save();

    console.log('Inventory logged:', { productId, change, newStock });

    return NextResponse.json({
      message: 'Inventory updated successfully',
      log: {
        ...log.toObject(),
        productName: product.name,
        sku: product.sku
      }
    });

  } catch (error: any) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update inventory'
    }, { status: 500 });
  }
}
