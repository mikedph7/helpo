import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';

interface TimeSlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  available: boolean;
  period: 'morning' | 'noon' | 'afternoon';
}

// Convert 24-hour time string to 12-hour format for display
function formatTimeToLabel(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Determine time period based on hour
function getTimePeriod(time: string): 'morning' | 'noon' | 'afternoon' {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 15) return 'noon';
  return 'afternoon';
}

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const providerId = parseInt(id);
    
    if (isNaN(providerId)) {
      return NextResponse.json({ error: 'Invalid provider ID' }, { status: 400 });
    }

    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Verify provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Parse the requested date
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Get time slots for the specific date from database
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        provider_id: providerId,
        date: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000) // Next day
        }
      },
      orderBy: { start_time: 'asc' }
    });

    // Convert database time slots to API format
    const formattedTimeSlots: TimeSlot[] = timeSlots.map((slot: { 
      id: number; 
      start_time: string; 
      end_time: string; 
      is_available: boolean; 
      is_booked: boolean; 
    }) => ({
      id: slot.id.toString(),
      label: formatTimeToLabel(slot.start_time),
      start_time: slot.start_time,
      end_time: slot.end_time,
      available: slot.is_available && !slot.is_booked,
      period: getTimePeriod(slot.start_time)
    }));

    // Generate available dates based on provider schedule
    const availableDates: string[] = [];
    const today = new Date();
    
    // Get provider's weekly schedule
    const weeklySchedule = await prisma.providerSchedule.findMany({
      where: {
        provider_id: providerId,
        is_available: true
      }
    });

    const availableDaysOfWeek = new Set(weeklySchedule.map((s: { day_of_week: number }) => s.day_of_week));

    for (let i = 1; i <= 14; i++) { // Check next 14 days
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dayOfWeek = checkDate.getDay();
      
      // Only include days the provider works
      if (availableDaysOfWeek.has(dayOfWeek)) {
        const dateString = checkDate.toISOString().split('T')[0];
        availableDates.push(dateString);
      }
    }

    const availability = {
      provider_id: providerId,
      date,
      available_dates: availableDates,
      time_slots: formattedTimeSlots,
    };

    return NextResponse.json(availability);

  } catch (error) {
    console.error('Error fetching provider availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
