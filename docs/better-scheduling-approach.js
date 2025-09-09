// Better approach: Store only schedules and exceptions
// Generate time slots on-demand

// Tables needed:
// 1. provider_schedules (recurring weekly schedule)
// 2. schedule_exceptions (holidays, breaks, custom hours)
// 3. bookings (actual reservations)

// Example query to find available slots:
async function getAvailableSlots(providerId: string, date: Date) {
  // 1. Get provider's weekly schedule for this day
  const schedule = await prisma.providerSchedule.findFirst({
    where: {
      provider_id: providerId,
      day_of_week: date.getDay(),
      is_available: true
    }
  });

  if (!schedule) return [];

  // 2. Check for exceptions on this specific date
  const exception = await prisma.scheduleException.findFirst({
    where: {
      provider_id: providerId,
      date: date
    }
  });

  // 3. Get existing bookings for this date
  const bookings = await prisma.booking.findMany({
    where: {
      provider_id: providerId,
      scheduled_at: {
        gte: startOfDay(date),
        lt: endOfDay(date)
      },
      status: { in: ['confirmed', 'in_progress'] }
    }
  });

  // 4. Generate available slots dynamically
  const slots = generateTimeSlots(
    exception?.start_time || schedule.start_time,
    exception?.end_time || schedule.end_time,
    date
  );

  // 5. Filter out booked slots
  return slots.filter(slot => 
    !bookings.some(booking => 
      isTimeConflict(slot, booking.scheduled_at)
    )
  );
}
