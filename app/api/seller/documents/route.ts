import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Seller } from '@/lib/models/supplier';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import { uploadFile } from '@/lib/cloudinary';

// POST /api/seller/documents - Upload seller verification documents
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate supplier via cookie-based auth
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const formData = await request.formData();

    // Max 5MB per document
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;

    const docKeys = [
      'businessCertificate',
      'tradeLicense',
      'ownerIdProof',
      'gstCertificate',
    ] as const;

    const documentsUpdate: Record<string, string> = {};

    for (const key of docKeys) {
      const file = formData.get(key);
      if (!file || !(file instanceof File)) continue;

      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `${key} must be smaller than 5MB` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadFile(buffer, 'seller-documents');

      if (!uploadResult.success || !uploadResult.data) {
        return NextResponse.json(
          { error: `Failed to upload ${key}` },
          { status: 500 }
        );
      }

      documentsUpdate[`documents.${key}`] = uploadResult.data.url;
    }

    if (Object.keys(documentsUpdate).length === 0) {
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      );
    }

    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      {
        $set: documentsUpdate,
        // Once documents are uploaded, move/keep account in pending review if not already verified
        verificationStatus: 'pending',
      },
      { new: true }
    ).select('-passwordHash -emailOtp -phoneOtp');

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Documents uploaded successfully',
      seller,
    });
  } catch (error: any) {
    console.error('Error uploading seller documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload documents' },
      { status: 500 }
    );
  }
}
