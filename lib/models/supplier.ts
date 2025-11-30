import { Schema, model, Document } from 'mongoose';

// Seller Document Schema
export interface ISeller extends Document {
  companyName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  gstNumber?: string;
  avatarUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents: {
    businessCertificate?: string;
    tradeLicense?: string;
    ownerIdProof?: string;
    gstCertificate?: string;
  };
  isActive: boolean;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new Schema<ISeller>({
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  gstNumber: { type: String },
  avatarUrl: { type: String },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  documents: {
    businessCertificate: { type: String },
    tradeLicense: { type: String },
    ownerIdProof: { type: String },
    gstCertificate: { type: String }
  },
  isActive: { type: Boolean, default: true },
  otp: { type: String },
  otpExpiry: { type: Date }
}, {
  timestamps: true
});

// Product Document Schema
export interface IProduct extends Document {
  sellerId: Schema.Types.ObjectId;
  name: string;
  sku: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'equipment' | 'feed' | 'other';
  description: string;
  price: number;
  stockQuantity: number;
  reorderThreshold: number;
  images: {
    url: string;
    alt: string;
    position: number;
  }[];
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  specifications?: {
    [key: string]: string | number;
  };
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    unit?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['seeds', 'fertilizers', 'pesticides', 'tools', 'equipment', 'feed', 'other'], 
    required: true 
  },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stockQuantity: { type: Number, required: true, default: 0, min: 0 },
  reorderThreshold: { type: Number, required: true, default: 5, min: 0 },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, required: true },
    position: { type: Number, required: true }
  }],
  tags: [{ type: String }],
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'draft'], 
    default: 'draft' 
  },
  specifications: { type: Schema.Types.Mixed },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    unit: { type: String, default: 'cm' }
  }
}, {
  timestamps: true
});

// Inventory Log Document Schema
export interface IInventoryLog extends Document {
  productId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  change: number; // Positive for addition, negative for deduction
  reason: 'manual' | 'sale' | 'return' | 'restock' | 'adjustment';
  referenceId?: string; // Order ID, etc.
  previousStock: number;
  newStock: number;
  notes?: string;
  createdAt: Date;
}

const InventoryLogSchema = new Schema<IInventoryLog>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  change: { type: Number, required: true },
  reason: { 
    type: String, 
    enum: ['manual', 'sale', 'return', 'restock', 'adjustment'], 
    required: true 
  },
  referenceId: { type: String },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  notes: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Order Document Schema
export interface IOrder extends Document {
  orderNumber: string;
  sellerId: Schema.Types.ObjectId;
  customer: {
    name: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  items: {
    productId: Schema.Types.ObjectId;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'new' | 'processing' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  shippingDetails?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' }
    }
  },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  orderStatus: { 
    type: String, 
    enum: ['new', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'], 
    default: 'new' 
  },
  shippingDetails: {
    trackingNumber: { type: String },
    carrier: { type: String },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date }
  },
  notes: { type: String }
}, {
  timestamps: true
});

// Review Document Schema
export interface IReview extends Document {
  productId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  orderId?: Schema.Types.ObjectId;
  customerName: string;
  rating: number; // 1-5
  title: string;
  body: string;
  sentiment: 'good' | 'moderate' | 'poor';
  isFlagged: boolean;
  flagReason?: string;
  sellerResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  body: { type: String, required: true },
  sentiment: { 
    type: String, 
    enum: ['good', 'moderate', 'poor'], 
    required: true 
  },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  sellerResponse: { type: String }
}, {
  timestamps: true
});

// Daily Analytics Aggregates Schema
export interface IDailyAnalytics extends Document {
  sellerId: Schema.Types.ObjectId;
  date: Date;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  bestSellers: {
    productId: Schema.Types.ObjectId;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  categories: {
    seeds: { revenue: number; orders: number };
    fertilizers: { revenue: number; orders: number };
    pesticides: { revenue: number; orders: number };
    tools: { revenue: number; orders: number };
    equipment: { revenue: number; orders: number };
    feed: { revenue: number; orders: number };
    other: { revenue: number; orders: number };
  };
  createdAt: Date;
}

const DailyAnalyticsSchema = new Schema<IDailyAnalytics>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  date: { type: Date, required: true },
  revenue: { type: Number, required: true, default: 0 },
  orders: { type: Number, required: true, default: 0 },
  avgOrderValue: { type: Number, required: true, default: 0 },
  bestSellers: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    revenue: { type: Number, required: true }
  }],
  categories: {
    seeds: { revenue: { type: Number, default: 0 }, orders: { type: Number, default: 0 } },
    fertilizers: { revenue: { type: Number, default: 0 }, orders: { type: Number, default: 0 } },
    pesticides: { revenue: { type: Number, default: 0 }, orders: { type: Number, default: 0 } },
    tools: { revenue: { type: Number, default: 0 }, orders: { type: Number, default: 0 } },
    equipment: { revenue: { type: Number, default: 0 }, orders: { type: Number, default: 0 } },
    feed: { revenue: { type: Number, default: 0 }, orders: { type: Number, default: 0 } },
    other: { revenue: { type: Number, default: 0 }, orders: { type: Number, default: 0 } }
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Create indexes for better performance
SellerSchema.index({ email: 1 });
SellerSchema.index({ verificationStatus: 1 });

ProductSchema.index({ sellerId: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

InventoryLogSchema.index({ productId: 1, createdAt: -1 });
InventoryLogSchema.index({ sellerId: 1, createdAt: -1 });

OrderSchema.index({ sellerId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ orderNumber: 1 });

ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ sellerId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ isFlagged: 1 });

DailyAnalyticsSchema.index({ sellerId: 1, date: -1 });
DailyAnalyticsSchema.index({ date: -1 });

// Export models
export const Seller = model<ISeller>('Seller', SellerSchema);
export const Product = model<IProduct>('Product', ProductSchema);
export const InventoryLog = model<IInventoryLog>('InventoryLog', InventoryLogSchema);
export const Order = model<IOrder>('Order', OrderSchema);
export const Review = model<IReview>('Review', ReviewSchema);
export const DailyAnalytics = model<IDailyAnalytics>('DailyAnalytics', DailyAnalyticsSchema);
