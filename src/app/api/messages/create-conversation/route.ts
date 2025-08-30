import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/messages/create-conversation
export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { participantId, bookingId, title } = await request.json();

    if (!participantId || participantId === userId) {
      return NextResponse.json({ error: 'Valid participant ID required' }, { status: 400 });
    }

    // Verify participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Check if conversation already exists for these participants
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            user_id: { in: [userId, participantId] }
          }
        },
        booking_id: bookingId || null
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
        },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, name: true } } }
        }
      }
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        title,
        booking_id: bookingId,
        participants: {
          create: [
            { user_id: userId },
            { user_id: participantId }
          ]
        }
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
        },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, name: true } } }
        }
      }
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
