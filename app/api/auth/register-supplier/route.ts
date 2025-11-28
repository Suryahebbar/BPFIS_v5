import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../../lib/db';
import { User } from '../../../../lib/models/User';
import { sendEmailOtp } from '../../../../lib/otpEmail';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, businessEmail, upiId, password } = body;

    if (!companyName || !businessEmail || !upiId || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: businessEmail });
    if (existing) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const emailOtp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      role: 'supplier',
      companyName,
      email: businessEmail,
      businessEmail,
      upiId,
      passwordHash,
      emailVerified: false,
      phoneVerified: false,
      emailOtp,
      otpExpiresAt,
    });

    void sendEmailOtp(user.email, emailOtp, 'supplier registration');

    return NextResponse.json({
      message: 'Supplier registered. Verify OTP to activate account.',
      userId: user._id,
    });
  } catch (error) {
    console.error('register-supplier error', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
