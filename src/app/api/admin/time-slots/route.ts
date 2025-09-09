import { NextRequest, NextResponse } from 'next/server'
import TimeSlotManager from '@/lib/time-slot-manager'

/**
 * GET /api/admin/time-slots/stats
 * Get time slot statistics for monitoring
 */
export async function GET() {
  try {
    const stats = await TimeSlotManager.getSlotStatistics()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching time slot stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch time slot statistics' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/time-slots/generate
 * Pre-generate time slots for all providers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { daysAhead = 30 } = body

    const result = await TimeSlotManager.preGenerateSlots(daysAhead)
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Generated slots for ${result.providersProcessed} providers`
    })
  } catch (error) {
    console.error('Error generating time slots:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate time slots' 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/time-slots/cleanup
 * Clean up old time slots
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const daysOld = parseInt(searchParams.get('daysOld') || '30')

    const deletedCount = await TimeSlotManager.cleanupOldSlots(daysOld)
    
    return NextResponse.json({
      success: true,
      data: { deletedCount },
      message: `Cleaned up ${deletedCount} old time slots`
    })
  } catch (error) {
    console.error('Error cleaning up time slots:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cleanup time slots' 
      },
      { status: 500 }
    )
  }
}
