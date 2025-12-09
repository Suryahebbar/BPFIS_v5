import { NextRequest, NextResponse } from 'next/server';
import { Seller } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import { uploadFile } from '@/lib/cloudinary';

// GET /api/supplier/profile - Get supplier profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    // Get seller profile
    const seller = await Seller.findById(sellerId)
      .select('-passwordHash -otp -otpExpiry')
      .lean();

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json({ seller });

  } catch (error) {
    console.error('Error fetching seller profile:', error);
    if ((error as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT /api/supplier/profile - Update supplier profile
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    // Handle FormData (for avatar upload)
    const contentType = request.headers.get('content-type');
    let body: any;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Extract form fields
      body = {
        companyName: formData.get('companyName'),
        phone: formData.get('phone'),
        address: JSON.parse(formData.get('address') as string || '{}'),
        gstNumber: formData.get('gstNumber'),
        businessDetails: JSON.parse(formData.get('businessDetails') as string || '{}'),
      };
      
      // Handle avatar upload
      const avatarFile = formData.get('avatar') as File;
      if (avatarFile && avatarFile.size > 0) {
        const buffer = Buffer.from(await avatarFile.arrayBuffer());
        const uploadResult = await uploadFile(buffer, 'avatars');
        
        if (uploadResult.success && uploadResult.data) {
          body.avatarUrl = uploadResult.data.url;
        }
      }
      
    } else {
      // Handle regular JSON
      body = await request.json();
    }

    const {
      companyName,
      phone,
      address,
      gstNumber,
      avatarUrl,
      businessDetails,
    } = body;

    console.log('Supplier profile update payload:', {
      sellerId,
      companyName,
      phone,
      gstNumber,
      hasAddress: !!address,
      businessDetails,
    });

    // Find and update seller
    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      {
        ...(companyName && { companyName }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(gstNumber && { gstNumber }),
        ...(avatarUrl && { avatarUrl }),
        ...(businessDetails && { businessDetails }),
      },
      { new: true, runValidators: true }
    ).select('-passwordHash -otp -otpExpiry');

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    console.log('Seller profile updated:', {
      sellerId,
      companyName: seller.companyName,
      businessDetails: seller.businessDetails,
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      seller
    });

  } catch (error: any) {
    console.error('Error updating seller profile:', error);
    if ((error as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ 
      error: error.message || 'Failed to update profile'
    }, { status: 500 });
  }
}
