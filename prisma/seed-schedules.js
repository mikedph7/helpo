const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSchedulesAndTimeSlots() {
  try {
    console.log('🗓️ Seeding Provider Schedules and Time Slots...');

    // Get all providers
    const providers = await prisma.provider.findMany();
    console.log(`Found ${providers.length} providers`);

    for (const provider of providers) {
      console.log(`\nCreating schedule for ${provider.name}...`);

      // Create weekly schedule (Monday to Friday, 9 AM to 5 PM)
      const weekDays = [
        { day: 1, start: '09:00', end: '17:00' }, // Monday
        { day: 2, start: '09:00', end: '17:00' }, // Tuesday
        { day: 3, start: '09:00', end: '17:00' }, // Wednesday
        { day: 4, start: '09:00', end: '17:00' }, // Thursday
        { day: 5, start: '09:00', end: '17:00' }, // Friday
        { day: 6, start: '10:00', end: '14:00' }  // Saturday
      ];

      for (const schedule of weekDays) {
        // Create or update provider schedule
        const providerSchedule = await prisma.providerSchedule.upsert({
          where: {
            provider_id_day_of_week: {
              provider_id: provider.id,
              day_of_week: schedule.day
            }
          },
          update: {
            start_time: schedule.start,
            end_time: schedule.end,
            is_available: true
          },
          create: {
            provider_id: provider.id,
            day_of_week: schedule.day,
            start_time: schedule.start,
            end_time: schedule.end,
            is_available: true
          }
        });

        // Generate time slots for the next 30 days (1-hour intervals)
        const today = new Date();
        for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
          const currentDate = new Date(today);
          currentDate.setDate(today.getDate() + dayOffset);
          
          // Check if this date matches the schedule day (0=Sunday, 1=Monday, etc.)
          if (currentDate.getDay() === schedule.day) {
            const startHour = parseInt(schedule.start.split(':')[0]);
            const endHour = parseInt(schedule.end.split(':')[0]);
            
            for (let hour = startHour; hour < endHour; hour++) {
              const slotStart = `${hour.toString().padStart(2, '0')}:00`;
              const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;
              
              await prisma.timeSlot.upsert({
                where: {
                  provider_id_date_start_time: {
                    provider_id: provider.id,
                    date: currentDate,
                    start_time: slotStart
                  }
                },
                update: {
                  is_available: true,
                  end_time: slotEnd
                },
                create: {
                  provider_id: provider.id,
                  date: currentDate,
                  start_time: slotStart,
                  end_time: slotEnd,
                  is_available: true
                }
              });
            }
          }
        }
      }
      
      console.log(`✅ Created schedule for ${provider.name}`);
    }

    // Count results
    const totalSchedules = await prisma.providerSchedule.count();
    const totalTimeSlots = await prisma.timeSlot.count();

    console.log(`\n🎉 Schedule seeding complete!`);
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

seedSchedulesAndTimeSlots();
