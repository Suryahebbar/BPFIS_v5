import { NextRequest, NextResponse } from 'next/server';
import { Product as SupplierProduct } from '@/lib/models/supplier';
import { Seller } from '@/lib/models/seller';
import { connectDB } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '0';
    const maxPrice = searchParams.get('maxPrice') || '10000';
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    await connectDB();

    // Build query
    const query: any = { status: 'active' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    query.price = {
      $gte: parseFloat(minPrice),
      $lte: parseFloat(maxPrice)
    };

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { featured: -1, createdAt: -1 };
    }

    // Fetch products with seller information
    const products = await SupplierProduct.find(query)
      .populate('sellerId', 'companyName')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Format products for marketplace
    const formattedProducts = products.map((product: any) => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: Array.isArray(product.images) ? product.images.map((img: any) => ({
        url: img.url || '',
        alt: img.alt || product.name
      })) : [],
      category: product.category,
      seller: {
        _id: product.sellerId?._id || product.sellerId,
        companyName: (product.sellerId as any)?.companyName || 'Unknown Seller'
      },
      stock: product.stockQuantity || 0,
      rating: 0, // Not available in the supplier model
      reviews: 0, // Not available in the supplier model
      createdAt: product.createdAt,
      tags: Array.isArray(product.tags) ? product.tags : [],
      status: product.status || 'draft'
    }));

    const total = await SupplierProduct.countDocuments(query);

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
