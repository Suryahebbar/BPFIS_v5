import { NextRequest, NextResponse } from 'next/server';
import { Order, Seller } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';

// GET /api/supplier/orders - Get seller's orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = { sellerId };

    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Get orders with pagination
    const skip = (page - 1) * limit;
    
    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.productId', 'name sku images')
        .lean(),
      Order.countDocuments(query)
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/supplier/orders - Create new order (for manual order creation)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const body = await request.json();
    const {
      customer,
      items,
      notes,
      shippingDetails
    } = body;

    // Validate required fields
    if (!customer || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer and items are required' },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Read seller settings to determine initial order status
    const seller = await Seller.findById(sellerId).select('settings');
    const autoConfirm = (seller as any)?.settings?.autoConfirmOrders === true;

    // Create new order
    const order = new Order({
      orderNumber,
      sellerId,
      customer,
      items: items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: autoConfirm ? 'processing' : 'new',
      shippingDetails,
      notes
    });

    await order.save();

    console.log('Order created:', { id: order._id, orderNumber });

    return NextResponse.json({
      message: 'Order created successfully',
      order
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
