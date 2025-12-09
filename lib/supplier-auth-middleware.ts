import { NextRequest } from 'next/server';
import { Seller } from '@/lib/models/supplier';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import { AUTH_COOKIE_NAME, getUserFromRequest, verifyAuthToken } from '@/lib/auth';

export interface AuthenticatedSeller {
  sellerId: string;
  email: string;
  companyName: string;
  verificationStatus: string;
}

async function findActiveSellerByIdOrEmail(id?: string | null, email?: string | null) {
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    const sellerById = await Seller.findById(id);
    if (sellerById && sellerById.isActive) {
      return sellerById;
    }
  }

  if (email) {
    const sellerByEmail = await Seller.findOne({ email: email.trim().toLowerCase() });
    if (sellerByEmail && sellerByEmail.isActive) {
      return sellerByEmail;
    }
  }

  return null;
}

export async function authenticateSupplier(request: NextRequest): Promise<AuthenticatedSeller | null> {
  try {
    await connectDB();

    const debug = process.env.NODE_ENV !== 'production';
    const context = request.nextUrl?.pathname ?? 'unknown';

    // Prefer cookie-based auth (shared with farmer flow)
    const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (cookieToken) {
      const payload = await verifyAuthToken(cookieToken);
      if (debug) {
        console.debug('[SupplierAuth] Cookie payload', {
          context,
          hasPayload: !!payload,
          role: payload?.role,
          sub: payload?.sub
        });
      }
      if (payload && payload.role === 'supplier') {
        const seller = await findActiveSellerByIdOrEmail(payload.sub, payload.email);
        if (debug) {
          console.debug('[SupplierAuth] Cookie seller lookup', {
            context,
            found: !!seller,
            by: seller ? 'cookieToken' : 'cookieToken-miss'
          });
        }
        if (seller) {
          return {
            sellerId: seller._id.toString(),
            email: seller.email,
            companyName: seller.companyName,
            verificationStatus: seller.verificationStatus
          };
        }
      }
    }

    const cookiePayload = await getUserFromRequest(request);
    if (debug) {
      console.debug('[SupplierAuth] Header cookie payload', {
        context,
        hasPayload: !!cookiePayload,
        role: cookiePayload?.role,
        sub: cookiePayload?.sub
      });
    }
    if (cookiePayload && cookiePayload.role === 'supplier') {
      const seller = await findActiveSellerByIdOrEmail(cookiePayload.sub, cookiePayload.email);
      if (debug) {
        console.debug('[SupplierAuth] Header cookie seller lookup', {
          context,
          found: !!seller,
          by: seller ? 'cookieHeader' : 'cookieHeader-miss'
        });
      }
      if (seller) {
        return {
          sellerId: seller._id.toString(),
          email: seller.email,
          companyName: seller.companyName,
          verificationStatus: seller.verificationStatus
        };
      }
    }

    // Fallback to Authorization header for backwards compatibility
    const authHeader = request.headers.get('authorization');
    if (debug) {
      console.debug('[SupplierAuth] Authorization header present', {
        context,
        hasAuthHeader: !!authHeader
      });
    }
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        const payload = await verifyAuthToken(token);
        if (debug) {
          console.debug('[SupplierAuth] Bearer payload', {
            context,
            hasPayload: !!payload,
            role: payload?.role,
            sub: payload?.sub
          });
        }
        if (payload && payload.role === 'supplier') {
          const seller = await findActiveSellerByIdOrEmail(payload.sub, payload.email);
          if (debug) {
            console.debug('[SupplierAuth] Bearer seller lookup', {
              context,
              found: !!seller,
              by: seller ? 'bearer' : 'bearer-miss'
            });
          }
          if (seller) {
            return {
              sellerId: seller._id.toString(),
              email: seller.email,
              companyName: seller.companyName,
              verificationStatus: seller.verificationStatus
            };
          }
        }
      }
    }

    // Development fallback: allow explicit seller ID header
    const sellerIdHeader = request.headers.get('x-seller-id');
    if (debug) {
      console.debug('[SupplierAuth] x-seller-id header', {
        context,
        hasSellerIdHeader: !!sellerIdHeader
      });
    }
    if (sellerIdHeader && mongoose.Types.ObjectId.isValid(sellerIdHeader)) {
      const seller = await Seller.findById(sellerIdHeader);
      if (debug) {
        console.debug('[SupplierAuth] x-seller-id lookup', {
          context,
          found: !!seller
        });
      }
      if (seller && seller.isActive) {
        return {
          sellerId: seller._id.toString(),
          email: seller.email,
          companyName: seller.companyName,
          verificationStatus: seller.verificationStatus
        };
      }
      return null;
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedSeller> {
  const auth = await authenticateSupplier(request);
  if (!auth) {
    const error = new Error('Authentication required');
    (error as Error & { status?: number }).status = 401;
    throw error;
  }
  return auth;
}
