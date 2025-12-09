import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../../lib/db';
import { User } from '../../../../lib/models/User';
import { AUTH_COOKIE_NAME, signAuthToken } from '../../../../lib/auth';
import { Seller } from '@/lib/models/supplier';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { message: 'Please verify your email via OTP before logging in.' },
        { status: 403 }
      );
    }

    let tokenSubject = user._id.toString();
    let tokenRole = user.role;
    let tokenEmail = user.email;

    if (user.role === 'supplier') {
      let seller = await Seller.findOne({ email: user.email });

      // If no Seller profile exists yet, auto-create one so supplier can log in
      if (!seller) {
        seller = await Seller.create({
          companyName: user.companyName || 'Supplier',
          email: user.email,
          phone: user.phone || 'N/A',
          passwordHash: user.passwordHash,
          address: {
            street: 'N/A',
            city: 'N/A',
            state: 'N/A',
            pincode: '000000',
            country: 'India',
          },
          verificationStatus: 'verified',
          isActive: true,
        });

        console.log('✅ Auto-created Seller profile during supplier login:', {
          userId: user._id,
          sellerId: seller._id,
          email: seller.email,
        });
      }

      if (!seller.isActive) {
        return NextResponse.json(
          { message: 'Your supplier account is inactive. Please contact support.' },
          { status: 403 }
        );
      }

      // Allow login for pending/verified suppliers.
      // Only block if verification has been explicitly rejected.
      if (seller.verificationStatus === 'rejected') {
        return NextResponse.json(
          { message: 'Your supplier verification was rejected. Please contact support.' },
          { status: 403 }
        );
      }

      tokenSubject = seller._id.toString();
      tokenRole = 'supplier';
      tokenEmail = seller.email;
    }

    const token = await signAuthToken({
      sub: tokenSubject,
      role: tokenRole,
      email: tokenEmail,
    });

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: tokenRole,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('login error', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
