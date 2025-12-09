import { NextRequest, NextResponse } from 'next/server';
import { Seller } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/supplier-auth-middleware';

// GET /api/supplier/settings - Get supplier settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    // Get seller with settings
    const seller = await Seller.findById(sellerId)
      .select('email phone settings')
      .lean();

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const defaults = {
      emailNotifications: true,
      smsNotifications: false,
      orderNotifications: true,
      lowStockAlerts: true,
      reviewNotifications: true,
      marketingEmails: false,
      autoConfirmOrders: false,
      defaultShippingMethod: 'standard',
      returnPolicy: '30-days',
      taxInclusive: true,
      taxRate: 0.18,
      twoFactorAuth: false,
      sessionTimeout: '24h',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      language: 'en',
    };

    const storedSettings = (seller as any).settings || {};

    return NextResponse.json({ 
      settings: {
        ...defaults,
        ...storedSettings,
      }
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/supplier/settings - Update supplier settings
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const body = await request.json();

    // Load existing seller and settings
    const seller = await Seller.findById(sellerId).select('settings');

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const defaults = {
      emailNotifications: true,
      smsNotifications: false,
      orderNotifications: true,
      lowStockAlerts: true,
      reviewNotifications: true,
      marketingEmails: false,
      autoConfirmOrders: false,
      defaultShippingMethod: 'standard',
      returnPolicy: '30-days',
      taxInclusive: true,
      taxRate: 0.18,
      twoFactorAuth: false,
      sessionTimeout: '24h',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      language: 'en',
    };

    const currentSettings = (seller as any).settings || {};

    // Merge defaults + existing + incoming body; ignore undefined fields from body
    const mergedSettings = {
      ...defaults,
      ...currentSettings,
      ...Object.fromEntries(
        Object.entries(body).filter(([, value]) => value !== undefined)
      ),
    };

    (seller as any).settings = mergedSettings;

    await seller.save();

    console.log('Seller settings updated:', { sellerId });

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: mergedSettings,
    });

  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update settings'
    }, { status: 500 });
  }
}
