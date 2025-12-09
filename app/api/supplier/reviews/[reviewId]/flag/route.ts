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

    const body = await request.json().catch(() => ({}));
    const flagged = typeof body.flagged === 'boolean' ? body.flagged : true;

    const sellerObjectId = new mongoose.Types.ObjectId(auth.sellerId);
    const reviewObjectId = new mongoose.Types.ObjectId(reviewId);

    const updatedReview = await Review.findOneAndUpdate(
      { _id: reviewObjectId, sellerId: sellerObjectId } as any,
      flagged
        ? {
            isFlagged: true,
            flagReason: body.reason || 'Flagged by seller',
            flaggedAt: new Date()
          }
        : {
            isFlagged: false,
            flagReason: undefined,
            flaggedAt: undefined
          },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: `Review ${flagged ? 'flagged' : 'unflagged'} successfully`,
      review: {
        id: updatedReview._id,
        isFlagged: updatedReview.isFlagged,
        flagReason: updatedReview.flagReason,
        flaggedAt: updatedReview.flaggedAt
      }
    });
  } catch (error) {
    console.error('Error flagging review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
