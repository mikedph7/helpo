// Migration script to update existing bookings that have provider approval in notes
// to use the new provider_confirmed_at field

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateProviderApprovals() {
  try {
    console.log('🔄 Starting migration of provider approvals from notes to provider_confirmed_at field...');

    // Find all bookings that have provider approval in notes but no provider_confirmed_at
    const bookingsToMigrate = await prisma.booking.findMany({
      where: {
        notes: {
          contains: '[Provider approved on'
        },
        provider_confirmed_at: null
      },
      select: {
        id: true,
        notes: true,
        updated_at: true
      }
    });

    console.log(`📋 Found ${bookingsToMigrate.length} bookings to migrate`);

    if (bookingsToMigrate.length === 0) {
      console.log('✅ No bookings need migration');
      return;
    }

    let migrated = 0;
    for (const booking of bookingsToMigrate) {
      try {
        // Extract the approval date from notes if possible
        const approvalMatch = booking.notes?.match(/\[Provider approved on ([^\]]+)\]/);
        let approvalDate = new Date();
        
        if (approvalMatch) {
          const dateString = approvalMatch[1];
          const parsedDate = new Date(dateString);
          if (!isNaN(parsedDate.getTime())) {
            approvalDate = parsedDate;
          }
        }

        // Update the booking
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            provider_confirmed_at: approvalDate
          }
        });

        migrated++;
        console.log(`✅ Migrated booking ${booking.id} with approval date: ${approvalDate.toISOString()}`);
      } catch (error) {
        console.error(`❌ Failed to migrate booking ${booking.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration completed: ${migrated}/${bookingsToMigrate.length} bookings migrated successfully`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateProviderApprovals();
