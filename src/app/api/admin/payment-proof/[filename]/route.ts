import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { readFile } from 'fs/promises';
import { join } from 'path';

// GET /api/admin/payment-proof/[filename] - Serve payment proof images to admins only
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Check authentication
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const { filename } = await params;

    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Only allow specific file patterns for security
    if (!filename.match(/^(wallet_reload|payment_proof)_\d+_\d+\.(jpg|jpeg|png|gif|webp)$/i)) {
      return NextResponse.json({ error: 'Invalid file pattern' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'uploads', filename);
    
    try {
      const fileBuffer = await readFile(filePath);
      
      // Determine content type based on file extension
      const extension = filename.split('.').pop()?.toLowerCase();
      let contentType = 'image/jpeg'; // default
      
      switch (extension) {
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'jpg':
        case 'jpeg':
        default:
          contentType = 'image/jpeg';
      }

      return new NextResponse(fileBuffer as any, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
    } catch (fileError) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error serving payment proof:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
