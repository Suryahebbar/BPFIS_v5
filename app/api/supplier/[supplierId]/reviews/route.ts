import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Review } from '@/lib/models/supplier';
import { MarketplaceReview } from '@/lib/models/marketplace-review';
import { Product } from '@/lib/models/supplier';
import { requireAuth } from '@/lib/supplier-auth-middleware';

// GET /api/supplier/[supplierId]/reviews - Get supplier reviews
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    
    // Authenticate supplier
    const auth = await requireAuth(request, { params: resolvedParams });
    const sellerId = auth.sellerId;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sentiment = searchParams.get('sentiment');
    const flagged = searchParams.get('flagged') === 'true';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Get supplier's products to find farmer reviews
    const supplierProducts = await Product.find({ sellerId: sellerId as any }).select('_id').lean();
    const productIds = supplierProducts.map(p => p._id.toString());
    
    // Get both supplier reviews and farmer marketplace reviews
    const [supplierReviews, farmerReviews] = await Promise.all([
      // Get traditional supplier reviews
      Review.find({ sellerId: sellerId as any })
        .populate('productId', 'name sku')
        .populate('orderId', 'orderNumber')
        .sort({ createdAt: -1 })
        .lean(),
      
      // Get farmer marketplace reviews for supplier's products
      MarketplaceReview.find({ 
        productId: { $in: productIds },
        status: 'approved'
      })
        .sort({ createdAt: -1 })
        .lean()
    ]);
    
    // Combine and format reviews
    const allReviews = [
      ...supplierReviews.map(review => ({
        ...review,
        reviewType: 'supplier',
        customerName: review.customerName || 'Customer',
        rating: review.rating,
        title: review.title,
        body: (review as any).body || (review as any).comment,
        helpful: (review as any).helpful || 0,
        verified: (review as any).verified || false,
        sellerResponse: (review as any).sellerResponse,
        isFlagged: (review as any).isFlagged || false,
        sentiment: (review as any).sentiment || 'neutral'
      })),
      ...farmerReviews.map(review => ({
        ...review,
        reviewType: 'marketplace',
        customerName: (review as any).userName || 'Farmer',
        rating: review.rating,
        title: review.title,
        body: (review as any).comment,
        helpful: (review as any).helpful || 0,
        verified: (review as any).verified || false,
        sellerResponse: review.sellerResponse,
        isFlagged: false,
        sentiment: 'neutral'
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply filters
    let filteredReviews = allReviews;
    
    if (sentiment && sentiment !== 'all') {
      filteredReviews = filteredReviews.filter(review => review.sentiment === sentiment);
    }
    
    if (flagged) {
      filteredReviews = filteredReviews.filter(review => review.isFlagged);
    }
    
    if (search) {
      filteredReviews = filteredReviews.filter(review => 
        review.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        review.title?.toLowerCase().includes(search.toLowerCase()) ||
        review.body?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply pagination
    const paginatedReviews = filteredReviews.slice(skip, skip + limit);
    const totalCount = filteredReviews.length;
    
    // Get sentiment statistics for both review types
    const [supplierSentimentStats, farmerSentimentStats] = await Promise.all([
      Review.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: '$sentiment',
            count: { $sum: 1 }
          }
        }
      ]),
      MarketplaceReview.aggregate([
        { $match: { productId: { $in: productIds } } },
        {
          $group: {
            _id: 'neutral', // Farmer reviews don't have sentiment analysis yet
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    // Get flagged count (only supplier reviews can be flagged)
    const flaggedCount = await Review.countDocuments({ sellerId: sellerId as any, isFlagged: true });
    
    // Combine sentiment stats
    const combinedSentimentStats = [
      ...supplierSentimentStats,
      ...farmerSentimentStats
    ].reduce((acc, stat) => {
      acc[stat._id] = (acc[stat._id] || 0) + stat.count;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({ 
      reviews: paginatedReviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        sentiment: combinedSentimentStats,
        flagged: flaggedCount,
        totalReviews: totalCount,
        supplierReviews: supplierReviews.length,
        farmerReviews: farmerReviews.length
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
