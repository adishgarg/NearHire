import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail, generateToken } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      console.log('⚠️ Password reset requested for non-existent email:', email);
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, we sent a password reset link',
      });
    }

    // Check if user has a password (OAuth users don't)
    if (!user.password) {
      console.log('⚠️ Password reset requested for OAuth user:', email);
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, we sent a password reset link',
      });
    }

    // Generate password reset token
    const token = generateToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, token);

    if (!emailResult.success) {
      console.error('❌ Failed to send password reset email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    console.log('📧 Password reset email sent to:', email);

    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, we sent a password reset link',
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
