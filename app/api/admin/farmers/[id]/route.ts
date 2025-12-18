import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { Product, FarmerOrder } from '@/lib/models';
import FarmerSchemeProfile from '@/models/FarmerSchemeProfile';
import mongoose from 'mongoose';

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
    
    // Find farmer by ID
    const farmer = await User.findOne({ _id: id, role: 'farmer' })
      .select('-password -__v');

    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    // Fetch comprehensive farmer profile data
    const farmerObjectId = new mongoose.Types.ObjectId(id);
    
    // Get farmer's scheme profile with all detailed information
    const schemeProfile = await FarmerSchemeProfile.findOne({ 
      userId: farmerObjectId, 
      isActive: true 
    }).sort({ isDefault: -1 });

    // Get farmer's products
    const products = await Product.find({ farmerId: farmerObjectId })
      .select('name price stock category status createdAt updatedAt')
      .sort({ createdAt: -1 });

    // Get farmer's orders
    const orders = await FarmerOrder.find({ farmerId: farmerObjectId })
      .select('total status paymentStatus createdAt updatedAt items')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate statistics
    const totalProducts = await Product.countDocuments({ farmerId: farmerObjectId });
    const totalOrders = await FarmerOrder.countDocuments({ farmerId: farmerObjectId });
    const completedOrders = await FarmerOrder.countDocuments({ 
      farmerId: farmerObjectId, 
      status: 'completed' 
    });
    const pendingOrders = await FarmerOrder.countDocuments({ 
      farmerId: farmerObjectId, 
      status: 'pending' 
    });

    // Calculate total revenue from completed orders
    const revenueData = await FarmerOrder.aggregate([
      { $match: { farmerId: farmerObjectId, status: 'completed' } },
      { $unwind: '$items' },
      { $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }}
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Format products data
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    // Format orders data
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      }))
    }));

    // Enhanced farmer data with all related information
    const enhancedFarmer = {
      ...farmer.toObject(),
      // Basic farmer information
      basicInfo: {
        fullName: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        address: farmer.address,
        profilePicture: farmer.profilePicture,
        isVerified: farmer.isVerified,
        emailVerified: farmer.emailVerified,
        phoneVerified: farmer.phoneVerified,
        role: farmer.role,
        createdAt: farmer.createdAt,
        updatedAt: farmer.updatedAt
      },
      // Detailed scheme profile information
      profileData: schemeProfile ? {
        profileName: schemeProfile.profileName,
        scheme_name: schemeProfile.profileData?.scheme_name,
        official_link: schemeProfile.profileData?.official_link,
        land_size: schemeProfile.profileData?.land_size,
        farmer_category: schemeProfile.profileData?.farmer_category,
        location_state: schemeProfile.profileData?.location_state,
        location_district: schemeProfile.profileData?.location_district,
        location_taluk: schemeProfile.profileData?.location_taluk,
        village_rtc_data: schemeProfile.profileData?.village_rtc_data,
        crop_type: schemeProfile.profileData?.crop_type,
        season: schemeProfile.profileData?.season,
        irrigation_type: schemeProfile.profileData?.irrigation_type,
        water_source_capacity: schemeProfile.profileData?.water_source_capacity,
        organic_certification: schemeProfile.profileData?.organic_certification,
        farmer_age: schemeProfile.profileData?.farmer_age,
        gender: schemeProfile.profileData?.gender,
        income_catogory: schemeProfile.profileData?.income_catogory,
        pm_kisan_registration: schemeProfile.profileData?.pm_kisan_registration,
        equipment_ownership: schemeProfile.profileData?.equipment_ownership,
        fpo_membership: schemeProfile.profileData?.fpo_membership,
        insurance_status_pmfby: schemeProfile.profileData?.insurance_status_pmfby,
        disaster_affected_region: schemeProfile.profileData?.disaster_affected_region,
        soil_type: schemeProfile.profileData?.soil_type,
        isActive: schemeProfile.isActive,
        isDefault: schemeProfile.isDefault,
        createdAt: schemeProfile.createdAt,
        updatedAt: schemeProfile.updatedAt
      } : null,
      // Scheme search results
      schemeSearchResults: schemeProfile?.searchResults?.map(result => ({
        eligibleSchemes: result.eligibleSchemes,
        count: result.count,
        searchedAt: result.searchedAt
      })) || [],
      // Business statistics
      statistics: {
        totalProducts,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
        averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0
      },
      // Products and orders
      products: formattedProducts,
      orders: formattedOrders
    };

    return NextResponse.json({
      success: true,
      data: enhancedFarmer
    });
  } catch (error) {
    console.error('Error fetching farmer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farmer details' },
      { status: 500 }
    );
  }
}
