const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Starting database seeding with realistic data...')

    // Clear existing data
    await prisma.favorite.deleteMany()
    await prisma.review.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.service.deleteMany()
    await prisma.provider.deleteMany()
    await prisma.user.deleteMany()

    console.log('🧹 Cleared existing data')

    // Create realistic users with diverse backgrounds
    const userData = [
      {
        email: 'sarah.chen@gmail.com',
        name: 'Sarah Chen'
      },
      {
        email: 'mike.rodriguez@outlook.com',
        name: 'Mike Rodriguez'
      },
      {
        email: 'anna.santos@yahoo.com',
        name: 'Anna Santos'
      },
      {
        email: 'carlos.mendoza@protonmail.com',
        name: 'Carlos Mendoza'
      },
      {
        email: 'maria.reyes@icloud.com',
        name: 'Maria Reyes'
      },
      {
        email: 'john.tan@hotmail.com',
        name: 'John Tan'
      }
    ]

    const users = []
    for (const user of userData) {
      const createdUser = await prisma.user.create({
        data: user
      })
      users.push(createdUser)
    }

    console.log(`✅ Created ${userData.length} users`)

    // Create realistic providers with specialized services
    const providerData = [
      {
        name: 'Manila Elite Cleaning Services',
        bio: 'Premium residential and commercial cleaning company serving Metro Manila for over 8 years. We specialize in deep cleaning, office maintenance, and post-construction cleanup with eco-friendly products and trained staff.',
        average_rating: 4.8,
        rating_count: 142,
        photo_url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=150',
        verified: true,
        location: 'Makati City, Metro Manila'
      },
      {
        name: 'QuickFix Home Solutions',
        bio: 'Your trusted partner for all home repairs and maintenance needs. Licensed professionals with 10+ years experience in plumbing, electrical work, carpentry, and general repairs. Available for emergency services.',
        average_rating: 4.7,
        rating_count: 98,
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        verified: true,
        location: 'Quezon City, Metro Manila'
      },
      {
        name: 'Paws & Claws Pet Care Center',
        bio: 'Professional pet care services with certified animal handlers. We provide grooming, walking, sitting, and basic training for dogs and cats. All staff are pet-first aid certified and bonded.',
        average_rating: 4.9,
        rating_count: 187,
        photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        verified: true,
        location: 'Bonifacio Global City, Taguig'
      },
      {
        name: 'TechMaster Computer Services',
        bio: 'Complete computer and IT support for homes and small businesses. We handle repairs, upgrades, virus removal, data recovery, and network setup. 15 years of experience with all major brands.',
        average_rating: 4.6,
        rating_count: 76,
        photo_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150',
        verified: true,
        location: 'Pasig City, Metro Manila'
      },
      {
        name: 'Garden Masters Landscaping',
        bio: 'Professional landscaping and garden maintenance services. We design, install, and maintain beautiful gardens for residential and commercial properties. Specializing in tropical plants and sustainable gardening.',
        average_rating: 4.5,
        rating_count: 63,
        photo_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=150',
        verified: true,
        location: 'Alabang, Muntinlupa'
      },
      {
        name: 'MusicHub Academy',
        bio: 'Professional music instruction for all ages and skill levels. Our certified instructors offer lessons in piano, guitar, violin, and voice training. Both in-person and online lessons available with flexible scheduling.',
        average_rating: 4.7,
        rating_count: 94,
        photo_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150',
        verified: true,
        location: 'Ortigas, Pasig City'
      },
      {
        name: 'SkillBoost Tutoring Center',
        bio: 'Academic tutoring and professional skill development courses. We offer math, science, English tutoring for students, plus adult education in computer skills, languages, and business development.',
        average_rating: 4.6,
        rating_count: 127,
        photo_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150',
        verified: true,
        location: 'Eastwood City, Quezon City'
      }
    ]

    const providers = []
    for (const provider of providerData) {
      const createdProvider = await prisma.provider.create({
        data: provider
      })
      providers.push(createdProvider)
    }

    console.log(`✅ Created ${providers.length} specialized providers`)

    // Create comprehensive service offerings with realistic pricing
    const serviceData = [
      // Cleaning Services
      {
        title: 'Deep House Cleaning Package',
        description: 'Complete top-to-bottom deep cleaning including kitchen appliances, bathroom sanitization, floor mopping, dusting, and window cleaning. Perfect for move-ins or seasonal cleaning.',
        price: 2500.00,
        duration_minutes: 240,
        category: 'Cleaning',
        provider_id: providers[0].id,
        image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300'
      },
      {
        title: 'Regular Weekly Cleaning Service',
        description: 'Maintain your home with our weekly cleaning service. Includes general cleaning, trash removal, bathroom sanitization, and kitchen cleanup.',
        price: 1800.00,
        duration_minutes: 120,
        category: 'Cleaning',
        provider_id: providers[0].id,
        image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300'
      },
      {
        title: 'Post-Construction Cleanup',
        description: 'Specialized cleaning for newly constructed or renovated spaces. Removal of construction debris, dust, and thorough sanitization of all surfaces.',
        price: 4000.00,
        duration_minutes: 360,
        category: 'Cleaning',
        provider_id: providers[0].id,
        image_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=300'
      },

      // Home Repair Services
      {
        title: 'Emergency Plumbing Repair',
        description: 'Fast response plumbing services for leaks, clogs, toilet repairs, and pipe maintenance. Available 24/7 for urgent situations.',
        price: 1500.00,
        duration_minutes: 90,
        category: 'Repair',
        provider_id: providers[1].id,
        image_url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=300'
      },
      {
        title: 'Electrical Installation & Repair',
        description: 'Professional electrical work including outlet installation, switch repairs, lighting fixtures, and circuit troubleshooting by licensed electricians.',
        price: 2000.00,
        duration_minutes: 120,
        category: 'Repair',
        provider_id: providers[1].id,
        image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300'
      },
      {
        title: 'Furniture Assembly & Carpentry',
        description: 'Expert furniture assembly, custom shelving, cabinet repairs, and general carpentry work. We handle IKEA, office furniture, and custom pieces.',
        price: 1200.00,
        duration_minutes: 180,
        category: 'Repair',
        provider_id: providers[1].id,
        image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300'
      },

      // Pet Care Services
      {
        title: 'Premium Pet Grooming Session',
        description: 'Full grooming service including bath, haircut, nail trimming, ear cleaning, and teeth brushing. Suitable for dogs and cats of all sizes.',
        price: 800.00,
        duration_minutes: 120,
        category: 'Pets',
        provider_id: providers[2].id,
        image_url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=300'
      },
      {
        title: 'Daily Dog Walking Service',
        description: 'Professional dog walking service with experienced handlers. Includes exercise, socialization, and basic obedience reinforcement during walks.',
        price: 300.00,
        duration_minutes: 60,
        category: 'Pets',
        provider_id: providers[2].id,
        image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300'
      },
      {
        title: 'Pet Sitting & Overnight Care',
        description: 'Reliable pet sitting services in your home. Includes feeding, playtime, bathroom breaks, and overnight companionship for your pets.',
        price: 1500.00,
        duration_minutes: 720,
        category: 'Pets',
        provider_id: providers[2].id,
        image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300'
      },

      // Tech Services (categorized as Repair)
      {
        title: 'Computer Virus Removal & Tune-up',
        description: 'Complete computer cleaning including virus removal, malware scanning, system optimization, and performance enhancement. Includes data backup.',
        price: 1200.00,
        duration_minutes: 180,
        category: 'Repair',
        provider_id: providers[3].id,
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300'
      },
      {
        title: 'Home Network Setup & WiFi Optimization',
        description: 'Professional network setup, router configuration, WiFi optimization, and smart home device connectivity. Includes security setup.',
        price: 2200.00,
        duration_minutes: 150,
        category: 'Repair',
        provider_id: providers[3].id,
        image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300'
      },

      // Garden Services (categorized as Repair for now)
      {
        title: 'Garden Design & Landscaping',
        description: 'Complete garden makeover including design consultation, plant selection, soil preparation, and installation of tropical plants and features.',
        price: 5000.00,
        duration_minutes: 480,
        category: 'Repair',
        provider_id: providers[4].id,
        image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300'
      },
      {
        title: 'Monthly Garden Maintenance',
        description: 'Regular garden upkeep including pruning, weeding, fertilizing, pest control, and seasonal plant care to keep your garden healthy year-round.',
        price: 1800.00,
        duration_minutes: 180,
        category: 'Repair',
        provider_id: providers[4].id,
        image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300'
      },

      // Music & Arts Lessons
      {
        title: 'Piano Lessons - Beginner to Advanced',
        description: 'Professional piano instruction for all ages. Learn classical, jazz, or contemporary styles with certified instructors. Includes music theory, sight-reading, and performance techniques.',
        price: 1500.00,
        duration_minutes: 60,
        category: 'Lessons',
        provider_id: providers[5].id,
        image_url: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=300'
      },
      {
        title: 'Guitar Lessons - Acoustic & Electric',
        description: 'Learn guitar from experienced musicians. Covers basic chords, strumming patterns, fingerpicking, and your favorite songs. Both acoustic and electric guitar instruction available.',
        price: 1200.00,
        duration_minutes: 60,
        category: 'Lessons',
        provider_id: providers[5].id,
        image_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300'
      },
      {
        title: 'Voice Training & Singing Lessons',
        description: 'Professional vocal coaching to improve your singing technique, breath control, and performance skills. Suitable for beginners and experienced singers looking to refine their craft.',
        price: 1800.00,
        duration_minutes: 60,
        category: 'Lessons',
        provider_id: providers[5].id,
        image_url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300'
      },

      // Academic & Professional Tutoring
      {
        title: 'Mathematics Tutoring - High School & College',
        description: 'Expert math tutoring covering algebra, geometry, trigonometry, and calculus. One-on-one sessions focused on building confidence and problem-solving skills.',
        price: 1000.00,
        duration_minutes: 90,
        category: 'Lessons',
        provider_id: providers[6].id,
        image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300'
      },
      {
        title: 'English & Communication Skills Training',
        description: 'Improve your English speaking, writing, and presentation skills. Perfect for professionals, students, or anyone looking to enhance their communication abilities.',
        price: 900.00,
        duration_minutes: 75,
        category: 'Lessons',
        provider_id: providers[6].id,
        image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300'
      },
      {
        title: 'Computer Skills & Digital Literacy',
        description: 'Learn essential computer skills including Microsoft Office, internet basics, email management, and digital security. Tailored for beginners and seniors.',
        price: 800.00,
        duration_minutes: 120,
        category: 'Lessons',
        provider_id: providers[6].id,
        image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'
      }
    ]

    const services = []
    for (const service of serviceData) {
      const createdService = await prisma.service.create({
        data: {
          name: service.title,
          description: service.description,
          price_from: Math.floor(service.price * 100), // Convert to cents
          duration_minutes: service.duration_minutes,
          category: service.category,
          provider_id: service.provider_id,
          images: [service.image_url],
          tags: [],
          what_included: [],
          requirements: [],
          verified: true
        }
      })
      services.push(createdService)
    }

    console.log(`✅ Created ${serviceData.length} comprehensive services`)

    // Create realistic bookings with variety
    const bookingData = [
      {
        user_id: users[0].id,
        provider_id: providers[0].id,
        service_id: services[0].id,
        status: 'completed',
        scheduled_at: new Date('2025-08-15T10:00:00Z'),
        location: '123 Ayala Avenue, Makati City, 1226',
        notes: 'Please focus on the kitchen and living room. Two-bedroom condo with balcony.'
      },
      {
        user_id: users[1].id,
        provider_id: providers[1].id,
        service_id: services[3].id,
        status: 'completed',
        scheduled_at: new Date('2025-08-18T14:00:00Z'),
        location: '456 EDSA, Quezon City, 1100',
        notes: 'Kitchen sink was completely blocked. Fixed quickly and professionally.'
      },
      {
        user_id: users[2].id,
        provider_id: providers[2].id,
        service_id: services[7].id,
        status: 'completed',
        scheduled_at: new Date('2025-08-20T09:00:00Z'),
        location: '789 Bonifacio Global City, Taguig, 1634',
        notes: 'Golden retriever, very friendly. Likes to play in Bonifacio High Street park.'
      },
      {
        user_id: users[0].id,
        provider_id: providers[0].id,
        service_id: services[1].id,
        status: 'confirmed',
        scheduled_at: new Date('2025-08-30T11:00:00Z'),
        location: '321 Ortigas Center, Pasig City, 1605',
        notes: 'Weekly cleaning service for 3-bedroom house with 2 bathrooms.'
      },
      {
        user_id: users[1].id,
        provider_id: providers[2].id,
        service_id: services[6].id,
        status: 'pending',
        scheduled_at: new Date('2025-09-02T15:00:00Z'),
        location: '555 Greenhills Shopping Center, San Juan City, 1502',
        notes: 'Two cats need grooming - Persian and Maine Coon breeds.'
      },
      {
        user_id: users[2].id,
        provider_id: providers[4].id,
        service_id: services[11].id,
        status: 'completed',
        scheduled_at: new Date('2025-08-10T09:00:00Z'),
        location: '888 Alabang Hills, Muntinlupa City, 1780',
        notes: 'Complete backyard transformation with tropical plants and water feature.'
      },
      {
        user_id: users[3].id, // Carlos Mendoza
        provider_id: providers[5].id, // MusicHub Academy
        service_id: services[13].id, // Piano Lessons
        status: 'confirmed',
        scheduled_at: new Date('2025-09-05T16:00:00Z'),
        location: '999 Greenhills Music Hall, San Juan City, 1502',
        notes: 'Adult beginner looking to learn classical piano. Flexible with scheduling.'
      },
      {
        user_id: users[4].id, // Maria Reyes
        provider_id: providers[6].id, // SkillBoost Tutoring
        service_id: services[16].id, // Mathematics Tutoring
        status: 'completed',
        scheduled_at: new Date('2025-08-22T14:00:00Z'),
        location: '123 Katipunan Avenue, Quezon City, 1108',
        notes: 'Help with calculus for engineering student. Very patient instructor needed.'
      },
      {
        user_id: users[5].id, // John Tan
        provider_id: providers[3].id, // TechMaster Computer Services
        service_id: services[9].id, // Computer Virus Removal
        status: 'pending',
        scheduled_at: new Date('2025-09-10T10:00:00Z'),
        location: '456 Shaw Boulevard, Mandaluyong City, 1552',
        notes: 'Home computer running very slow, suspect malware infection.'
      },
      {
        user_id: users[3].id, // Carlos Mendoza
        provider_id: providers[1].id, // QuickFix Home Solutions
        service_id: services[4].id, // Electrical Installation & Repair
        status: 'confirmed',
        scheduled_at: new Date('2025-09-08T13:00:00Z'),
        location: '789 Maginhawa Street, Quezon City, 1101',
        notes: 'Need to install ceiling fan in master bedroom and fix flickering lights.'
      },
      {
        user_id: users[4].id, // Maria Reyes
        provider_id: providers[5].id, // MusicHub Academy
        service_id: services[15].id, // Voice Training
        status: 'confirmed',
        scheduled_at: new Date('2025-09-12T18:00:00Z'),
        location: '321 Timog Avenue, Quezon City, 1103',
        notes: 'Preparing for church choir auditions. Need help with breath control and range.'
      }
    ]

    const bookings = []
    for (let i = 0; i < bookingData.length; i++) {
      const booking = bookingData[i]
      const service = services.find(s => s.id === booking.service_id)
      const createdBooking = await prisma.booking.create({
        data: {
          user_id: booking.user_id,
          provider_id: booking.provider_id,
          service_id: booking.service_id,
          status: booking.status,
          scheduled_at: booking.scheduled_at,
          location: booking.location,
          notes: booking.notes,
          total_price: service?.price_from || 250000 // Default to ₱2500 if not found
        }
      })
      bookings.push(createdBooking)
    }

    console.log(`✅ Created ${bookingData.length} realistic bookings`)

    // Create authentic reviews with detailed feedback (no provider_id)
    const reviewsData = [
      {
        service_id: services[0].id,
        user_id: users[0].id,
        rating: 5,
        name: 'Sarah Chen',
        avatar_url: null,
        comment: 'Absolutely amazing service! The team from Manila Elite Cleaning was punctual, professional, and thorough. They transformed my entire condo and even cleaned areas I forgot existed. The post-construction dust was completely gone, and everything sparkled. Definitely booking them again for regular service!'
      },
      {
        service_id: services[3].id,
        user_id: users[1].id,
        rating: 4,
        name: 'Mike Rodriguez',
        avatar_url: null,
        comment: 'Quick response time and fixed the kitchen sink blockage efficiently. The plumber was knowledgeable and explained what caused the problem. Only minor issue was they arrived 15 minutes later than expected, but the quality of work was excellent. Will call QuickFix again for future repairs.'
      },
      {
        service_id: services[11].id,
        user_id: users[2].id,
        rating: 5,
        name: 'Anna Santos',
        avatar_url: null,
        comment: 'Garden Masters completely exceeded my expectations! The tropical garden design is breathtaking, and the water feature adds such a peaceful ambiance. The team was creative, professional, and finished ahead of schedule. My backyard is now my favorite space in the house. Highly recommended!'
      },
      {
        service_id: services[7].id,
        user_id: users[2].id,
        rating: 5,
        name: 'Anna Santos',
        avatar_url: null,
        comment: 'My Golden Retriever absolutely loves the walker from Paws & Claws! They send photos during the walk which gives me peace of mind while I am at work. The walker is punctual, caring, and my dog comes back happy and tired. Excellent service!'
      },
      {
        service_id: services[16].id, // Mathematics Tutoring
        user_id: users[4].id, // Maria Reyes
        rating: 5,
        name: 'Maria Reyes',
        avatar_url: null,
        comment: 'The calculus tutoring was incredible! The instructor broke down complex concepts into understandable steps. My grades improved significantly and I finally feel confident in math. The teaching approach was patient and very effective.'
      },
      {
        service_id: services[13].id, // Piano Lessons
        user_id: users[3].id, // Carlos Mendoza
        rating: 4,
        name: 'Carlos Mendoza',
        avatar_url: null,
        comment: 'Great piano instructor! Very knowledgeable and patient with adult beginners. The lessons are well-structured and I am learning faster than expected. Only minor issue is the studio can be a bit noisy during peak hours, but the quality of instruction more than makes up for it.'
      },
      {
        service_id: services[4].id, // Electrical Installation & Repair
        user_id: users[3].id, // Carlos Mendoza
        rating: 5,
        name: 'Carlos Mendoza',
        avatar_url: null,
        comment: 'Professional electrical work! The technician arrived on time, diagnosed the flickering light issue quickly, and installed the ceiling fan perfectly. Clean work area, fair pricing, and excellent customer service. Highly recommended!'
      },
      {
        service_id: services[1].id, // Regular Weekly Cleaning
        user_id: users[5].id, // John Tan
        rating: 4,
        name: 'John Tan',
        avatar_url: null,
        comment: 'Consistent and reliable cleaning service. The team does a thorough job and my house always looks great after their visit. Sometimes they arrive a bit later than scheduled, but the quality of cleaning is always excellent. Good value for money.'
      }
    ]

    const reviews = []
    for (const review of reviewsData) {
      const createdReview = await prisma.review.create({
        data: review
      })
      reviews.push(createdReview)
    }

    console.log(`✅ Created ${reviewsData.length} authentic reviews`)

    // Create user favorites for popular services
    const favoritesData = [
      {
        user_id: users[0].id,
        service_id: services[0].id // Deep House Cleaning Package
      },
      {
        user_id: users[0].id,
        service_id: services[6].id // Premium Pet Grooming Session
      },
      {
        user_id: users[1].id,
        service_id: services[3].id // Emergency Plumbing Repair
      },
      {
        user_id: users[1].id,
        service_id: services[7].id // Daily Dog Walking Service
      },
      {
        user_id: users[2].id,
        service_id: services[11].id // Garden Design & Landscaping
      },
      {
        user_id: users[2].id,
        service_id: services[9].id // Computer Virus Removal & Tune-up
      },
      {
        user_id: users[3].id, // Carlos Mendoza
        service_id: services[13].id // Piano Lessons
      },
      {
        user_id: users[3].id, // Carlos Mendoza
        service_id: services[4].id // Electrical Installation & Repair
      },
      {
        user_id: users[4].id, // Maria Reyes
        service_id: services[16].id // Mathematics Tutoring
      },
      {
        user_id: users[4].id, // Maria Reyes
        service_id: services[15].id // Voice Training
      },
      {
        user_id: users[5].id, // John Tan
        service_id: services[1].id // Regular Weekly Cleaning
      },
      {
        user_id: users[5].id, // John Tan
        service_id: services[18].id // Computer Skills & Digital Literacy
      },
      {
        user_id: users[0].id, // Sarah Chen
        service_id: services[14].id // Guitar Lessons
      },
      {
        user_id: users[1].id, // Mike Rodriguez
        service_id: services[17].id // English & Communication Skills
      }
    ]

    const favorites = []
    for (const favorite of favoritesData) {
      const createdFavorite = await prisma.favorite.create({
        data: favorite
      })
      favorites.push(createdFavorite)
    }

    console.log(`✅ Created ${favoritesData.length} user favorites`)

    console.log('🎉 Database seeded successfully with realistic data!')
    console.log(`📊 Summary:`)
    console.log(`   • ${users.length} users`)
    console.log(`   • ${providers.length} specialized providers`)
    console.log(`   • ${services.length} comprehensive services`)
    console.log(`   • ${bookings.length} bookings with various statuses`)
    console.log(`   • ${reviews.length} authentic reviews`)
    console.log(`   • ${favorites.length} user favorites`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
