import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { User } from '../../../../lib/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, emailOtp, phoneOtp } = body;

    if (!userId) {
      return NextResponse.json(
        { message: 'Missing userId' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { message: 'OTP expired. Please register again.' },
        { status: 400 }
      );
    }

    if (emailOtp && user.emailOtp !== emailOtp) {
      return NextResponse.json(
        { message: 'Invalid email OTP' },
        { status: 400 }
      );
    }

    if (phoneOtp && user.phoneOtp && user.phoneOtp !== phoneOtp) {
      return NextResponse.json(
        { message: 'Invalid phone OTP' },
        { status: 400 }
      );
    }

    if (emailOtp) {
      user.emailVerified = true;
      user.emailOtp = undefined;
    }

    if (phoneOtp && user.phoneOtp) {
      user.phoneVerified = true;
      user.phoneOtp = undefined;
    }

    if (user.emailVerified && (user.phoneVerified || !user.phone)) {
      user.otpExpiresAt = undefined;
    }

    await user.save();

    return NextResponse.json({
      message: 'OTP verified successfully',
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    });
  } catch (error) {
    console.error('verify-otp error', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
