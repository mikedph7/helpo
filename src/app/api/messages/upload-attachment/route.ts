import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/messages/upload-attachment
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const conversationId = parseInt(formData.get('conversationId') as string, 10);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    // Verify user is a participant in the conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversation_id: conversationId, user_id: userId },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}${fileExtension}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await writeFile(path.join(uploadsDir, '.keep'), '');
    } catch (error) {
      // Directory probably doesn't exist, but that's ok - writeFile will create it
    }

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create attachment record
    const attachment = await prisma.messageAttachment.create({
      data: {
        filename: filename,
        file_url: `/uploads/${filename}`,
        file_type: file.type,
        file_size: file.size
      }
    });

    // Create message with attachment
    const message = await prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: userId,
        content: file.name, // Use original filename as content
        message_type: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
        attachments: {
          connect: { id: attachment.id }
        }
      },
      include: {
        sender: { select: { id: true, name: true } },
        attachments: true
      }
    });

    // Update conversation last_message_at
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { last_message_at: new Date() }
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      attachment,
      messageId: message.id
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
