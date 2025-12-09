import { NextRequest, NextResponse } from 'next/server';
import { Review } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    const { reviewId } = await params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    const body = await request.json();
    const { response } = body;

    if (!response || typeof response !== 'string' || response.trim().length === 0) {
      return NextResponse.json({ error: 'Response text is required' }, { status: 400 });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(auth.sellerId);
    const reviewObjectId = new mongoose.Types.ObjectId(reviewId);

    const updatedReview = await Review.findOneAndUpdate(
      { _id: reviewObjectId, sellerId: sellerObjectId } as any,
      {
        sellerResponse: {
          response: response.trim(),
          respondedBy: auth.email,
          respondedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Review response submitted successfully',
      review: {
        id: updatedReview._id,
        sellerResponse: updatedReview.sellerResponse
      }
    });
  } catch (error) {
    console.error('Error responding to review:', error);
    return NextResponse.json({ error: 'Failed to respond to review' }, { status: 500 });
  }
}
