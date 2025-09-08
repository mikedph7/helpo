import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/messages/[conversationId]/messages
export async function GET(request: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;
    const conversationId = parseInt(params.conversationId, 10);

    // Check if user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversation_id: conversationId, user_id: userId },
    });
    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch messages (exclude deleted ones)
    const messages = await prisma.message.findMany({
      where: { 
        conversation_id: conversationId,
        deleted_at: null // Exclude deleted messages
      },
      orderBy: { created_at: 'asc' },
      include: { 
        sender: { select: { id: true, name: true, avatar: true } },
        attachments: true
      },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// POST /api/messages/[conversationId]/messages
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
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }
    // Check if user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversation_id: conversationId, user_id: userId },
    });
    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Create message
    const message = await prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: userId,
        content,
      },
      include: { sender: true },
    });
    // Update conversation last_message_at
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { last_message_at: new Date() },
    });
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
