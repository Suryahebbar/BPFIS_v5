import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { connectDB } from '@/lib/db';
import { Seller } from '@/lib/models/supplier';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify admin token
    const token = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('admin-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const supplier = await Seller.findById(id);
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        documents: supplier.documents || {},
        verificationStatus: supplier.verificationStatus
      }
    });

  } catch (error) {
    console.error('Error fetching supplier documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier documents' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { documentType, status, rejectionReason } = body;
    
    // Verify admin token
    const token = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('admin-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const supplier = await Seller.findById(id);
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Initialize documents object if it doesn't exist
    if (!supplier.documents) {
      supplier.documents = {};
    }

    // Update specific document status
    (supplier.documents as any)[documentType] = {
      ...(supplier.documents as any)[documentType],
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      verifiedAt: status === 'verified' ? new Date() : undefined,
      verifiedBy: status === 'verified' ? 'admin' : undefined
    };

    // Check if all documents are verified to update supplier status
    const allDocumentsVerified = Object.keys(supplier.documents).every(key => 
      (supplier.documents as any)[key]?.status === 'verified'
    );

    if (allDocumentsVerified) {
      supplier.verificationStatus = 'verified';
    } else if (status === 'rejected') {
      supplier.verificationStatus = 'rejected';
    } else {
      supplier.verificationStatus = 'pending';
    }

    await supplier.save();

    return NextResponse.json({
      success: true,
      message: `Document ${documentType} ${status} successfully`,
      data: {
        documents: supplier.documents,
        verificationStatus: supplier.verificationStatus
      }
    });

  } catch (error) {
    console.error('Error updating document status:', error);
    return NextResponse.json(
      { error: 'Failed to update document status' },
      { status: 500 }
    );
  }
}
