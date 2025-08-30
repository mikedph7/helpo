import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data in correct order (respecting foreign keys)
  await prisma.searchLog.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.servicePhoto.deleteMany()
  await prisma.service.deleteMany()
  await prisma.provider.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.userWalletAccount.deleteMany()
  await prisma.userSocialAccount.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleared existing data')

  // Create test users
  const testUser = await prisma.user.create({
    data: {
      id: 'user_test_123',
      email: 'test@helpo.com',
      full_name: 'Test User',
      role: 'customer',
      password_hash: await bcrypt.hash('password123', 10)
    }
  })

  console.log('✅ Created test user')

  // Create provider users and providers
  const providerData = [
    {
      id: 'prov_001',
      display_name: 'Clean Masters',
      bio: 'Professional cleaning services',
      rating_avg: 4.8,
      rating_count: 127,
      photo_url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=150',
      is_verified: true,
      address_text: 'Metro Manila'
    },
    {
      id: 'prov_002', 
      display_name: 'Fix It Pro',
      bio: 'Expert repair services',
      rating_avg: 4.6,
      rating_count: 89,
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      is_verified: true,
      address_text: 'Quezon City'
    },
    {
      id: 'prov_003',
      display_name: 'Pet Care Plus',
      bio: 'Professional pet care and grooming',
      rating_avg: 4.9,
      rating_count: 156,
      photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      is_verified: true,
      address_text: 'Makati City'
    }
  ]

  for (const provider of providerData) {
    // Create user for provider
    const providerUser = await prisma.user.create({
      data: {
        id: `user_${provider.id}`,
        email: `${provider.id}@helpo.com`,
        full_name: provider.display_name,
        role: 'provider',
        password_hash: await bcrypt.hash('password123', 10)
      }
    })

    // Create provider
    await prisma.provider.create({
      data: {
        id: provider.id,
        user_id: providerUser.id,
        display_name: provider.display_name,
        bio: provider.bio,
        rating_avg: provider.rating_avg,
        rating_count: provider.rating_count,
        photo_url: provider.photo_url,
        is_verified: provider.is_verified,
        address_text: provider.address_text
      }
    })
  }

  console.log(`✅ Created ${providerData.length} providers`)

  // Create services
  const serviceData = [
    {
      id: 'svc_001',
      title: 'Deep House Cleaning',
      category: 'Cleaning',
      description: 'Complete deep cleaning service for your home including all rooms, bathrooms, and kitchen.',
      base_price_cents: 5000, // $50.00
      provider_id: 'prov_001',
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500']
    },
    {
      id: 'svc_002',
      title: 'Plumbing Repair',
      category: 'Repair', 
      description: 'Professional plumbing repair and maintenance services for all your home needs.',
      base_price_cents: 7500, // $75.00
      provider_id: 'prov_002',
      images: ['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500']
    },
    {
      id: 'svc_003',
      title: 'Dog Walking',
      category: 'Pets',
      description: 'Professional dog walking service with experienced pet handlers.',
      base_price_cents: 2500, // $25.00
      provider_id: 'prov_003',
      images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500']
    },
    {
      id: 'svc_004',
      title: 'Guitar Lessons',
      category: 'Lessons',
      description: 'Professional guitar lessons for beginners and intermediate players.',
      base_price_cents: 4000, // $40.00
      provider_id: 'prov_001',
      images: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500']
    }
  ]

  for (const service of serviceData) {
    const createdService = await prisma.service.create({
      data: {
        id: service.id,
        title: service.title,
        category: service.category,
        description: service.description,
        base_price_cents: service.base_price_cents,
        provider_id: service.provider_id
      }
    })

    // Add service photos
    for (let i = 0; i < service.images.length; i++) {
      await prisma.servicePhoto.create({
        data: {
          service_id: createdService.id,
          image_url: service.images[i],
          is_primary: i === 0
        }
      })
    }
  }

  console.log(`✅ Created ${serviceData.length} services`)

  // Create sample bookings
  const bookingData = [
    {
      id: 'book_001',
      user_id: testUser.id,
      provider_id: 'prov_001',
      service_id: 'svc_001',
      status: 'completed',
      scheduled_at: new Date('2025-08-20T10:00:00Z'),
      address_text: '123 Main St, Makati City',
      notes: 'Please focus on the kitchen and living room'
    },
    {
      id: 'book_002',
      user_id: testUser.id,
      provider_id: 'prov_002',
      service_id: 'svc_002',
      status: 'pending',
      scheduled_at: new Date('2025-08-28T14:00:00Z'),
      address_text: '456 Oak Ave, Quezon City',
      notes: 'Leaky faucet in the main bathroom'
    }
  ]

  for (const booking of bookingData) {
    const createdBooking = await prisma.booking.create({
      data: {
        id: booking.id,
        user_id: booking.user_id,
        provider_id: booking.provider_id,
        service_id: booking.service_id,
        status: booking.status,
        scheduled_at: booking.scheduled_at,
        address_text: booking.address_text,
        notes: booking.notes
      }
    })

    // Add review for completed bookings
    if (booking.status === 'completed') {
      await prisma.review.create({
        data: {
          booking_id: createdBooking.id,
          rating: 5,
          comment: 'Excellent service! Very professional and thorough. Highly recommended!'
        }
      })
    }
  }

  console.log(`✅ Created ${bookingData.length} bookings`)

  // Create favorites
  await prisma.favorite.create({
    data: {
      user_id: testUser.id,
      service_id: 'svc_001'
    }
  })

  await prisma.favorite.create({
    data: {
      user_id: testUser.id,
      service_id: 'svc_003'
    }
  })

  console.log('✅ Created sample favorites')

  // Add sample search logs
  await prisma.searchLog.create({
    data: {
      query: 'house cleaning',
      category: 'Cleaning',
      results_count: 2,
      user_id: testUser.id
    }
  })

  await prisma.searchLog.create({
    data: {
      query: 'plumber',
      category: 'Repair',
      results_count: 1,
      user_id: testUser.id
    }
  })

  console.log('✅ Added sample search logs')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
