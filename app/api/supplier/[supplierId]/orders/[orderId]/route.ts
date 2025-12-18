import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models/supplier';
import { FarmerOrder } from '@/lib/models/FarmerOrder';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string; orderId: string }> }
) {
  try {
    await connectDB();
    
    const { supplierId, orderId } = await params;
    
    // Authenticate supplier and validate supplierId
    const auth = await requireAuth(request, { params: { supplierId } });
    const sellerId = auth.sellerId;
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // Try to find in supplier orders first
    let order = await Order.findOne({ _id: orderId, sellerId: sellerObjectId as any })
      .populate('items.productId', 'name sku images price')
      .lean();

    // If not found in supplier orders, check farmer orders
    if (!order) {
      const farmerOrder = await FarmerOrder.findById(orderId).lean();
      
      if (farmerOrder) {
        // Check if this farmer order contains items from this supplier
        const supplierItems = farmerOrder.items.filter((item: any) => 
          item.sellerId?.toString() === sellerId || 
          item.sellerId?.toString() === sellerObjectId.toString()
        );
        
        if (supplierItems.length > 0) {
          // Format farmer order to match supplier order structure
          const statusMap: Record<string, string> = {
            'confirmed': 'new',
            'processing': 'processing',
            'shipped': 'shipped',
            'delivered': 'delivered',
            'cancelled': 'cancelled'
          };
          
          order = {
            _id: farmerOrder._id,
            orderNumber: farmerOrder.orderNumber,
            customer: {
              name: farmerOrder.shipping?.name || 'Customer',
              phone: farmerOrder.shipping?.phone || '',
              address: {
                street: farmerOrder.shipping?.address || '',
                city: farmerOrder.shipping?.city || '',
                state: farmerOrder.shipping?.state || '',
                pincode: farmerOrder.shipping?.pincode || '',
                country: 'India'
              }
            },
            items: supplierItems as any,
            totalAmount: supplierItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
            orderStatus: (statusMap[farmerOrder.status] || farmerOrder.status) as any,
            paymentStatus: farmerOrder.paymentStatus || 'pending',
            createdAt: farmerOrder.createdAt,
            updatedAt: farmerOrder.updatedAt
          } as any;
        }
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string; orderId: string }> }
) {
  try {
    await connectDB();
    
    const { supplierId, orderId } = await params;
    
    // Authenticate supplier and validate supplierId
    const auth = await requireAuth(request, { params: { supplierId } });
    const sellerId = auth.sellerId;
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const body = await request.json();
    
    // Try to update supplier order first
    let order = await Order.findOne({ _id: orderId, sellerId: sellerObjectId as any });
    
    if (order) {
      // Update supplier order
      order = await Order.findOneAndUpdate(
        { _id: orderId, sellerId: sellerObjectId as any },
        { 
          ...body,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).populate('items.productId', 'name sku images price');
      
      return NextResponse.json({ order });
    }
    
    // If not a supplier order, try to update farmer order
    const farmerOrder = await FarmerOrder.findById(orderId);
    
    if (farmerOrder) {
      // Check if this farmer order contains items from this supplier
      const supplierItems = farmerOrder.items.filter((item: any) => 
        item.sellerId?.toString() === sellerId || 
        item.sellerId?.toString() === sellerObjectId.toString()
      );
      
      if (supplierItems.length === 0) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      
      // Map supplier order status to farmer order status
      const statusMap: Record<string, string> = {
        'new': 'confirmed',
        'processing': 'processing',
        'shipped': 'shipped',
        'delivered': 'delivered',
        'cancelled': 'cancelled'
      };
      
      // Update farmer order status
      const updateData: any = {
        updatedAt: new Date()
      };
      
      if (body.orderStatus) {
        updateData.status = statusMap[body.orderStatus] || body.orderStatus;
        
        // Add to status history
        updateData.$push = {
          statusHistory: {
            status: updateData.status,
            timestamp: new Date(),
            note: `Status updated by supplier: ${body.orderStatus}`
          }
        };
        
        // Update tracking details if status is shipped
        if (body.orderStatus === 'shipped') {
          updateData.tracking = {
            ...farmerOrder.tracking,
            shippedAt: new Date(),
            carrier: body.shippingDetails?.carrier || farmerOrder.tracking?.carrier,
            trackingNumber: body.shippingDetails?.trackingNumber || farmerOrder.tracking?.trackingNumber
          };
        }
        
        // Update tracking details if status is delivered
        if (body.orderStatus === 'delivered') {
          updateData.tracking = {
            ...farmerOrder.tracking,
            deliveredAt: new Date()
          };
        }
      }
      
      if (body.paymentStatus) {
        updateData.paymentStatus = body.paymentStatus;
      }
      
      const updatedFarmerOrder = await FarmerOrder.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true }
      );
      
      // Format response to match supplier order structure
      const statusMapReverse: Record<string, string> = {
        'confirmed': 'new',
        'processing': 'processing',
        'shipped': 'shipped',
        'delivered': 'delivered',
        'cancelled': 'cancelled'
      };
      
      const formattedOrder = {
        _id: updatedFarmerOrder!._id,
        orderNumber: updatedFarmerOrder!.orderNumber,
        customer: {
          name: updatedFarmerOrder!.shipping?.name || 'Customer',
          phone: updatedFarmerOrder!.shipping?.phone || '',
          address: {
            street: updatedFarmerOrder!.shipping?.address || '',
            city: updatedFarmerOrder!.shipping?.city || '',
            state: updatedFarmerOrder!.shipping?.state || '',
            pincode: updatedFarmerOrder!.shipping?.pincode || '',
            country: 'India'
          }
        },
        items: supplierItems as any,
        totalAmount: supplierItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        orderStatus: (statusMapReverse[updatedFarmerOrder!.status] || updatedFarmerOrder!.status) as any,
        paymentStatus: updatedFarmerOrder!.paymentStatus || 'pending',
        createdAt: updatedFarmerOrder!.createdAt,
        updatedAt: updatedFarmerOrder!.updatedAt,
        source: 'farmer' as any
      };
      
      return NextResponse.json({ order: formattedOrder });
    }
    
    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string; orderId: string }> }
) {
  try {
    await connectDB();
    
    const { supplierId, orderId } = await params;
    
    // Authenticate supplier and validate supplierId
    const auth = await requireAuth(request, { params: { supplierId } });
    const sellerId = auth.sellerId;
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // Find and delete order
    const order = await Order.findOneAndDelete({ _id: orderId, sellerId: sellerObjectId as any });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
