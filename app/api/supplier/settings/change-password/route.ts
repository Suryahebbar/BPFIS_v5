import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Seller } from '@/lib/models/supplier';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    const seller = await Seller.findById(sellerId).select('+passwordHash');
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Try to validate against the main User record (login uses User.passwordHash)
    const user = await User.findOne({ email: seller.email }).select('+passwordHash');

    const hashToCheck = user?.passwordHash || seller.passwordHash;
    const isValid = await bcrypt.compare(currentPassword, hashToCheck);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    // Update seller password
    seller.passwordHash = newHash;
    await seller.save();

    // Also update corresponding User password so login uses the new password
    if (user) {
      user.passwordHash = newHash;
      await user.save();
    }

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Error changing supplier password:', error);
    return NextResponse.json({ error: error.message || 'Failed to change password' }, { status: 500 });
  }
}
