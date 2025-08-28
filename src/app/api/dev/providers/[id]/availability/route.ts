import { NextResponse } from "next/server";

interface TimeSlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  available: boolean;
  period: 'morning' | 'noon' | 'afternoon';
}

// Generate standard business hour time slots
function generateTimeSlots(): TimeSlot[] {
  return [
    // Morning slots (9 AM - 12 PM)
    { id: "morning-1", label: "9:00 AM", start_time: "09:00", end_time: "10:00", available: true, period: 'morning' },
    { id: "morning-2", label: "10:00 AM", start_time: "10:00", end_time: "11:00", available: true, period: 'morning' },
    { id: "morning-3", label: "11:00 AM", start_time: "11:00", end_time: "12:00", available: true, period: 'morning' },
    
    // Noon slots (12 PM - 3 PM)
    { id: "noon-1", label: "12:00 PM", start_time: "12:00", end_time: "13:00", available: true, period: 'noon' },
    { id: "noon-2", label: "1:00 PM", start_time: "13:00", end_time: "14:00", available: true, period: 'noon' },
    { id: "noon-3", label: "2:00 PM", start_time: "14:00", end_time: "15:00", available: true, period: 'noon' },
    
    // Afternoon slots (3 PM - 6 PM)
    { id: "afternoon-1", label: "3:00 PM", start_time: "15:00", end_time: "16:00", available: true, period: 'afternoon' },
    { id: "afternoon-2", label: "4:00 PM", start_time: "16:00", end_time: "17:00", available: true, period: 'afternoon' },
    { id: "afternoon-3", label: "5:00 PM", start_time: "17:00", end_time: "18:00", available: true, period: 'afternoon' },
  ];
}

export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
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

    // For now, return time slots with some randomly unavailable slots for demo
    let timeSlots = generateTimeSlots();
    
    // Make some slots unavailable based on the provider ID and date (deterministic)
    const seed = providerId + date.split('-').join('');
    const random = parseInt(seed) % 3;
    
    if (random === 0) {
      timeSlots[2].available = false; // 11 AM unavailable
      timeSlots[5].available = false; // 2 PM unavailable
    } else if (random === 1) {
      timeSlots[1].available = false; // 10 AM unavailable  
      timeSlots[7].available = false; // 4 PM unavailable
    } else {
      timeSlots[3].available = false; // 12 PM unavailable
      timeSlots[8].available = false; // 5 PM unavailable
    }

    // Generate available dates (next 7 business days)
    const availableDates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 10; i++) { // Check next 10 days to find 7 available days
      if (availableDates.length >= 7) break;
      
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateString = checkDate.toISOString().split('T')[0];
      const dayOfWeek = checkDate.getDay();
      
      // Include business days (Monday-Friday)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        availableDates.push(dateString);
      }
    }

    const availability = {
      provider_id: providerId,
      date,
      available_dates: availableDates,
      time_slots: timeSlots,
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
