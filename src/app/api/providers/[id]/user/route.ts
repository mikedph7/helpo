import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/providers/[id]/user - Get provider's user ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const providerId = parseInt(params.id, 10);

    // First, try to find if the provider has a direct user relationship
    // (You might need to adjust this based on your actual schema)
    
    // Option 1: If providers are linked to users by name/email
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Option 2: Look for a user with PROVIDER role and matching name
    const providerUser = await prisma.user.findFirst({
      where: {
        role: 'PROVIDER',
        name: provider.name
      },
      select: { id: true, name: true, role: true }
    });

    if (!providerUser) {
      // If no provider user found, we can't start a conversation
      return NextResponse.json({ 
        error: 'Provider user account not found',
        provider: { id: provider.id, name: provider.name }
      }, { status: 404 });
    }

    return NextResponse.json({
      providerId: provider.id,
      userId: providerUser.id,
      name: provider.name
    });

  } catch (error) {
    console.error('Error fetching provider user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
