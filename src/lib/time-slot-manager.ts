import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Time Slot Management Utilities for Production Optimization
 */

export class TimeSlotManager {
  private static readonly BATCH_SIZE = 100
  private static readonly DEFAULT_DAYS_AHEAD = 30
  private static readonly SLOT_DURATION_HOURS = 2

  /**
   * Generate time slots for a specific provider efficiently
   */
  static async generateSlotsForProvider(
    providerId: number, 
    daysAhead: number = this.DEFAULT_DAYS_AHEAD
  ) {
    // Get provider's schedule
    const schedules = await prisma.providerSchedule.findMany({
      where: { 
        provider_id: providerId,
        is_available: true
      }
    })

    if (schedules.length === 0) {
      throw new Error(`No schedule found for provider ${providerId}`)
    }

    const timeSlots = []
    const startDate = new Date()

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + dayOffset)
      const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay() // Convert Sunday from 0 to 7

      // Find schedule for this day
      const daySchedule = schedules.find(s => s.day_of_week === dayOfWeek)
      if (!daySchedule) continue

      // Parse start and end times
      const [startHour] = daySchedule.start_time.split(':').map(Number)
      const [endHour] = daySchedule.end_time.split(':').map(Number)

      // Generate slots for this day
      for (let hour = startHour; hour < endHour; hour += this.SLOT_DURATION_HOURS) {
        const startTime = hour.toString().padStart(2, '0') + ':00'
        const endTime = (hour + this.SLOT_DURATION_HOURS).toString().padStart(2, '0') + ':00'

        timeSlots.push({
          provider_id: providerId,
          date: currentDate,
          start_time: startTime,
          end_time: endTime,
          is_available: true,
          is_booked: false
        })
      }
    }

    // Batch insert
    return this.batchInsertSlots(timeSlots)
  }

  /**
   * Batch insert time slots with optimized performance
   */
  static async batchInsertSlots(timeSlots: any[]) {
    let totalCreated = 0

    for (let i = 0; i < timeSlots.length; i += this.BATCH_SIZE) {
      const chunk = timeSlots.slice(i, i + this.BATCH_SIZE)
      await prisma.timeSlot.createMany({
        data: chunk,
        skipDuplicates: true
      })
      totalCreated += chunk.length
    }

    return totalCreated
  }

  /**
   * Get available slots efficiently with pagination
   */
  static async getAvailableSlots(params: {
    providerId?: number
    date?: Date
    dateRange?: { start: Date; end: Date }
    limit?: number
    offset?: number
  }) {
    const { providerId, date, dateRange, limit = 50, offset = 0 } = params

    const where: any = {
      is_available: true,
      is_booked: false
    }

    if (providerId) {
      where.provider_id = providerId
    }

    if (date) {
      where.date = date
    } else if (dateRange) {
      where.date = {
        gte: dateRange.start,
        lte: dateRange.end
      }
    }

    return prisma.timeSlot.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            photo_url: true,
            average_rating: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { start_time: 'asc' }
      ],
      take: limit,
      skip: offset
    })
  }

  /**
   * Book a time slot atomically
   */
  static async bookTimeSlot(slotId: number, bookingId: number) {
    return prisma.$transaction(async (tx) => {
      // Check if slot is still available
      const slot = await tx.timeSlot.findUnique({
        where: { id: slotId },
        select: { is_available: true, is_booked: true }
      })

      if (!slot || !slot.is_available || slot.is_booked) {
        throw new Error('Time slot is no longer available')
      }

      // Update slot
      return tx.timeSlot.update({
        where: { id: slotId },
        data: {
          is_available: false,
          is_booked: true,
          booking_id: bookingId
        }
      })
    })
  }

  /**
   * Release a time slot (for cancellations)
   */
  static async releaseTimeSlot(slotId: number) {
    return prisma.timeSlot.update({
      where: { id: slotId },
      data: {
        is_available: true,
        is_booked: false,
        booking_id: null
      }
    })
  }

  /**
   * Clean up old time slots (for maintenance)
   */
  static async cleanupOldSlots(daysOld: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.timeSlot.deleteMany({
      where: {
        date: {
          lt: cutoffDate
        },
        is_booked: false
      }
    })

    return result.count
  }

  /**
   * Get time slot statistics for monitoring
   */
  static async getSlotStatistics() {
    const [total, available, booked] = await Promise.all([
      prisma.timeSlot.count(),
      prisma.timeSlot.count({ where: { is_available: true, is_booked: false } }),
      prisma.timeSlot.count({ where: { is_booked: true } })
    ])

    return {
      total,
      available,
      booked,
      utilization: total > 0 ? (booked / total * 100).toFixed(2) + '%' : '0%'
    }
  }

  /**
   * Pre-generate slots for all providers (for cron jobs)
   */
  static async preGenerateSlots(daysAhead: number = 30) {
    const providers = await prisma.provider.findMany({
      select: { id: true, name: true }
    })

    let totalGenerated = 0
    
    for (const provider of providers) {
      try {
        const generated = await this.generateSlotsForProvider(provider.id, daysAhead)
        totalGenerated += generated
      } catch (error) {
        console.error(`Failed to generate slots for provider ${provider.id}:`, error)
      }
    }

    return {
      providersProcessed: providers.length,
      totalSlotsGenerated: totalGenerated
    }
  }
}

export default TimeSlotManager
