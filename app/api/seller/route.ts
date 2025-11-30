import { NextResponse } from 'next/server';
import { Seller } from '@/lib/models/seller';
import { connectDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/supplier - Get current supplier profile
export async function GET(request: Request) {
  try {
    await connectDB();
    
    // Get seller ID from session/auth (simplified for now)
    const sellerId = request.headers.get('x-seller-id');
    if (!sellerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const seller = await Seller.findById(sellerId).select('-passwordHash');
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json({ seller });
  } catch (error) {
    console.error('Error fetching seller:', error);
    return NextResponse.json({ error: 'Failed to fetch seller' }, { status: 500 });
  }
}

// POST /api/supplier - Create new seller account
export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { companyName, email, phone, password, address, gstNumber } = body;

    // Validate required fields
    if (!companyName || !email || !phone || !password || !address) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyName, email, phone, password, address' 
      }, { status: 400 });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return NextResponse.json({ error: 'Seller with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new seller
    const seller = new Seller({
      companyName,
      email,
      phone,
      password: hashedPassword,
      address,
      gstNumber,
      verificationStatus: 'pending'
    });

    await seller.save();

    // Remove password from response
    const sellerResponse = seller.toObject();
    delete sellerResponse.password;

    return NextResponse.json({ 
      message: 'Seller account created successfully',
      seller: sellerResponse
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating seller:', error);
    return NextResponse.json({ error: 'Failed to create seller account' }, { status: 500 });
  }
}

// PUT /api/supplier - Update seller profile
export async function PUT(request: Request) {
  try {
    await connectDB();
    
    // Get seller ID from session/auth
    const sellerId = request.headers.get('x-seller-id');
    if (!sellerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, phone, address, gstNumber } = body;

    // Find and update seller
    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      {
        ...(companyName && { companyName }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(gstNumber !== undefined && { gstNumber })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      seller
    });
  } catch (error) {
    console.error('Error updating seller:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
