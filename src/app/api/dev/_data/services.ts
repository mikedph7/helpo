// src/app/api/dev/_data/services.ts

export type HelpoCategory = 'Cleaning' | 'Repair' | 'Pets' | 'Lessons';

export type Review = {
  id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  rating: number;
  comment: string;
  date: string;
};

export type Favorite = {
  id: string;
  user_id: string;  // In real app, this would be the authenticated user ID
  service_id: string;
  created_at: string;
};

export type BookingStatus = "confirmed" | "pending" | "completed" | "canceled";

export type Booking = {
  id: string;
  user_id: string;  // In real app, this would be the authenticated user ID
  service_id: string;
  provider_id: string;
  scheduled_at: string;
  location?: string;
  status: BookingStatus;
  total_price: number;
  notes?: string;
  number_of_people?: number;
  payment_method_id?: string;
  created_at: string;
  updated_at: string;
};

export type Provider = {
  id: string;
  display_name: string;
  photo_url?: string;
  rating_avg?: number;      // Provider's overall rating across ALL their services
  rating_count?: number;    // Total number of reviews for this provider
  verified?: boolean;
  bio?: string;
  location?: string;
};

export type HelpoService = {
  id: string;            // slug/id used in routes
  name: string;
  category: HelpoCategory;
  description: string;
  price_from?: number;    // optional mock pricing
  duration_mins?: number; // optional mock duration
  tags?: string[];
  images?: string[];      // photo carousel
  provider_id?: string;   // link to provider
  what_included?: string[];  // bullet points of what's included
  requirements?: string[];   // rules/requirements
  pricing_details?: {
    base_price: number;
    additional_fees?: { name: string; price: number }[];
  };
  reviews?: Review[];     // service-specific reviews (used for service rating)
  top_rated?: boolean;    // badge
  verified?: boolean;     // badge
  next_availability?: string; // next available slot
};

export const CATEGORIES: HelpoCategory[] = ['Cleaning', 'Repair', 'Pets', 'Lessons'];

export const PROVIDERS: Provider[] = [
  { 
    id: "prov_1", 
    display_name: "Jane's Cleaning", 
    rating_avg: 4.9, 
    rating_count: 128,
    verified: true,
    photo_url: "https://images.unsplash.com/photo-1494790108755-2616b2c6b6c6?w=150",
    bio: "Professional cleaning service with 8 years experience. Licensed and insured.",
    location: "Manila, Metro Manila"
  },
  { 
    id: "prov_2", 
    display_name: "Mark's Plumbing", 
    rating_avg: 4.7, 
    rating_count: 64,
    verified: true,
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    bio: "Licensed plumber specializing in residential repairs and installations.",
    location: "Quezon City, Metro Manila"
  },
  { 
    id: "prov_3", 
    display_name: "Alex's Home Repairs", 
    rating_avg: 4.8, 
    rating_count: 89,
    verified: false,
    photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    bio: "Handyman services for all your home repair needs. Quick and reliable.",
    location: "Makati City, Metro Manila"
  },
  { 
    id: "prov_4", 
    display_name: "CoolAir Services", 
    rating_avg: 4.6, 
    rating_count: 156,
    verified: true,
    photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
    bio: "HVAC specialists with certified technicians. 24/7 emergency service available.",
    location: "Pasig City, Metro Manila"
  },
  { 
    id: "prov_5", 
    display_name: "Pet Pals Mobile Grooming", 
    rating_avg: 4.9, 
    rating_count: 73,
    verified: true,
    photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    bio: "Mobile pet grooming service bringing the salon to your doorstep.",
    location: "Taguig City, Metro Manila"
  },
  { 
    id: "prov_6", 
    display_name: "MusicMaestro Academy", 
    rating_avg: 4.8, 
    rating_count: 145,
    verified: true,
    photo_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150",
    bio: "Professional music instructors offering piano, guitar, and voice lessons for all ages.",
    location: "Makati City, Metro Manila"
  },
  { 
    id: "prov_7", 
    display_name: "Chef Maria's Kitchen", 
    rating_avg: 4.9, 
    rating_count: 89,
    verified: true,
    photo_url: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=150",
    bio: "Experienced chef offering cooking classes specializing in Filipino and international cuisine.",
    location: "Quezon City, Metro Manila"
  },
  { 
    id: "prov_8", 
    display_name: "TechTutor Solutions", 
    rating_avg: 4.7, 
    rating_count: 112,
    verified: true,
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    bio: "IT professionals providing computer and technology tutoring for all skill levels.",
    location: "BGC, Taguig City"
  },
  { 
    id: "prov_9", 
    display_name: "FitLife Personal Training", 
    rating_avg: 4.6, 
    rating_count: 67,
    verified: false,
    photo_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150",
    bio: "Certified personal trainers offering fitness coaching and workout plans.",
    location: "Pasig City, Metro Manila"
  },
];

export const SERVICES: HelpoService[] = [
  {
    id: 'aircon-repair',
    name: 'Aircon Repair',
    category: 'Repair',
    description:
      'Professional diagnostic and repair service for split-type and window air conditioners. Our certified technicians will identify issues and provide quality repairs to restore your cooling system.',
    price_from: 75,
    duration_mins: 90,
    tags: ['HVAC', 'AC', 'cooling'],
    provider_id: 'prov_4',
    top_rated: true,
    verified: true,
    next_availability: 'Tomorrow 2:00 PM',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'
    ],
    what_included: [
      'Complete diagnostic inspection',
      'Basic parts and labor (up to ₱200 value)',
      'Performance testing after repair',
      'One-month service warranty',
      'Safety and maintenance tips'
    ],
    requirements: [
      'Access to electrical panel required',
      'Clear pathway to outdoor unit',
      'Someone 18+ must be present during service',
      '24-hour notice required for cancellations'
    ],
    pricing_details: {
      base_price: 75,
      additional_fees: [
        { name: 'Major parts (if needed)', price: 50 },
        { name: 'Weekend service', price: 25 },
        { name: 'Same-day service', price: 35 }
      ]
    },
    reviews: [
      {
        id: 'rev_1',
        reviewer_name: 'Maria Santos',
        reviewer_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2c6b6c6?w=100',
        rating: 5,
        comment: 'Excellent service! Fixed my aircon quickly and explained everything clearly. Very professional.',
        date: '2025-08-20'
      },
      {
        id: 'rev_2',
        reviewer_name: 'John Cruz',
        reviewer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 5,
        comment: 'Great work, arrived on time and the AC is working perfectly now. Highly recommended!',
        date: '2025-08-18'
      },
      {
        id: 'rev_3',
        reviewer_name: 'Lisa Chen',
        rating: 4,
        comment: 'Good service, though took a bit longer than expected. AC is working well now.',
        date: '2025-08-15'
      }
    ]
  },
  {
    id: 'aircon-cleaning',
    name: 'Aircon Cleaning',
    category: 'Cleaning',
    description:
      'Deep cleaning service for indoor and outdoor AC units to improve cooling efficiency and air quality. Includes filter cleaning, coil cleaning, and sanitization.',
    price_from: 60,
    duration_mins: 75,
    tags: ['HVAC', 'maintenance'],
    provider_id: 'prov_4',
    verified: true,
    next_availability: 'Today 4:30 PM',
    images: [
      'https://images.unsplash.com/photo-1558618047-b1a5c1b8a9b6?w=800',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800'
    ],
    what_included: [
      'Indoor unit deep cleaning',
      'Filter cleaning and replacement check',
      'Coil cleaning and sanitization',
      'Drain cleaning and inspection',
      'Performance optimization tips'
    ],
    requirements: [
      'Power source near AC unit',
      'Clear access to both indoor and outdoor units',
      'Basic cleaning supplies provided'
    ],
    pricing_details: {
      base_price: 60,
      additional_fees: [
        { name: 'Filter replacement (if needed)', price: 15 },
        { name: 'Additional outdoor unit', price: 30 }
      ]
    },
    reviews: [
      {
        id: 'rev_4',
        reviewer_name: 'Robert Kim',
        reviewer_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: 5,
        comment: 'Amazing difference in air quality! Very thorough cleaning service.',
        date: '2025-08-19'
      }
    ]
  },
  {
    id: 'condo-cleaning',
    name: 'Condo Cleaning',
    category: 'Cleaning',
    description:
      'Comprehensive cleaning service for condominiums from studio to 2-bedroom units. Perfect for busy professionals who want their space sparkling clean.',
    price_from: 55,
    duration_mins: 120,
    tags: ['home', 'apartment'],
    provider_id: 'prov_1',
    top_rated: true,
    verified: true,
    next_availability: 'Tomorrow 10:00 AM',
    images: [
      'https://images.unsplash.com/photo-1558618047-be5b6b962e34?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800'
    ],
    what_included: [
      'All rooms dusting and surface cleaning',
      'Floor mopping and vacuuming',
      'Bathroom deep cleaning',
      'Kitchen counters and appliance cleaning',
      'Trash removal and organizing'
    ],
    requirements: [
      'Basic cleaning supplies will be provided',
      'Secure parking or visitor access required',
      'Minimum 2-hour booking for condos'
    ],
    pricing_details: {
      base_price: 55,
      additional_fees: [
        { name: 'Balcony cleaning', price: 15 },
        { name: 'Inside oven/refrigerator', price: 25 },
        { name: 'Window cleaning (interior)', price: 20 }
      ]
    },
    reviews: [
      {
        id: 'rev_5',
        reviewer_name: 'Sarah Johnson',
        reviewer_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        rating: 5,
        comment: 'Jane and her team did an incredible job! My condo has never been cleaner.',
        date: '2025-08-21'
      },
      {
        id: 'rev_6',
        reviewer_name: 'Mike Rivera',
        rating: 5,
        comment: 'Punctual, professional, and thorough. Will definitely book again!',
        date: '2025-08-17'
      }
    ]
  },
  {
    id: 'house-cleaning',
    name: 'House Cleaning',
    category: 'Cleaning',
    description:
      'Complete house cleaning service for multi-room homes. Our experienced team handles everything from bedrooms to common areas with attention to detail.',
    price_from: 85,
    duration_mins: 180,
    tags: ['home', 'deep clean'],
    provider_id: 'prov_1',
    verified: true,
    next_availability: 'Aug 24, 9:00 AM',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800'
    ],
    what_included: [
      'All bedrooms and living areas',
      'Complete kitchen cleaning',
      'Bathroom sanitization',
      'Floor care and vacuuming',
      'Dusting and surface polishing'
    ],
    requirements: [
      'Minimum 3-hour service for houses',
      'Parking space for service vehicle',
      'House key or someone present during service'
    ],
    pricing_details: {
      base_price: 85,
      additional_fees: [
        { name: 'Additional bathroom', price: 20 },
        { name: 'Garage cleaning', price: 30 },
        { name: 'Window cleaning (exterior)', price: 40 }
      ]
    }
  },
  {
    id: 'day-helper',
    name: 'Day Helper',
    category: 'Cleaning',
    description:
      'Flexible hourly helper service for various household tasks, organizing, and errands. Perfect for busy days when you need an extra pair of hands.',
    price_from: 20,
    duration_mins: 60,
    tags: ['chores', 'errands', 'organizing'],
    provider_id: 'prov_3',
    next_availability: 'Today 1:00 PM',
    images: [
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800'
    ],
    what_included: [
      'Hourly flexible assistance',
      'Basic household tasks',
      'Organizing and decluttering',
      'Light errands and shopping',
      'No specialized tools required'
    ],
    requirements: [
      'Minimum 2-hour booking',
      'Tasks must be safe and reasonable',
      'Materials for specific tasks may need to be provided'
    ],
    pricing_details: {
      base_price: 20,
      additional_fees: [
        { name: 'Transportation for errands', price: 10 },
        { name: 'Heavy lifting tasks', price: 5 }
      ]
    }
  },
  {
    id: 'pet-groomer-home-service',
    name: 'Pet Groomer (Home Service)',
    category: 'Pets',
    description:
      'Professional mobile pet grooming service that comes to your home. Stress-free grooming for cats and dogs in a familiar environment.',
    price_from: 50,
    duration_mins: 90,
    tags: ['pets', 'grooming', 'mobile'],
    provider_id: 'prov_5',
    top_rated: true,
    verified: true,
    next_availability: 'Tomorrow 11:30 AM',
    images: [
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800'
    ],
    what_included: [
      'Professional bath and blow-dry',
      'Brush and de-shedding treatment',
      'Nail trimming and filing',
      'Ear cleaning and inspection',
      'Breed-specific styling options'
    ],
    requirements: [
      'Pet must be up-to-date on vaccinations',
      'Access to water source and electrical outlet',
      'Pet owner must be present during service',
      'Aggressive pets may require muzzling'
    ],
    pricing_details: {
      base_price: 50,
      additional_fees: [
        { name: 'Large dogs (over 50lbs)', price: 25 },
        { name: 'Flea treatment', price: 20 },
        { name: 'Teeth cleaning add-on', price: 15 }
      ]
    },
    reviews: [
      {
        id: 'rev_7',
        reviewer_name: 'Emma Wilson',
        reviewer_avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=100',
        rating: 5,
        comment: 'My dog loves them! So convenient and professional. Highly recommend.',
        date: '2025-08-20'
      },
      {
        id: 'rev_8',
        reviewer_name: 'David Park',
        rating: 5,
        comment: 'Great service, very gentle with my cat. Will book again!',
        date: '2025-08-16'
      }
    ]
  },
  {
    id: 'basic-house-cleaning',
    name: 'Basic House Cleaning',
    category: 'Cleaning',
    description:
      'Simple and affordable house cleaning service for small homes and apartments. Perfect for regular maintenance cleaning.',
    price_from: 35,
    duration_mins: 90,
    tags: ['affordable', 'basic'],
    provider_id: 'prov_1',
    verified: false, // Not verified
    // No top_rated badge
    next_availability: 'Today 3:00 PM',
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    ],
    what_included: [
      'Sweeping and mopping floors',
      'Basic dusting of surfaces',
      'Trash removal',
      'Quick bathroom wipe-down'
    ],
    requirements: [
      'Basic supplies provided by customer',
      'Access to cleaning supplies storage'
    ],
    pricing_details: {
      base_price: 35,
      additional_fees: [
        { name: 'Deep cleaning add-on', price: 20 },
        { name: 'Window cleaning', price: 15 }
      ]
    }
  },
  {
    id: 'emergency-plumbing',
    name: 'Emergency Plumbing Repair',
    category: 'Repair',
    description:
      'Fast response plumbing service for urgent repairs. Available 24/7 for emergencies like leaks, clogs, and pipe bursts.',
    price_from: 120,
    duration_mins: 60,
    tags: ['emergency', '24/7', 'urgent'],
    provider_id: 'prov_2',
    verified: true,
    // No top_rated for variety
    next_availability: 'Available 24/7',
    images: [
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'
    ],
    what_included: [
      'Emergency diagnosis',
      'Basic repair labor',
      'Standard parts (up to ₱300 value)',
      '24/7 availability',
      'Follow-up service call if needed'
    ],
    requirements: [
      'Immediate availability required',
      'Access to main water shutoff',
      'Emergency surcharge applies after hours'
    ],
    pricing_details: {
      base_price: 120,
      additional_fees: [
        { name: 'After hours (6PM-6AM)', price: 50 },
        { name: 'Weekend/Holiday service', price: 75 },
        { name: 'Major parts (if needed)', price: 100 }
      ]
    }
  },
  {
    id: 'dog-walking',
    name: 'Professional Dog Walking',
    category: 'Pets',
    description:
      'Reliable dog walking service for busy pet owners. Individual or group walks available with experienced dog handlers.',
    price_from: 25,
    duration_mins: 30,
    tags: ['daily', 'exercise', 'outdoor'],
    provider_id: 'prov_5',
    top_rated: false, // Explicitly not top rated
    verified: true,
    next_availability: 'Tomorrow 8:00 AM',
    images: [
      'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=800',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'
    ],
    what_included: [
      '30-minute neighborhood walk',
      'Fresh water refill',
      'Basic waste cleanup',
      'Photo updates during walk',
      'Secure leash and collar check'
    ],
    requirements: [
      'Dog must be leash-trained',
      'Up-to-date vaccination records required',
      'Aggressive dogs not accepted',
      '24-hour cancellation policy'
    ],
    pricing_details: {
      base_price: 25,
      additional_fees: [
        { name: 'Additional dogs', price: 10 },
        { name: 'Extended walk (60min)', price: 15 },
        { name: 'Weekend premium', price: 5 }
      ]
    }
  },
  {
    id: 'piano-lessons',
    name: 'Piano Lessons',
    category: 'Lessons',
    description:
      'Learn piano with experienced instructors. From beginner basics to advanced techniques, personalized lessons for all ages and skill levels.',
    price_from: 80,
    duration_mins: 60,
    tags: ['music', 'piano', 'beginner-friendly'],
    provider_id: 'prov_6',
    top_rated: true,
    verified: true,
    next_availability: 'Tomorrow 2:00 PM',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800',
      'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800'
    ],
    what_included: [
      'One-on-one personalized instruction',
      'Music theory fundamentals',
      'Sheet music and practice materials',
      'Performance techniques and tips',
      'Progress tracking and feedback'
    ],
    requirements: [
      'Piano or keyboard access required',
      'Quiet practice space needed',
      'Regular practice commitment expected',
      'Music stand and metronome helpful'
    ],
    pricing_details: {
      base_price: 80,
      additional_fees: [
        { name: 'Music books and materials', price: 25 },
        { name: 'Recital participation', price: 15 },
        { name: 'Extended lesson (90min)', price: 40 }
      ]
    },
    reviews: [
      {
        id: 'rev_piano_1',
        reviewer_name: 'Anna Chen',
        reviewer_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2c6b6c6?w=100',
        rating: 5,
        comment: 'Amazing teacher! My daughter went from zero to playing beautiful pieces in just 3 months.',
        date: '2025-08-20'
      },
      {
        id: 'rev_piano_2',
        reviewer_name: 'Michael Torres',
        rating: 5,
        comment: 'Patient and knowledgeable instructor. Highly recommend for adult beginners!',
        date: '2025-08-18'
      }
    ]
  },
  {
    id: 'cooking-classes',
    name: 'Filipino Cooking Classes',
    category: 'Lessons',
    description:
      'Learn to cook authentic Filipino dishes with Chef Maria. From adobo to lechon, master traditional recipes and cooking techniques.',
    price_from: 100,
    duration_mins: 180,
    tags: ['cooking', 'filipino cuisine', 'hands-on'],
    provider_id: 'prov_7',
    top_rated: true,
    verified: true,
    next_availability: 'This Saturday 10:00 AM',
    images: [
      'https://images.unsplash.com/photo-1556909114-4c40fa4ce721?w=800',
      'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
    ],
    what_included: [
      'All ingredients and cooking materials',
      'Step-by-step recipe instruction',
      'Hands-on cooking experience',
      'Recipe cards to take home',
      'Meal tasting and feedback session'
    ],
    requirements: [
      'Apron recommended (provided if needed)',
      'Closed-toe shoes required',
      'Food allergies must be disclosed',
      'Minimum age 12 for safety'
    ],
    pricing_details: {
      base_price: 100,
      additional_fees: [
        { name: 'Private one-on-one class', price: 50 },
        { name: 'Take-home ingredients', price: 30 },
        { name: 'Recipe book collection', price: 25 }
      ]
    },
    reviews: [
      {
        id: 'rev_cook_1',
        reviewer_name: 'Luis Reyes',
        reviewer_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: 5,
        comment: 'Chef Maria is incredible! Finally learned how to make proper adobo like my lola.',
        date: '2025-08-19'
      }
    ]
  },
  {
    id: 'computer-tutoring',
    name: 'Computer & Tech Tutoring',
    category: 'Lessons',
    description:
      'Learn computer basics, software applications, or advanced tech skills. Perfect for seniors, students, or career changers.',
    price_from: 60,
    duration_mins: 90,
    tags: ['computer', 'technology', 'senior-friendly'],
    provider_id: 'prov_8',
    verified: true,
    // No top_rated for variety
    next_availability: 'Tomorrow 1:00 PM',
    images: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'
    ],
    what_included: [
      'Personalized lesson plan',
      'Hands-on computer practice',
      'Software installation help',
      'Basic troubleshooting skills',
      'Practice exercises and materials'
    ],
    requirements: [
      'Computer or laptop access needed',
      'Stable internet connection',
      'Patience and willingness to learn',
      'Note-taking materials helpful'
    ],
    pricing_details: {
      base_price: 60,
      additional_fees: [
        { name: 'Software setup assistance', price: 20 },
        { name: 'Group lesson (2-3 people)', price: -15 },
        { name: 'Weekend sessions', price: 10 }
      ]
    }
  },
  {
    id: 'guitar-lessons',
    name: 'Acoustic Guitar Lessons',
    category: 'Lessons',
    description:
      'Learn acoustic guitar from scratch or improve your existing skills. Covers chords, strumming patterns, and popular songs.',
    price_from: 70,
    duration_mins: 60,
    tags: ['guitar', 'music', 'acoustic'],
    provider_id: 'prov_6',
    verified: true,
    next_availability: 'Today 4:00 PM',
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
    ],
    what_included: [
      'Guitar basics and proper posture',
      'Chord progressions and theory',
      'Strumming and picking techniques',
      'Popular song tutorials',
      'Practice sheet music'
    ],
    requirements: [
      'Guitar access required (acoustic preferred)',
      'Guitar picks and tuner helpful',
      'Quiet practice space',
      'Regular practice commitment'
    ],
    pricing_details: {
      base_price: 70,
      additional_fees: [
        { name: 'Guitar rental per session', price: 15 },
        { name: 'Songbook collection', price: 20 }
      ]
    }
  },
  {
    id: 'fitness-training',
    name: 'Personal Fitness Training',
    category: 'Lessons',
    description:
      'Get in shape with personalized fitness coaching. Weight loss, muscle building, or general fitness - customized to your goals.',
    price_from: 90,
    duration_mins: 60,
    tags: ['fitness', 'health', 'weight-loss'],
    provider_id: 'prov_9',
    verified: false,
    next_availability: 'Tomorrow 6:00 AM',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      'https://images.unsplash.com/photo-1549476464-37392f717541?w=800'
    ],
    what_included: [
      'Fitness assessment and goal setting',
      'Customized workout plan',
      'Proper form and technique coaching',
      'Nutrition guidance basics',
      'Progress tracking and adjustments'
    ],
    requirements: [
      'Comfortable workout clothes',
      'Water bottle and towel',
      'Medical clearance if needed',
      'Gym access or home workout space'
    ],
    pricing_details: {
      base_price: 90,
      additional_fees: [
        { name: 'Nutrition meal plan', price: 35 },
        { name: 'Home gym equipment loan', price: 25 },
        { name: 'Progress photos and tracking', price: 15 }
      ]
    }
  },
];

// Mock favorites data (simulating a user with ID 'user_1')
export const FAVORITES: Favorite[] = [
  {
    id: 'fav_1',
    user_id: 'user_1',
    service_id: 'aircon-repair',
    created_at: '2025-08-21T10:30:00Z'
  },
  {
    id: 'fav_2',
    user_id: 'user_1',
    service_id: 'condo-cleaning',
    created_at: '2025-08-20T15:45:00Z'
  },
  {
    id: 'fav_3',
    user_id: 'user_1',
    service_id: 'pet-groomer-home-service',
    created_at: '2025-08-19T09:15:00Z'
  }
];

// Mock bookings data (simulating a user with ID 'user_1')
export const BOOKINGS: Booking[] = [
  {
    id: 'booking_1',
    user_id: 'user_1',
    service_id: 'plumbing-001',
    provider_id: 'prov_2',
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    location: '123 Main St, Downtown, Manila',
    status: 'confirmed',
    total_price: 125,
    notes: 'Leaking faucet in the kitchen',
    number_of_people: 1,
    payment_method_id: 'card_1',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking_2',
    user_id: 'user_1',
    service_id: 'condo-cleaning',
    provider_id: 'prov_1',
    scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    location: '456 Oak Ave, Midtown, Makati',
    status: 'pending',
    total_price: 95,
    notes: 'Deep cleaning for entire 2BR condo',
    number_of_people: 1,
    payment_method_id: 'paypal_1',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking_3',
    user_id: 'user_1',
    service_id: 'aircon-cleaning',
    provider_id: 'prov_4',
    scheduled_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    location: '789 Pine Rd, Suburbs, Quezon City',
    status: 'completed',
    total_price: 60,
    notes: 'AC cleaning and maintenance service',
    number_of_people: 1,
    payment_method_id: 'card_1',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking_4',
    user_id: 'user_1',
    service_id: 'dog-walking',
    provider_id: 'prov_5',
    scheduled_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    status: 'confirmed',
    total_price: 45,
    notes: 'Evening walk for small dog',
    number_of_people: 1,
    payment_method_id: 'card_1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking_5',
    user_id: 'user_1',
    service_id: 'pet-groomer-home-service',
    provider_id: 'prov_6',
    scheduled_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    status: 'canceled',
    total_price: 80,
    notes: 'Pet grooming for small dog - canceled due to pet illness',
    number_of_people: 1,
    payment_method_id: 'card_1',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking_6',
    user_id: 'user_1',
    service_id: 'aircon-repair',
    provider_id: 'prov_3',
    scheduled_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    location: '321 Elm St, BGC, Taguig',
    status: 'completed',
    total_price: 150,
    notes: 'AC not cooling properly - fixed refrigerant leak',
    number_of_people: 1,
    payment_method_id: 'card_1',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking_7',
    user_id: 'user_1',
    service_id: 'piano-lessons',
    provider_id: 'prov_6',
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    location: 'MusicMaestro Academy, Makati City',
    status: 'confirmed',
    total_price: 80,
    notes: 'Beginner level - complete novice, wants to learn classical pieces',
    number_of_people: 1,
    payment_method_id: 'card_1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking_8',
    user_id: 'user_1',
    service_id: 'cooking-classes',
    provider_id: 'prov_7',
    scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Next weekend
    location: "Chef Maria's Kitchen, Quezon City",
    status: 'pending',
    total_price: 130,
    notes: 'Interested in learning traditional Filipino dishes - adobo and sinigang',
    number_of_people: 2,
    payment_method_id: 'gcash_1',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];
