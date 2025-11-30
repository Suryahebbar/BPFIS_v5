import { NextRequest, NextResponse } from 'next/server';
import { Seller } from '@/lib/models/seller';
import { connectDB } from '@/lib/db';

// Helper function to get seller ID from request headers
function getSellerId(request: NextRequest): string | null {
  return request.headers.get('x-seller-id') || null;
}

// GET /api/seller - Get seller profile
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

    console.log('📋 Fetching seller profile:', { sellerId });

    const seller = await Seller.findById(sellerId)
      .select('-passwordHash -emailOtp -phoneOtp')
      .lean();

    if (!seller) {
      console.log('❌ Seller not found:', { sellerId });
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    console.log('✅ Seller profile fetched:', { id: seller._id, companyName: seller.companyName });

    return NextResponse.json({
      success: true,
      seller
    });

  } catch (error) {
    console.error('❌ Error fetching seller profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/seller - Update seller profile
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
    console.log('📝 Updating seller profile:', { sellerId, updates: Object.keys(body) });

    // Find seller
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      console.log('❌ Seller not found:', { sellerId });
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = [
      'companyName',
      'email',
      'phone',
      'address',
      'gstNumber',
      'avatarUrl'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        seller[field] = body[field];
      }
    }

    await seller.save();

    console.log('✅ Seller profile updated:', { id: seller._id, companyName: seller.companyName });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      seller: {
        id: seller._id,
        companyName: seller.companyName,
        email: seller.email,
        phone: seller.phone,
        address: seller.address,
        gstNumber: seller.gstNumber,
        avatarUrl: seller.avatarUrl,
        verificationStatus: seller.verificationStatus
      }
    });

  } catch (error) {
    console.error('❌ Error updating seller profile:', error);
    
    // Handle duplicate key errors
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      const field = Object.keys((error as any).keyValue)[0];
      return NextResponse.json(
        { error: `A seller with this ${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/seller - Delete seller account
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const sellerId = getSellerId(request);
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 401 }
      );
    }

    console.log('🗑️ Deleting seller account:', { sellerId });

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      console.log('❌ Seller not found:', { sellerId });
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Soft delete by deactivating account
    seller.isActive = false;
    await seller.save();

    console.log('✅ Seller account deactivated:', { id: seller._id });

    return NextResponse.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting seller account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
