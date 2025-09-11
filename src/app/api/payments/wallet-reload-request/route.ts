import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// POST /api/payments/wallet-reload-request - Submit wallet reload request with payment proof
export async function POST(request: NextRequest) {
  return requireAuth(async (req, user) => {
    try {
      const formData = await req.formData();
      const amountCents = parseInt(formData.get('amount_cents') as string);
      const paymentMethodId = parseInt(formData.get('payment_method_id') as string);
      const referenceNumber = formData.get('reference_number') as string || '';
      const memo = formData.get('memo') as string || 'Wallet reload';
      const proofImageFile = formData.get('proof_image') as File;

      if (!amountCents || amountCents <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount' },
          { status: 400 }
        );
      }

      if (!paymentMethodId) {
        return NextResponse.json(
          { error: 'Payment method required' },
          { status: 400 }
        );
      }

      if (!proofImageFile) {
        return NextResponse.json(
          { error: 'Payment proof image required' },
          { status: 400 }
        );
      }

      // Validate file type
      if (!proofImageFile.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Invalid file type. Please upload an image.' },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      if (proofImageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Please upload an image smaller than 5MB.' },
          { status: 400 }
        );
      }

      // Save the uploaded file to private directory
      const bytes = await proofImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate unique filename
      const timestamp = Date.now();
      const extension = proofImageFile.name.split('.').pop();
      const filename = `wallet_reload_${user.id}_${timestamp}.${extension}`;
      const uploadPath = join(process.cwd(), 'uploads', filename);
      
      await writeFile(uploadPath, buffer);
      const proofImageUrl = `/uploads/${filename}`; // This will be served via protected API route

      // Verify payment method exists
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: { 
          id: paymentMethodId,
          is_active: true 
        }
      });

      if (!paymentMethod) {
        return NextResponse.json(
          { error: 'Invalid payment method' },
          { status: 400 }
        );
      }

      // Create wallet reload request (similar to manual payment but for wallet)
      const walletReloadRequest = await prisma.payment.create({
        data: {
          user_id: user.id,
          amount: amountCents,
          payment_method: paymentMethod.method_type as any,
          status: 'pending',
          payment_type: 'wallet_reload',
          reference_number: referenceNumber,
          proof_image_url: proofImageUrl,
          admin_notes: memo,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        request_id: walletReloadRequest.id,
        message: 'Wallet reload request submitted successfully. It will be reviewed by an admin.'
      });

    } catch (error) {
      console.error('Wallet reload request error:', error);
      return NextResponse.json(
        { error: 'Failed to submit wallet reload request' },
        { status: 500 }
      );
    }
  })(request);
}
