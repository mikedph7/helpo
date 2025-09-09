import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with optimized approach...')

  // Clear existing time-related data only (preserve other data)
  await prisma.timeSlot.deleteMany()
  await prisma.providerSchedule.deleteMany()
  
  console.log('✅ Cleared existing time slots and schedules')

  // Get all existing providers
  const providers = await prisma.provider.findMany({
    select: { id: true, name: true }
  })

  if (providers.length === 0) {
    console.log('❌ No providers found. Please run the main seed first.')
    return
  }

  console.log(`📋 Found ${providers.length} providers`)

  // 1. Create optimized provider schedules (batch operation)
  console.log('🗓️ Creating provider schedules...')
  
  const scheduleData = []
  for (const provider of providers) {
    // Create weekday schedules (Monday to Friday)
    for (let day = 1; day <= 5; day++) {
      scheduleData.push({
        provider_id: provider.id,
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      })
    }
  }

  // Batch insert schedules
  await prisma.providerSchedule.createMany({
    data: scheduleData,
    skipDuplicates: true
  })

  console.log(`✅ Created ${scheduleData.length} provider schedules`)

  // 2. Create optimized time slots (batch operation)
  console.log('⏰ Creating time slots...')
  
  const timeSlots = []
  const startDate = new Date()
  const daysToGenerate = 7 // Only 7 days for development

  for (let dayOffset = 0; dayOffset < daysToGenerate; dayOffset++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + dayOffset)
    
    // Skip weekends
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue
    
    for (const provider of providers) {
      // Generate slots every 2 hours from 9 AM to 5 PM
      for (let hour = 9; hour < 17; hour += 2) {
        const startTime = hour.toString().padStart(2, '0') + ':00'
        const endTime = (hour + 2).toString().padStart(2, '0') + ':00'
        
        timeSlots.push({
          provider_id: provider.id,
          date: currentDate,
          start_time: startTime,
          end_time: endTime,
          is_available: true,
          is_booked: false
        })
      }
    }
  }

  // Batch insert time slots in chunks
  const chunkSize = 100
  let totalCreated = 0

  for (let i = 0; i < timeSlots.length; i += chunkSize) {
    const chunk = timeSlots.slice(i, i + chunkSize)
    await prisma.timeSlot.createMany({
      data: chunk,
      skipDuplicates: true
    })
    totalCreated += chunk.length
    
    // Progress indicator
    if (i % 200 === 0) {
      console.log(`  📦 Processed ${Math.min(i + chunkSize, timeSlots.length)}/${timeSlots.length} slots`)
    }
  }

  console.log(`✅ Created ${totalCreated} time slots`)

  // 3. Add database indexes for performance (if not already present)
  console.log('🔍 Optimizing database performance...')
  
  try {
    // These indexes should already exist from schema, but ensuring they're there
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_slots_provider_date 
      ON time_slots(provider_id, date) 
      WHERE is_available = true
    `
    
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_slots_date_available 
      ON time_slots(date, is_available) 
      WHERE is_available = true
    `
    
    console.log('✅ Database indexes optimized')
  } catch (error) {
    console.log('ℹ️ Indexes may already exist (this is normal)')
  }

  // 4. Performance summary
  console.log('\n📊 Performance Summary:')
  console.log(`   Providers: ${providers.length}`)
  console.log(`   Schedules: ${scheduleData.length}`)
  console.log(`   Time Slots: ${totalCreated}`)
  console.log(`   Days Generated: ${daysToGenerate}`)
  console.log(`   Batch Size: ${chunkSize}`)

  console.log('\n🎉 Optimized seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Optimized seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
