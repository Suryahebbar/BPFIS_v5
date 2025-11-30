import { NextRequest, NextResponse } from 'next/server';
import { Seller } from '@/lib/models/seller';
import { connectDB } from '@/lib/db';

// Helper function to get seller ID from request headers
function getSellerId(request: NextRequest): string | null {
  return request.headers.get('x-seller-id') || null;
}

// GET /api/seller/settings - Get seller settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const sellerId = getSellerId(request);
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 401 }
      );
    }

    console.log('⚙️ Fetching seller settings:', { sellerId });

    const seller = await Seller.findById(sellerId)
      .select('settings')
      .lean();

    if (!seller) {
      console.log('❌ Seller not found:', { sellerId });
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    console.log('✅ Seller settings fetched:', { sellerId });

    return NextResponse.json({
      success: true,
      settings: seller.settings
    });

  } catch (error) {
    console.error('❌ Error fetching seller settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/seller/settings - Update seller settings
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const sellerId = getSellerId(request);
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('⚙️ Updating seller settings:', { sellerId, updates: Object.keys(body) });

    // Find seller
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      console.log('❌ Seller not found:', { sellerId });
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Update settings
    if (body.settings) {
      seller.settings = {
        ...seller.settings,
        ...body.settings
      };
    }

    await seller.save();

    console.log('✅ Seller settings updated:', { sellerId });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully!',
      settings: seller.settings
    });

  } catch (error) {
    console.error('❌ Error updating seller settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
