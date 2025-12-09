import { NextRequest, NextResponse } from 'next/server';
import { Review } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import mongoose from 'mongoose';

// GET /api/supplier/reviews - Get supplier's reviews
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const { searchParams } = new URL(request.url);
    const sentiment = searchParams.get('sentiment') || '';
    const flagged = searchParams.get('flagged') || '';
    const search = searchParams.get('search') || '';
    const rating = searchParams.get('rating') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const match: Record<string, unknown> = { sellerId: sellerObjectId };

    if (sentiment) {
      match.sentiment = sentiment;
    }

    if (flagged === 'true') {
      match.isFlagged = true;
    } else if (flagged === 'false') {
      match.isFlagged = false;
    }

    if (rating) {
      match.rating = parseInt(rating, 10);
    }

    if (search) {
      match.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      Review.aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'supplierproducts',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $addFields: {
            productData: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $project: {
            _id: 1,
            productId: { $toString: '$productId' },
            productName: {
              $ifNull: ['$productData.name', '$productName']
            },
            customerName: 1,
            rating: 1,
            title: 1,
            body: 1,
            sentiment: 1,
            isFlagged: 1,
            flagReason: 1,
            sellerResponse: 1,
            createdAt: 1
          }
        }
      ]),
      Review.countDocuments(match)
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/supplier/reviews - Respond to a review
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const body = await request.json();
    const { reviewId, sellerResponse } = body;

    if (!reviewId || !sellerResponse) {
      return NextResponse.json(
        { error: 'Review ID and response are required' },
        { status: 400 }
      );
    }

    // Find and update the review
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const reviewObjectId = new mongoose.Types.ObjectId(reviewId);
    const reviews = await Review.aggregate([
      { $match: { _id: reviewObjectId, sellerId: sellerObjectId } },
      { $limit: 1 }
    ]);
    
    const review = reviews[0];
    
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    review.sellerResponse = sellerResponse;
    await review.save();

    console.log('Review response added:', { reviewId });

    return NextResponse.json({
      message: 'Response added successfully',
      review
    });

  } catch (error: any) {
    console.error('Error responding to review:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to respond to review'
    }, { status: 500 });
  }
}
