const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSchedulesAndTimeSlotsOptimized() {
  try {
    console.log('🗓️ Seeding Provider Schedules and Time Slots (Optimized)...');

    // Get all providers
    const providers = await prisma.provider.findMany();
    console.log(`Found ${providers.length} providers`);

    // Batch create schedules first
    const scheduleData = [];
    const weekDays = [
      { day: 1, start: '09:00', end: '17:00' }, // Monday
      { day: 2, start: '09:00', end: '17:00' }, // Tuesday
      { day: 3, start: '09:00', end: '17:00' }, // Wednesday
      { day: 4, start: '09:00', end: '17:00' }, // Thursday
      { day: 5, start: '09:00', end: '17:00' }, // Friday
      { day: 6, start: '10:00', end: '14:00' }  // Saturday
    ];

    for (const provider of providers) {
      for (const schedule of weekDays) {
        scheduleData.push({
          provider_id: provider.id,
          day_of_week: schedule.day,
          start_time: schedule.start,
          end_time: schedule.end,
          is_available: true
        });
      }
    }

    // Clear existing schedules
    await prisma.providerSchedule.deleteMany();
    
    // Batch create schedules
    await prisma.providerSchedule.createMany({
      data: scheduleData,
      skipDuplicates: true
    });

    console.log(`✅ Created ${scheduleData.length} provider schedules`);

    // Create time slots for next 7 days only (instead of 30) in batches
    const timeSlotData = [];
    const today = new Date();
    
    for (const provider of providers) {
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) { // Only 7 days
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + dayOffset);
        
        // Find matching schedule for this day
        const dayOfWeek = currentDate.getDay();
        const schedule = weekDays.find(s => s.day === dayOfWeek);
        
        if (schedule) {
          const startHour = parseInt(schedule.start.split(':')[0]);
          const endHour = parseInt(schedule.end.split(':')[0]);
          
          for (let hour = startHour; hour < endHour; hour++) {
            const slotStart = `${hour.toString().padStart(2, '0')}:00`;
            const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;
            
            timeSlotData.push({
              provider_id: provider.id,
              date: currentDate,
              start_time: slotStart,
              end_time: slotEnd,
              is_available: true
            });
          }
        }
      }
    }

    // Clear existing time slots
    await prisma.timeSlot.deleteMany();
    
    // Batch create time slots in chunks to avoid query size limits
    const chunkSize = 1000;
    for (let i = 0; i < timeSlotData.length; i += chunkSize) {
      const chunk = timeSlotData.slice(i, i + chunkSize);
      await prisma.timeSlot.createMany({
        data: chunk,
        skipDuplicates: true
      });
      console.log(`Created time slots ${i + 1}-${Math.min(i + chunkSize, timeSlotData.length)} of ${timeSlotData.length}`);
    }

    console.log(`✅ Created ${timeSlotData.length} time slots`);

    // Count results
    const totalSchedules = await prisma.providerSchedule.count();
    const totalTimeSlots = await prisma.timeSlot.count();

    console.log(`\n🎉 Optimized schedule seeding complete!`);
    console.log(`📊 Summary:`);
    console.log(`  - Providers: ${providers.length}`);
    console.log(`  - Provider Schedules: ${totalSchedules}`);
    console.log(`  - Time Slots: ${totalTimeSlots}`);

  } catch (error) {
    console.error('❌ Error seeding schedules:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSchedulesAndTimeSlotsOptimized();
