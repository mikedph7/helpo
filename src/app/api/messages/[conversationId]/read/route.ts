import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/messages/[conversationId]/read
export async function POST(request: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;
    const conversationId = parseInt(params.conversationId, 10);

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversation_id: conversationId, user_id: userId },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update participant's last read timestamp
    await prisma.conversationParticipant.update({
      where: {
        id: participant.id
      },
      data: {
        last_read_at: new Date()
      }
    });

    return NextResponse.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
