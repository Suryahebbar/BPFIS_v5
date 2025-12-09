import { NextRequest, NextResponse } from 'next/server';
import { Product, Seller } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import { uploadFile } from '@/lib/cloudinary';
import mongoose from 'mongoose';

// GET /api/supplier/products - Get seller's products
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    // Build query
    const query: Record<string, unknown> = { sellerId };
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get products with pagination
    const skip = (page - 1) * limit;
    
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name sku price stockQuantity status category images specifications dimensions tags createdAt')
        .lean(),
      Product.countDocuments(query)
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/supplier/products - Create new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    // Handle FormData (for file uploads)
    const contentType = request.headers.get('content-type');
    let body: any;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData with file uploads
      const formData = await request.formData();
      
      // Extract form fields
      body = {
        name: formData.get('name'),
        sku: formData.get('sku'),
        description: formData.get('description'),
        category: formData.get('category'),
        price: formData.get('price'),
        stockQuantity: formData.get('stockQuantity'),
        reorderThreshold: formData.get('reorderThreshold'),
        tags: JSON.parse(formData.get('tags') as string || '[]'),
        dimensions: JSON.parse(formData.get('dimensions') as string || '{}'),
        specifications: JSON.parse(formData.get('specifications') as string || '{}')
      };
      
      // Handle image files
      const imageFiles = formData.getAll('images') as File[];
      const uploadedImages = [];
      
      for (const imageFile of imageFiles) {
        if (imageFile.size > 0) {
          const buffer = Buffer.from(await imageFile.arrayBuffer());
          const uploadResult = await uploadFile(buffer, 'products');
          
          if (uploadResult.success && uploadResult.data) {
            uploadedImages.push({
              url: uploadResult.data.url,
              alt: imageFile.name,
              position: uploadedImages.length
            });
          }
        }
      }
      
      body.images = uploadedImages;
      
    } else {
      // Handle regular JSON (no file uploads)
      body = await request.json();
    }

    const {
      name,
      sku,
      description,
      category,
      tags,
      price,
      stockQuantity,
      reorderThreshold,
      dimensions,
      specifications,
      images
    } = body;

    // Validate required fields
    if (!name || !sku || !description || !category || !price || stockQuantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, description, category, price, stockQuantity' },
        { status: 400 }
      );
    }

    // Check if SKU already exists for this seller
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const existingProducts = await Product.aggregate([
      { $match: { sku, sellerId: sellerObjectId } },
      { $limit: 1 }
    ]);
    
    if (existingProducts.length > 0) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }

    // Create new product
    const product = new Product({
      sellerId,
      name,
      sku,
      description,
      category: category as any,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity),
      reorderThreshold: parseInt(reorderThreshold) || 5,
      tags: tags || [],
      dimensions: dimensions || {},
      specifications: specifications || {},
      images: images || [],
      status: 'draft'
    });

    await product.save();

    console.log('Product created:', { id: product._id, sku, name });

    return NextResponse.json({
      message: 'Product created successfully',
      product
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { error: `A product with this ${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
