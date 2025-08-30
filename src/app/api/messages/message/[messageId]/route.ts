import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// PUT /api/messages/message/[messageId] - Edit message
export async function PUT(request: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;
    const messageId = parseInt(params.messageId, 10);
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    // Find the message and verify ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { sender: { select: { id: true, name: true } } }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.sender_id !== userId) {
      return NextResponse.json({ error: 'Can only edit your own messages' }, { status: 403 });
    }

    // Check if message was already deleted
    if (message.deleted_at) {
      return NextResponse.json({ error: 'Cannot edit deleted message' }, { status: 400 });
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        edited_at: new Date()
      },
      include: { sender: { select: { id: true, name: true } } }
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error editing message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/messages/message/[messageId] - Delete message
export async function DELETE(request: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;
    const messageId = parseInt(params.messageId, 10);

    // Find the message and verify ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.sender_id !== userId) {
      return NextResponse.json({ error: 'Can only delete your own messages' }, { status: 403 });
    }

    // Soft delete by setting deleted_at
    await prisma.message.update({
      where: { id: messageId },
      data: {
        deleted_at: new Date(),
        content: '[Message deleted]'
      }
    });

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
