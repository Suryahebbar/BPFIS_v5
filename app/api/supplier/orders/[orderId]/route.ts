import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Order } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';

const { ObjectId } = mongoose.Types;

function toObjectId(id: string) {
  return new ObjectId(id);
}

function isValidObjectId(id: string) {
  return ObjectId.isValid(id);
}

// GET /api/supplier/orders/[orderId] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();
    const auth = await requireAuth(request);
    const { orderId } = await params;

    if (!isValidObjectId(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const sellerObjectId = toObjectId(auth.sellerId);
    const orderObjectId = toObjectId(orderId);

    const order = await Order.findOne({
      _id: orderObjectId,
      sellerId: sellerObjectId
    } as any)
      .populate('items.productId', 'name sku images price')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/supplier/orders/[orderId] - Update order status/details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();
    const auth = await requireAuth(request);
    const { orderId } = await params;

    if (!isValidObjectId(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const sellerObjectId = toObjectId(auth.sellerId);
    const orderObjectId = toObjectId(orderId);
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.orderStatus) {
      updateData.orderStatus = body.orderStatus;
    }

    if (body.paymentStatus) {
      updateData.paymentStatus = body.paymentStatus;
    }

    if (body.shippingDetails) {
      updateData.shippingDetails = body.shippingDetails;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderObjectId, sellerId: sellerObjectId } as any,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
