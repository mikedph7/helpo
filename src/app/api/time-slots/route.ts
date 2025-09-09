import { NextRequest, NextResponse } from 'next/server'
import TimeSlotManager from '@/lib/time-slot-manager'

/**
 * GET /api/time-slots
 * Get available time slots with optimized performance
 * 
 * Query parameters:
 * - providerId: Filter by provider ID
 * - date: Specific date (YYYY-MM-DD)
 * - startDate: Start date for range (YYYY-MM-DD)
 * - endDate: End date for range (YYYY-MM-DD)
 * - limit: Number of results (default: 50, max: 100)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const providerId = searchParams.get('providerId')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query parameters
    const queryParams: any = { limit, offset }

    if (providerId) {
      queryParams.providerId = parseInt(providerId)
    }

    if (date) {
      queryParams.date = new Date(date)
    } else if (startDate && endDate) {
      queryParams.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      }
    } else if (!date) {
      // Default to next 7 days if no date params provided
      const start = new Date()
      const end = new Date()
      end.setDate(end.getDate() + 7)
      queryParams.dateRange = { start, end }
    }

    // Fetch time slots
    const timeSlots = await TimeSlotManager.getAvailableSlots(queryParams)
    
    // Transform for frontend
    const formattedSlots = timeSlots.map(slot => ({
      id: slot.id,
      providerId: slot.provider_id,
      provider: slot.provider,
      date: slot.date.toISOString().split('T')[0], // YYYY-MM-DD format
      startTime: slot.start_time,
      endTime: slot.end_time,
      isAvailable: slot.is_available && !slot.is_booked
    }))

    return NextResponse.json({
      success: true,
      data: {
        timeSlots: formattedSlots,
        pagination: {
          limit,
          offset,
          hasMore: formattedSlots.length === limit
        }
      }
    })
  } catch (error) {
    console.error('Error fetching time slots:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch time slots' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/time-slots/book
 * Book a time slot atomically
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slotId, bookingId } = body

    if (!slotId || !bookingId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'slotId and bookingId are required' 
        },
        { status: 400 }
      )
    }

    const updatedSlot = await TimeSlotManager.bookTimeSlot(slotId, bookingId)
    
    return NextResponse.json({
      success: true,
      data: updatedSlot,
      message: 'Time slot booked successfully'
    })
  } catch (error) {
    console.error('Error booking time slot:', error)
    
    if (error instanceof Error && error.message.includes('no longer available')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 409 } // Conflict
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to book time slot' 
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/time-slots/release
 * Release a time slot (for cancellations)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { slotId } = body

    if (!slotId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'slotId is required' 
        },
        { status: 400 }
      )
    }

    const updatedSlot = await TimeSlotManager.releaseTimeSlot(slotId)
    
    return NextResponse.json({
      success: true,
      data: updatedSlot,
      message: 'Time slot released successfully'
    })
  } catch (error) {
    console.error('Error releasing time slot:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to release time slot' 
      },
      { status: 500 }
    )
  }
}
