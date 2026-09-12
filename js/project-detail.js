/**
 * DIAMORA PROPERTIES — SINGLE OFF-PLAN PROJECT DETAIL CONTROLLER
 * Full dynamic hydration from API / LocalStorage, Leaflet map,
 * gallery lightbox, milestone schedules, and VIP consultation lead capture.
 */

function getDiamoraApiEndpoint() {
  const custom = localStorage.getItem('diamora_api_endpoint');
  if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin + '/api';
  }
  return 'http://localhost:5000/api';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const FALLBACK_PROJECTS = [
  {
    _id: 'the-row-saadiyat',
    title: 'The Row Saadiyat',
    slug: 'the-row-saadiyat',
    tagline: 'Live front row in the heart of Saadiyat Cultural District',
    developer: 'Aldar Properties',
    developerLogo: 'https://herorealestate.ae/wp-content/uploads/2024/01/Nikki-Beach-Residences-Aldar-Properties-Logo.png',
    location: 'Saadiyat Cultural District, Saadiyat Island, Abu Dhabi',
    city: 'Abu Dhabi',
    startingPrice: 3700000,
    currency: 'AED',
    handoverDate: '29 January 2030',
    paymentPlan: '65/35 Milestone Plan',
    downPayment: '5%',
    propertyTypes: ['Luxury Apartments', 'Residences with Maid & Study'],
    bedrooms: '1 to 3 Bedrooms + Maid + Study',
    status: 'New Launch',
    isFeatured: true,
    permitNumber: '20250000657884',
    ownership: '100% Freehold - All Nationalities',
    masterPlanImage: 'https://herorealestate.ae/wp-content/uploads/therow_saadiyat_location_banner.webp',
    masterPlanDescription: 'The Row Saadiyat is an impeccably planned urban cultural masterwork. Designed around pedestrian connectivity, lush biophilic courtyards, subterranean valet networks, and shaded avenues directly connecting to Saadiyat Grove and the museum esplanade.',
    heroImage: 'https://herorealestate.ae/wp-content/uploads/07b-scaled.jpg',
    gallery: [
      'https://herorealestate.ae/wp-content/uploads/07b-scaled.jpg',
      'https://herorealestate.ae/wp-content/uploads/08-1-scaled.jpg',
      'https://herorealestate.ae/wp-content/uploads/10-7-scaled.jpg',
      'https://herorealestate.ae/wp-content/uploads/06b-scaled.jpg',
      'https://herorealestate.ae/wp-content/uploads/01-2-scaled.jpg',
      'https://herorealestate.ae/wp-content/uploads/11-2-scaled.jpg',
      'https://herorealestate.ae/wp-content/uploads/4403_Lifestyle-District_Int_Amenities_Co-Working_Final_CT-scaled.jpg',
      'https://herorealestate.ae/wp-content/uploads/4403_Lifestyle-District_Int_Amenities_Kids-Room_Final_TL_HR-scaled.jpg',
      'https://herorealestate.ae/wp-content/uploads/4403_Lifestyle-District_Int_Amenities_Lobby_01_Final_LDCT_HR-scaled.jpg',
      'https://herorealestate.ae/wp-content/uploads/4403_Lifestyle-District_Int_Amenities_Lobby_02_FINAL_LDCT_HR-scaled.jpg'
    ],
    description: `Live front row in the heart of Saadiyat Cultural District. The Row Saadiyat by Aldar Properties redefines modern island living, blending art, architecture, and wellness into an extraordinary community. Located steps from the iconic Louvre Abu Dhabi, Guggenheim Abu Dhabi, and Zayed National Museum, this masterwork offers shaded, climate-controlled pedestrian pathways, curated retail, world-class dining, and lush botanical parks. Across 9 mid-rise residential buildings totaling 717 residences, every home is finished to international luxury standards with panoramic glazing, expansive terraces, and bespoke interiors.`,
    highlights: [
      'Prime position within Saadiyat Cultural District steps from Louvre Abu Dhabi, Guggenheim Abu Dhabi & Zayed National Museum',
      '100% Freehold ownership for all nationalities with guaranteed 10-Year UAE Golden Visa eligibility',
      'Shaded, climate-controlled pedestrian retail boulevards, artisan florists, and gourmet dining',
      'Comprehensive wellness ecosystems including boutique reformer pilates, pet spa, members club, and resort pools',
      'Official Abu Dhabi DMT Permit Number: 20250000657884'
    ],
    amenities: [
      'Pet Spa & Grooming Salon',
      'Gourmet Cafés & Destination Restaurants',
      'Co-Working Lounges & Private Members Club',
      'Gourmet Organic Supermarket',
      'Boutique Fitness & Reformer Pilates Studios',
      'Artisan Retail Boutiques & Florists',
      'Resort-Style Swimming Pools & Sun Decks',
      '24/7 White-Glove Concierge & Valet Service',
      'Dedicated Children’s Imaginative Playrooms',
      'Climate-Controlled Pedestrian Walkways'
    ],
    unitTypes: [
      {
        name: '1-Bedroom Luxury Apartment',
        bedrooms: '1 Bedroom',
        sizeSqFt: '958 Sq.Ft (Avg 89 sqm)',
        startingPrice: 3700000,
        floorPlanImage: 'https://herorealestate.ae/wp-content/uploads/07b-scaled.jpg'
      },
      {
        name: '2-Bedroom Luxury Residence',
        bedrooms: '2 Bedrooms',
        sizeSqFt: '1,496 Sq.Ft (Avg 139 sqm)',
        startingPrice: 5800000,
        floorPlanImage: 'https://herorealestate.ae/wp-content/uploads/08-1-scaled.jpg'
      },
      {
        name: '2-Bedroom + Maid Residence',
        bedrooms: '2 Bedrooms + Maid',
        sizeSqFt: '2,239 Sq.Ft (Avg 208 sqm)',
        startingPrice: 7800000,
        floorPlanImage: 'https://herorealestate.ae/wp-content/uploads/10-7-scaled.jpg'
      },
      {
        name: '2-Bedroom + Maid + Study',
        bedrooms: '2 Bedrooms + Maid + Study',
        sizeSqFt: '2,476 Sq.Ft (Avg 230 sqm)',
        startingPrice: 8500000,
        floorPlanImage: 'https://herorealestate.ae/wp-content/uploads/06b-scaled.jpg'
      },
      {
        name: '3-Bedroom + Maid + Study',
        bedrooms: '3 Bedrooms + Maid + Study',
        sizeSqFt: '2,895 Sq.Ft (Avg 269 sqm)',
        startingPrice: 11500000,
        floorPlanImage: 'https://herorealestate.ae/wp-content/uploads/01-2-scaled.jpg'
      },
      {
        name: '3-Bedroom + Maid + Study (Large)',
        bedrooms: '3 Bedrooms + Maid + Study Large',
        sizeSqFt: '4,801 Sq.Ft (Avg 446 sqm)',
        startingPrice: 16000000,
        floorPlanImage: 'https://herorealestate.ae/wp-content/uploads/11-2-scaled.jpg'
      }
    ],
    unitsTable: [
      { unitType: '1-Bedroom', avgGsaSqm: '89 sqm', avgGsaSqft: '958 sq.ft', balconySqm: '19 sqm', balconySqft: '204 sq.ft', startingPrice: 'AED 3.7M' },
      { unitType: '2-Bedroom', avgGsaSqm: '139 sqm', avgGsaSqft: '1,496 sq.ft', balconySqm: '31 sqm', balconySqft: '333 sq.ft', startingPrice: 'AED 5.8M' },
      { unitType: '2-Bedroom + Maid', avgGsaSqm: '208 sqm', avgGsaSqft: '2,239 sq.ft', balconySqm: '64 sqm', balconySqft: '688 sq.ft', startingPrice: 'AED 7.8M' },
      { unitType: '2-Bedroom + Maid + Study', avgGsaSqm: '230 sqm', avgGsaSqft: '2,476 sq.ft', balconySqm: '64 sqm', balconySqft: '688 sq.ft', startingPrice: 'AED 8.5M' },
      { unitType: '3-Bedroom + Maid + Study', avgGsaSqm: '269 sqm', avgGsaSqft: '2,895 sq.ft', balconySqm: '71 sqm', balconySqft: '764 sq.ft', startingPrice: 'AED 11.5M' },
      { unitType: '3-Bedroom + Maid + Study (Large)', avgGsaSqm: '446 sqm', avgGsaSqft: '4,801 sq.ft', balconySqm: '202 sqm', balconySqft: '2,174 sq.ft', startingPrice: 'AED 16.0M' }
    ],
    paymentMilestones: [
      { milestone: '1st Installment (Booking)', percentage: 5, notes: 'On Booking' },
      { milestone: '2nd Installment', percentage: 5, notes: '31 May 2026' },
      { milestone: '3rd Installment', percentage: 10, notes: '31 January 2027' },
      { milestone: '4th Installment', percentage: 15, notes: '31 August 2027' },
      { milestone: '5th Installment', percentage: 15, notes: '30 April 2028' },
      { milestone: '6th Installment', percentage: 15, notes: '30 November 2028' },
      { milestone: 'Final Installment (Handover)', percentage: 35, notes: '29 January 2030 (Key Handover)' }
    ],
    investmentTabs: [
      {
        title: 'Capital Growth Potential',
        content: 'Saadiyat Island continues to outperform the wider UAE luxury residential market, with year-on-year capital appreciation exceeding 18% in the Cultural District. With finite island topography, world-class museum epics, and strictly regulated master developments by Aldar, supply remains strictly limited while global sovereign and ultra-high-net-worth capital flows accelerate.',
        points: [
          'High international demand driven by global brand status and architectural prestige',
          'Finite beachfront and cultural district land reserves ensuring long-term rarity',
          'Sustained capital appreciation exceeding prime metropolitan averages across Abu Dhabi'
        ]
      },
      {
        title: 'Rental Opportunities',
        content: 'Residences in the Cultural District command premium yields ranging from 6.5% to 8.5% net per annum. Driven by high-earning expatriates, university faculty from NYU Abu Dhabi, museum curators, corporate executives, and affluent cultural tourists, occupancy rates consistently rank among the highest in the UAE.',
        points: [
          'Robust short-term luxury holiday home yields during museum exhibitions and major festivals',
          'Consistent long-term corporate and diplomatic tenant demand',
          'High retention rates and minimal vacant turnover for premium Aldar master assets'
        ]
      }
    ],
    lifestyleCategories: [
      {
        category: 'Cultural & Beach',
        items: [
          { name: 'Saadiyat Beach & Beach Club', time: '3 Mins' },
          { name: 'Louvre Abu Dhabi', time: '5 Mins' },
          { name: 'Guggenheim Abu Dhabi', time: '6 Mins' },
          { name: 'Zayed National Museum', time: '7 Mins' }
        ]
      },
      {
        category: 'Retail & Leisure',
        items: [
          { name: 'Mamsha Al Saadiyat Promenade', time: '4 Mins' },
          { name: 'Saadiyat Grove Mall & Dining', time: '5 Mins' },
          { name: 'The Collection Saadiyat', time: '6 Mins' },
          { name: 'Galleria Mall (Al Maryah Island)', time: '15 Mins' }
        ]
      },
      {
        category: 'Education',
        items: [
          { name: 'Cranleigh Abu Dhabi', time: '4 Mins' },
          { name: 'Redwood Montessori Nursery', time: '5 Mins' },
          { name: 'New York University Abu Dhabi (NYU AD)', time: '6 Mins' }
        ]
      },
      {
        category: 'Healthcare & Wellness',
        items: [
          { name: 'Cleveland Clinic Abu Dhabi', time: '15 Mins' },
          { name: 'Burjeel Medical City', time: '20 Mins' }
        ]
      },
      {
        category: 'Connectivity & Transit',
        items: [
          { name: 'Downtown Abu Dhabi', time: '15 Mins' },
          { name: 'Zayed International Airport (AUH)', time: '25 Mins' },
          { name: 'Dubai via E11 Sheikh Zayed Rd', time: '55 Mins' }
        ]
      }
    ],
    connectivity: [
      { destination: 'Saadiyat Beach', durationMinutes: 3 },
      { destination: 'Louvre Abu Dhabi', durationMinutes: 5 },
      { destination: 'Saadiyat Grove', durationMinutes: 5 },
      { destination: 'NYU Abu Dhabi', durationMinutes: 6 },
      { destination: 'Downtown Abu Dhabi', durationMinutes: 15 },
      { destination: 'Zayed International Airport (AUH)', durationMinutes: 25 }
    ],
    coordinates: { lat: 24.5332, lng: 54.4027 },
    faqs: [
      {
        question: 'What is The Row Saadiyat?',
        answer: 'The Row Saadiyat is an ultra-prime residential development by Aldar Properties located in the prestigious Saadiyat Cultural District, Abu Dhabi, featuring 717 luxury residences across 9 mid-rise buildings.'
      },
      {
        question: 'Where is The Row Saadiyat located?',
        answer: 'It is situated in the Saadiyat Cultural District on Saadiyat Island, Abu Dhabi, within walking distance of Louvre Abu Dhabi, Guggenheim Abu Dhabi, and Zayed National Museum.'
      },
      {
        question: 'Who is the developer of The Row Saadiyat?',
        answer: 'The project is developed by Aldar Properties, the premier listed master developer in Abu Dhabi with an internationally acclaimed delivery track record.'
      },
      {
        question: 'What property types and unit layouts are available?',
        answer: 'The development offers 1, 2, and 3-bedroom luxury apartments, including configurations with maid’s rooms and private study layouts, ranging up to 4,801 sq.ft.'
      },
      {
        question: 'What is the starting price for residences at The Row Saadiyat?',
        answer: 'Starting prices begin at AED 3,700,000 for 1-bedroom luxury apartments.'
      },
      {
        question: 'What is the payment plan for The Row Saadiyat?',
        answer: 'An attractive 65/35 milestone payment plan is offered: 5% on booking, 60% across construction milestones, and the remaining 35% on handover.'
      },
      {
        question: 'When is the expected handover date?',
        answer: 'Handover is scheduled for 29 January 2030 (Q1 2030).'
      },
      {
        question: 'Can foreign buyers purchase property at The Row Saadiyat?',
        answer: 'Yes, The Row Saadiyat is designated as a 100% freehold investment zone, permitting full ownership for all nationalities.'
      },
      {
        question: 'Does purchasing at The Row Saadiyat qualify for the UAE Golden Visa?',
        answer: 'Yes, all units exceed the AED 2,000,000 threshold, qualifying purchasers and their immediate families for the 10-Year UAE Golden Visa.'
      },
      {
        question: 'What is the official DMT project permit number?',
        answer: 'The official Abu Dhabi Department of Municipalities and Transport permit number is 20250000657884.'
      }
    ]
  },
  {
    _id: 'sobha-city-abu-dhabi',
    title: 'Sobha City Abu Dhabi',
    slug: 'sobha-city-abu-dhabi',
    tagline: 'Luxury Apartments, Villas & Townhouses by Sobha Realty',
    developer: 'Sobha Realty',
    developerLogo: 'https://herorealestate.ae/wp-content/uploads/2025/05/logo-shouba-hartland-II.png',
    location: 'Al Shamkha, Abu Dhabi',
    city: 'Abu Dhabi',
    startingPrice: 1500000,
    currency: 'AED',
    handoverDate: 'Q4 2027',
    paymentPlan: '60/40 Flexible Milestone Plan',
    downPayment: '10%',
    propertyTypes: ['Apartments', 'Villas', 'Townhouses'],
    bedrooms: '1 to 5 Bedrooms',
    status: 'New Launch',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'
    ],
    description: `Sobha City Abu Dhabi is an ambitious master-planned residential community by Sobha Realty, spanning over millions of square feet with lush greenery, crystal lagoons, and state-of-the-art architecture. Designed for discerning families and international investors, this landmark development balances natural sanctuary with high-speed metropolitan connectivity. Every residence features Sobha's signature backward-integrated craftsmanship, premium European finishes, floor-to-ceiling panoramic glass, and expansive private terraces.`,
    highlights: [
      'Prime location in Al Shamkha with direct highway access to Downtown Abu Dhabi & Dubai',
      'Swimmable crystal lagoons spanning over 250,000 sq.ft with white sand beaches',
      'Extensive green corridors, cycling tracks, and integrated wellness parks',
      'Freehold ownership available for all nationalities with 10-Year UAE Golden Visa eligibility'
    ],
    amenities: [
      'Crystal Swimmable Lagoon',
      'Private Beach Club & Cabanas',
      'State-of-the-Art Fitness Center',
      'Infinity Lap Pools',
      'Luxury Spa & Wellness Haven',
      'Dedicated Kids Splash Park',
      'Waterfront Dining Promenade',
      '24/7 Concierge & Valet Service'
    ],
    unitTypes: [
      {
        name: '1-Bedroom Luxury Apartment',
        bedrooms: '1 Bedroom',
        sizeSqFt: '780 - 950 Sq.Ft',
        startingPrice: 1500000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
      },
      {
        name: '2-Bedroom Waterfront Suite',
        bedrooms: '2 Bedrooms',
        sizeSqFt: '1,250 - 1,480 Sq.Ft',
        startingPrice: 2200000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
      },
      {
        name: '3-Bedroom Executive Townhome',
        bedrooms: '3 Bedrooms',
        sizeSqFt: '2,400 - 2,850 Sq.Ft',
        startingPrice: 3800000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
      },
      {
        name: '4-Bedroom Signature Villa',
        bedrooms: '4 Bedrooms',
        sizeSqFt: '4,200 - 5,100 Sq.Ft',
        startingPrice: 6500000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
      }
    ],
    paymentMilestones: [
      { milestone: 'Booking Deposit', percentage: 10, notes: 'Immediate upon reservation' },
      { milestone: 'During Construction', percentage: 50, notes: 'Linked to construction progress over 36 months' },
      { milestone: 'On Final Handover', percentage: 40, notes: 'Q4 2027 completion' }
    ],
    connectivity: [
      { destination: 'Abu Dhabi International Airport (AUH)', durationMinutes: 12 },
      { destination: 'Yas Island & Ferrari World', durationMinutes: 18 },
      { destination: 'Saadiyat Island Cultural District', durationMinutes: 25 },
      { destination: 'Downtown Dubai via E11', durationMinutes: 55 }
    ],
    coordinates: { lat: 24.3644, lng: 54.7072 },
    faqs: [
      {
        question: 'Is Sobha City Abu Dhabi open to foreign buyers?',
        answer: 'Yes, Sobha City is designated as an investment zone offering 100% freehold ownership to all nationalities.'
      },
      {
        question: 'Does buying a home in Sobha City qualify for the UAE Golden Visa?',
        answer: 'Yes, any property purchase exceeding AED 2,000,000 qualifies the primary buyer and immediate family members for the 10-Year UAE Golden Visa.'
      },
      {
        question: 'What is the escrow bank protection for off-plan buyers?',
        answer: 'All payments are deposited directly into a project-specific Escrow Account regulated by the Abu Dhabi Department of Municipalities and Transport (DMT), strictly disbursed as construction milestones are verified.'
      }
    ]
  },
  {
    _id: 'tilal-binghatti-dubai',
    title: 'Tilal Binghatti Dubai',
    slug: 'tilal-binghatti-dubai',
    tagline: 'Futuristic Architectural Masterpiece in Al Jaddaf',
    developer: 'Binghatti Developers',
    developerLogo: 'https://herorealestate.ae/wp-content/uploads/2025/08/Binghatti-Ivory.svg',
    location: 'Al Jaddaf Waterfront, Dubai',
    city: 'Dubai',
    startingPrice: 1100000,
    currency: 'AED',
    handoverDate: 'Q2 2026',
    paymentPlan: '70/30 Easy Installment Plan',
    downPayment: '20%',
    propertyTypes: ['Luxury Suites', 'Penthouses'],
    bedrooms: '1 to 3 Bedrooms',
    status: 'Under Construction',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80'
    ],
    description: `Tilal Binghatti represents avant-garde sculptural living overlooking the Dubai Creek and the iconic Downtown skyline. Designed with geometric weaves, signature champagne gold metallic facets, and energy-efficient building envelopes, the development sets a new benchmark in urban luxury.`,
    highlights: [
      'Unobstructed Dubai Creek & Burj Khalifa vistas',
      'Smart-home automation integrated in all residences',
      'Minutes from DIFC, Downtown Dubai & DXB Airport',
      'High anticipated rental yield exceeding 8.5% ROI'
    ],
    amenities: [
      'Skyline Infinity Pool',
      'Jacuzzi & Sun Loungers',
      'High-Tech Gymnasium',
      'Paddle Tennis Court',
      'Smart Home Concierge',
      'Private Residents Lounge'
    ],
    unitTypes: [
      {
        name: '1-Bedroom Executive Suite',
        bedrooms: '1 Bedroom',
        sizeSqFt: '720 - 850 Sq.Ft',
        startingPrice: 1100000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
      },
      {
        name: '2-Bedroom Skyline Residence',
        bedrooms: '2 Bedrooms',
        sizeSqFt: '1,150 - 1,350 Sq.Ft',
        startingPrice: 1750000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
      },
      {
        name: '3-Bedroom Royal Sky Duplex',
        bedrooms: '3 Bedrooms',
        sizeSqFt: '2,100 - 2,600 Sq.Ft',
        startingPrice: 3200000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
      }
    ],
    paymentMilestones: [
      { milestone: 'Down Payment', percentage: 20, notes: 'On Booking' },
      { milestone: 'During Construction', percentage: 50, notes: 'Installments linked to structural build' },
      { milestone: 'On Handover', percentage: 30, notes: 'Q2 2026 Key Handover' }
    ],
    connectivity: [
      { destination: 'Downtown Dubai & Burj Khalifa', durationMinutes: 8 },
      { destination: 'Dubai International Airport (DXB)', durationMinutes: 10 },
      { destination: 'DIFC Financial Centre', durationMinutes: 10 },
      { destination: 'Dubai Marina & JBR', durationMinutes: 22 }
    ],
    coordinates: { lat: 25.2154, lng: 55.3289 },
    faqs: [
      {
        question: 'What is the construction status of Tilal Binghatti?',
        answer: 'The project is actively under construction with structural works progressing ahead of schedule towards Q2 2026 delivery.'
      },
      {
        question: 'Are residences furnished?',
        answer: 'Units are delivered fully fitted with custom Italian kitchens, designer sanitary fittings, and smart lighting systems.'
      }
    ]
  },
  {
    _id: 'manchester-city-yas-residences',
    title: 'Manchester City Yas Residences',
    slug: 'manchester-city-yas-residences',
    tagline: 'World-First Official Manchester City Branded Living',
    developer: 'Aldar Properties',
    developerLogo: 'https://herorealestate.ae/wp-content/uploads/2024/01/Nikki-Beach-Residences-Aldar-Properties-Logo.png',
    location: 'Yas Island, Abu Dhabi',
    city: 'Abu Dhabi',
    startingPrice: 1950000,
    currency: 'AED',
    handoverDate: 'Q1 2028',
    paymentPlan: '65/35 Milestone Plan',
    downPayment: '10%',
    propertyTypes: ['Branded Apartments', 'Duplexes'],
    bedrooms: '1 to 4 Bedrooms',
    status: 'New Launch',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'
    ],
    description: `The world's first residential development officially curated in partnership with Manchester City Football Club and Aldar Properties. Located in the heart of Yas Island, residents enjoy branded fitness facilities, elite sports recovery clinics, high-tech football simulation rooms, and VIP hospitality rights.`,
    highlights: [
      'Official MCFC training academy pitch & sports performance clinic',
      'Walking distance to Yas Marina Circuit, Ferrari World & Warner Bros',
      'High-yield rental potential driven by premier Yas Island entertainment',
      'Exclusive owner access to Manchester City VIP matches & global events'
    ],
    amenities: [
      'MCFC Performance Center',
      'Rooftop Sports Bar & Lounge',
      'Resort Pool Deck',
      'E-Gaming Arena',
      'Private Cinema Room',
      'Kids Football Mini-Pitch'
    ],
    unitTypes: [
      {
        name: '1-Bedroom Branded Suite',
        bedrooms: '1 Bedroom',
        sizeSqFt: '820 - 980 Sq.Ft',
        startingPrice: 1950000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
      },
      {
        name: '2-Bedroom Champion Residence',
        bedrooms: '2 Bedrooms',
        sizeSqFt: '1,320 - 1,550 Sq.Ft',
        startingPrice: 2850000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
      },
      {
        name: '3-Bedroom Duplex Penthouse',
        bedrooms: '3 Bedrooms',
        sizeSqFt: '2,600 - 3,200 Sq.Ft',
        startingPrice: 4800000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
      }
    ],
    paymentMilestones: [
      { milestone: 'Down Payment', percentage: 10, notes: 'On Reservation' },
      { milestone: 'Construction Milestones', percentage: 55, notes: '10 installments across 36 months' },
      { milestone: 'On Handover', percentage: 35, notes: 'Q1 2028 Key Handover' }
    ],
    connectivity: [
      { destination: 'Yas Marina & Circuit', durationMinutes: 5 },
      { destination: 'Abu Dhabi International Airport (AUH)', durationMinutes: 10 },
      { destination: 'Saadiyat Island Cultural District', durationMinutes: 15 },
      { destination: 'Downtown Dubai', durationMinutes: 50 }
    ],
    coordinates: { lat: 24.4984, lng: 54.6055 },
    faqs: [
      {
        question: 'Can buyers lease through short-term holiday homes?',
        answer: 'Yes, Yas Island permits holiday home leasing, offering excellent short-term rental yields during F1 and major events.'
      }
    ]
  }
];

let currentProject = null;
let leafletProjectMap = null;

function resolveDeveloperLogo(proj) {
  if (proj && proj.developerLogo && !proj.developerLogo.includes('unsplash.com')) {
    return proj.developerLogo;
  }
  const dev = ((proj && proj.developer) || '').toLowerCase();
  const title = ((proj && proj.title) || '').toLowerCase();
  if (title.includes('mercedes')) return 'https://herorealestate.ae/wp-content/uploads/Mercedes-Benz-Places-logo-2.webp';
  if (title.includes('the wilds') || title.includes('wilds')) return 'https://herorealestate.ae/wp-content/uploads/2025/06/wilds_logo_white_en.webp';
  if (dev.includes('aldar')) return 'https://herorealestate.ae/wp-content/uploads/2024/01/Nikki-Beach-Residences-Aldar-Properties-Logo.png';
  if (dev.includes('sobha')) return 'https://herorealestate.ae/wp-content/uploads/2025/05/logo-shouba-hartland-II.png';
  if (dev.includes('binghatti')) return 'https://herorealestate.ae/wp-content/uploads/2025/08/Binghatti-Ivory.svg';
  if (dev.includes('reportage')) return 'https://herorealestate.ae/wp-content/uploads/2024/01/logo-Reportage-Properties-white.png';
  return '';
}

document.addEventListener('DOMContentLoaded', async () => {
  // Mobile nav is globally handled by main.js
  initStickyNav();
  initModals();

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || params.get('id') || 'sobha-city-abu-dhabi';

  await loadProjectDetail(slug);
  initInquiryForm();
});

function initStickyNav() {
  const stickyNav = document.getElementById('pdetailStickyNav');
  const anchors = document.querySelectorAll('.nav-anchor');

  window.addEventListener('scroll', () => {
    if (!stickyNav) return;
    const heroBottom = document.getElementById('projectHeroSection')?.getBoundingClientRect().bottom || 0;
    if (heroBottom <= 70) {
      stickyNav.classList.add('is-sticky');
    } else {
      stickyNav.classList.remove('is-sticky');
    }

    const mobileBar = document.getElementById('pdetailMobileBar');
    if (mobileBar) {
      if (heroBottom <= 0) {
        mobileBar.classList.add('is-visible');
      } else {
        mobileBar.classList.remove('is-visible');
      }
    }

    // Scrollspy active highlight
    const sections = ['overviewSection', 'gallerySection', 'masterPlanSection', 'unitsSection', 'paymentPlanSection', 'amenitiesSection', 'investmentSection', 'locationSection', 'faqsSection', 'inquireSection'];
    let currentActive = '';

    for (let id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom >= 140) {
          currentActive = id;
          break;
        }
      }
    }

    if (currentActive) {
      anchors.forEach(a => {
        const href = a.getAttribute('href');
        a.classList.toggle('active', href === `#${currentActive}`);
      });
    }
  });
}

function initModals() {
  // Lightbox
  const lightboxModal = document.getElementById('lightboxModal');
  const btnCloseLightbox = document.getElementById('btnCloseLightbox');
  if (btnCloseLightbox && lightboxModal) {
    btnCloseLightbox.addEventListener('click', () => {
      lightboxModal.style.display = 'none';
    });
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) lightboxModal.style.display = 'none';
    });
  }

  // Brochure
  const brochureModal = document.getElementById('brochureModal');
  const btnOpenBrochure = document.getElementById('btnOpenBrochure');
  const btnCloseBrochureModal = document.getElementById('btnCloseBrochureModal');
  const brochureLeadForm = document.getElementById('brochureLeadForm');

  if (btnOpenBrochure && brochureModal) {
    btnOpenBrochure.addEventListener('click', () => {
      brochureModal.style.display = 'flex';
    });
  }

  if (btnCloseBrochureModal && brochureModal) {
    btnCloseBrochureModal.addEventListener('click', () => {
      brochureModal.style.display = 'none';
    });
    brochureModal.addEventListener('click', (e) => {
      if (e.target === brochureModal) brochureModal.style.display = 'none';
    });
  }

  if (brochureLeadForm) {
    brochureLeadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('brochureName').value.trim();
      const email = document.getElementById('brochureEmail').value.trim();
      const phone = document.getElementById('brochurePhone').value.trim();

      // Submit lead to backend
      try {
        const apiBase = getDiamoraApiEndpoint();
        await fetch(`${apiBase}/inquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            type: 'brochure',
            propertyTitle: currentProject?.title || 'Off-Plan Project',
            intent: 'Brochure Download',
            message: `Client requested official brochure for ${currentProject?.title} (${currentProject?.developer})`
          })
        });
      } catch (err) {}

      alert(`Thank you, ${name}. Your brochure request has been received. The brochure has been dispatched to your email.`);
      brochureModal.style.display = 'none';
      brochureLeadForm.reset();

      if (currentProject && currentProject.brochureUrl) {
        window.open(currentProject.brochureUrl, '_blank');
      }
    });
  }
}

async function loadProjectDetail(slugOrId) {
  const apiBase = getDiamoraApiEndpoint();
  try {
    const res = await fetch(`${apiBase}/projects/${encodeURIComponent(slugOrId)}`);
    if (res.ok) {
      const data = await res.json();
      currentProject = data.project || data.data || data;
    }
  } catch (e) {
    console.warn('API error, falling back to local / fallback list', e);
  }

  if (!currentProject) {
    const stored = localStorage.getItem('diamora_projects');
    if (stored) {
      try {
        const list = JSON.parse(stored);
        currentProject = list.find(p => p.slug === slugOrId || p._id === slugOrId);
      } catch (e) {}
    }
  }

  if (!currentProject) {
    currentProject = FALLBACK_PROJECTS.find(p => p.slug === slugOrId || p._id === slugOrId) || FALLBACK_PROJECTS[0];
  }

  renderProjectPage(currentProject);
  loadRelatedProjects(currentProject);
}

function renderProjectPage(proj) {
  // Page Meta & Title
  const titleStr = `${proj.title} by ${proj.developer} | Diamora Properties UAE`;
  document.title = titleStr;
  const pageTitleEl = document.getElementById('pageTitle');
  if (pageTitleEl) pageTitleEl.textContent = titleStr;

  const descEl = document.getElementById('metaDescription');
  if (descEl) descEl.setAttribute('content', proj.tagline || proj.description || '');

  // Breadcrumb
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = proj.title;

  // Hero Image
  const heroImg = document.getElementById('pdetailHeroImg');
  if (heroImg) {
    let src = proj.heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85';
    if (!src.startsWith('http') && !src.startsWith('/')) src = '/' + src;
    heroImg.src = src;
    heroImg.alt = proj.title;
  }

  // Developer Badge
  const devLogo = document.getElementById('pdetailDevLogo');
  const devName = document.getElementById('pdetailDevName');
  if (devName) devName.textContent = proj.developer || 'Master Developer';
  if (devLogo) {
    const logoUrl = resolveDeveloperLogo(proj);
    if (logoUrl) {
      devLogo.src = logoUrl;
      devLogo.style.display = 'inline-block';
      devLogo.onerror = function() { this.style.display = 'none'; };
    } else {
      devLogo.style.display = 'none';
    }
  }

  // Regulatory & Permit Badges
  const permitPill = document.getElementById('pdetailPermitPill');
  const permitNum = document.getElementById('pdetailPermitNum');
  if (permitPill && permitNum) {
    if (proj.permitNumber) {
      permitNum.textContent = proj.permitNumber;
      permitPill.style.display = 'inline-flex';
    } else {
      permitPill.style.display = 'none';
    }
  }

  const ownershipPill = document.getElementById('pdetailOwnershipPill');
  const ownershipText = document.getElementById('pdetailOwnershipText');
  if (ownershipPill && ownershipText) {
    if (proj.ownership) {
      ownershipText.textContent = proj.ownership;
      ownershipPill.style.display = 'inline-flex';
    } else {
      ownershipPill.style.display = 'none';
    }
  }

  // Status Pill
  const statusPill = document.getElementById('pdetailStatusPill');
  if (statusPill) statusPill.textContent = proj.status || 'New Launch';

  // Title & Tagline
  const titleEl = document.getElementById('pdetailTitle');
  if (titleEl) titleEl.textContent = proj.title;

  const taglineEl = document.getElementById('pdetailTagline');
  if (taglineEl) taglineEl.textContent = proj.tagline || `Exclusive off-plan residential development in ${proj.location || proj.city}.`;

  // Quick Info Ribbon
  const priceEl = document.getElementById('pdetailPrice');
  if (priceEl) {
    const p = Number(proj.startingPrice || 0);
    priceEl.textContent = p >= 1000000 ? `AED ${(p / 1000000).toFixed(2)}M` : `AED ${p.toLocaleString()}`;
  }

  const handoverEl = document.getElementById('pdetailHandover');
  if (handoverEl) handoverEl.textContent = proj.handoverDate || 'TBA';

  const paymentPlanEl = document.getElementById('pdetailPaymentPlan');
  if (paymentPlanEl) paymentPlanEl.textContent = proj.paymentPlan || 'Milestone Plan';

  const downPaymentEl = document.getElementById('pdetailDownPayment');
  if (downPaymentEl) downPaymentEl.textContent = proj.downPayment || '10% On Booking';

  const locationEl = document.getElementById('pdetailLocation');
  if (locationEl) locationEl.textContent = proj.location || proj.city || 'UAE';

  const bedroomsEl = document.getElementById('pdetailBedrooms');
  if (bedroomsEl) bedroomsEl.textContent = proj.bedrooms || (Array.isArray(proj.propertyTypes) ? proj.propertyTypes.join(', ') : 'Residences');

  // WhatsApp CTA
  const waBtn = document.getElementById('pdetailWhatsappBtn');
  if (waBtn) {
    const text = encodeURIComponent(`Hello Diamora Properties, I would like VIP details and pricing for ${proj.title} by ${proj.developer}.`);
    waBtn.href = `https://wa.me/971506760668?text=${text}`;
  }

  // Mobile Sticky Bar Price & WhatsApp
  const mobilePriceEl = document.getElementById('mobileBarPrice');
  if (mobilePriceEl) {
    const p = Number(proj.startingPrice || 0);
    mobilePriceEl.textContent = p >= 1000000 ? `AED ${(p / 1000000).toFixed(2)}M` : `AED ${p.toLocaleString()}`;
  }

  const mobileWaBtn = document.getElementById('mobileBarWaBtn');
  if (mobileWaBtn) {
    const text = encodeURIComponent(`Hello Diamora Properties, I would like VIP details and pricing for ${proj.title} by ${proj.developer}.`);
    mobileWaBtn.href = `https://wa.me/971506760668?text=${text}`;
  }

  // Inquiry form hidden fields
  const inqTitle = document.getElementById('inqProjectTitle');
  if (inqTitle) inqTitle.value = proj.title;
  const inqDev = document.getElementById('inqDeveloper');
  if (inqDev) inqDev.value = proj.developer;

  // Overview Narrative
  const descContainer = document.getElementById('pdetailDescription');
  if (descContainer) {
    descContainer.innerHTML = `<p>${escapeHtml(proj.description || '').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
  }

  // Highlights
  const highlightsList = document.getElementById('pdetailHighlightsList');
  if (highlightsList) {
    const items = Array.isArray(proj.highlights) && proj.highlights.length > 0
      ? proj.highlights
      : [
          'High capital appreciation forecast and high-yield rental returns',
          'Freehold title deeds available to foreign and GCC investors',
          '100% Escrow bank protection regulated by UAE Land Departments',
          'Qualifies for the 10-Year UAE Golden Visa on purchases exceeding AED 2M'
        ];

    highlightsList.innerHTML = items.map(h => `
      <li class="highlight-item">
        <svg class="gold-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${escapeHtml(h)}</span>
      </li>
    `).join('');
  }

  // Gallery
  renderGallery(proj);

  // Master Plan
  renderMasterPlan(proj);

  // Unit Types & Pricing Schedule Table
  renderUnitTypes(proj);
  renderUnitsTable(proj);

  // Payment Milestones
  renderPaymentMilestones(proj);

  // Amenities
  renderAmenities(proj);

  // Investment Opportunities
  renderInvestment(proj);

  // Connectivity, Categorized Lifestyle & Map
  renderConnectivityAndMap(proj);
  renderLifestyleCategories(proj);

  // FAQs
  renderFaqs(proj);
}

function renderGallery(proj) {
  const container = document.getElementById('pdetailGalleryGrid');
  if (!container) return;

  const images = Array.isArray(proj.gallery) && proj.gallery.length > 0
    ? proj.gallery
    : [
        proj.heroImage,
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80'
      ].filter(Boolean);

  container.innerHTML = images.map((imgUrl, idx) => `
    <div class="pdetail-gallery-thumb" onclick="openLightbox('${imgUrl}', '${escapeHtml(proj.title)} - Render ${idx + 1}')">
      <img src="${imgUrl}" alt="${escapeHtml(proj.title)} view ${idx + 1}" loading="lazy">
      <div class="gallery-zoom-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </div>
    </div>
  `).join('');
}

function openLightbox(url, caption) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  if (!modal || !img) return;

  img.src = url;
  if (cap) cap.textContent = caption || '';
  modal.style.display = 'flex';
}
window.openLightbox = openLightbox;

function renderUnitTypes(proj) {
  const container = document.getElementById('pdetailUnitsGrid');
  if (!container) return;

  const units = Array.isArray(proj.unitTypes) && proj.unitTypes.length > 0
    ? proj.unitTypes
    : [
        { name: '1-Bedroom Luxury Suite', bedrooms: '1 Bed', sizeSqFt: '780 - 950 Sq.Ft', startingPrice: proj.startingPrice },
        { name: '2-Bedroom Panoramic Residence', bedrooms: '2 Beds', sizeSqFt: '1,250 - 1,450 Sq.Ft', startingPrice: Math.round(proj.startingPrice * 1.45) },
        { name: '3-Bedroom Signature Townhome', bedrooms: '3 Beds', sizeSqFt: '2,200 - 2,800 Sq.Ft', startingPrice: Math.round(proj.startingPrice * 2.2) }
      ];

  container.innerHTML = units.map(u => {
    const priceStr = u.startingPrice ? `AED ${Number(u.startingPrice).toLocaleString()}` : 'Price on Request';
    const floorImg = u.floorPlanImage || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80';

    return `
      <div class="unit-card">
        <div class="unit-card-media" onclick="openLightbox('${floorImg}', '${escapeHtml(u.name)} Blueprint')">
          <img src="${floorImg}" alt="${escapeHtml(u.name)}" loading="lazy">
          <span class="unit-badge">${escapeHtml(u.bedrooms || 'Layout')}</span>
        </div>
        <div class="unit-card-body">
          <h4 class="font-serif unit-title">${escapeHtml(u.name)}</h4>
          <div class="unit-specs">
            <span class="unit-size">${escapeHtml(u.sizeSqFt || 'Spacious Layout')}</span>
            <span class="unit-price gold-text font-serif">${priceStr}</span>
          </div>
          <a href="#inquireSection" class="btn-secondary unit-btn">
            <span>Request Floor Plan PDF</span>
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function renderPaymentMilestones(proj) {
  const container = document.getElementById('pdetailMilestonesGrid');
  if (!container) return;

  const milestones = Array.isArray(proj.paymentMilestones) && proj.paymentMilestones.length > 0
    ? proj.paymentMilestones
    : [
        { milestone: 'Down Payment', percentage: 10, notes: 'On Booking / Reservation' },
        { milestone: 'During Construction', percentage: 50, notes: 'Staged installments linked to construction' },
        { milestone: 'On Handover', percentage: 40, notes: `Upon Key Handover (${proj.handoverDate || 'Completion'})` }
      ];

  container.innerHTML = milestones.map((m, idx) => `
    <div class="milestone-card">
      <div class="milestone-step">0${idx + 1}</div>
      <div class="milestone-pct gold-text font-serif">${m.percentage}%</div>
      <div class="milestone-title font-serif">${escapeHtml(m.milestone)}</div>
      <div class="milestone-notes">${escapeHtml(m.notes || '')}</div>
    </div>
  `).join('');
}

function getAmenitySvg(name) {
  const n = (name || '').toLowerCase();

  // 1. Pets / Grooming (paw icon)
  if (/\b(pet|pets|dog|dogs|cat|cats|grooming)\b/.test(n)) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>`;
  }

  // 2. Cinema / Movie / Theater
  if (n.includes('cinema') || n.includes('theatre') || n.includes('theater') || n.includes('movie')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`;
  }

  // 3. Swimming / Pool / Lagoon / Swimmable / Splash / Plunge / Hydrotherapy / Jacuzzi
  if (n.includes('pool') || n.includes('lagoon') || n.includes('swimm') || n.includes('splash') || n.includes('plunge') || n.includes('hydrotherapy') || n.includes('jacuzzi')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`;
  }

  // 4. Helipad / Aviation / Helicopter
  if (n.includes('helipad') || n.includes('helicopter') || n.includes('aviation') || n.includes('flight')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 7v10"/><path d="M16 7v10"/><path d="M8 12h8"/></svg>`;
  }

  // 5. Vehicles / Mercedes / Chauffeur / Fleet / Car / Parking
  if (n.includes('chauffeur') || n.includes('fleet') || n.includes('mercedes') || n.includes('parking') || n.includes('car ') || n.includes('cars')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H7.5a1 1 0 0 0-.8.4L4 11l-5.16.86a1 1 0 0 0-.84.99V16h3"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>`;
  }

  // 6. EV / Electric / Charger
  if (/\b(ev|charger|chargers|charging)\b/.test(n) || n.includes('fast charger') || n.includes('electric vehicle')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
  }

  // 7. Marina / Yacht / Boat / Mooring / Boardwalk / Pier
  if (n.includes('marina') || n.includes('yacht') || n.includes('boat') || n.includes('mooring') || n.includes('boardwalk')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`;
  }

  // 8. Beach / Cabana / Coastal / Sun Loungers / Sky Deck / Horizon / Skyline / Burj Khalifa
  if (n.includes('beach') || n.includes('cabana') || n.includes('sun lounger') || n.includes('sky deck') || n.includes('skyline') || n.includes('burj')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  }

  // 9. Spa / Wellness / Hammam / Sauna / Massage / Holistic / Cryo
  if (n.includes('spa') || n.includes('wellness') || n.includes('hammam') || n.includes('sauna') || n.includes('massage') || n.includes('holistic') || n.includes('cryo')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-1.5 3-4 6-8 7 4 1 6.5 4 8 7 1.5-3 4-6 8-7-4-1-6.5-4-8-7z"/><path d="M12 10v7"/><path d="M8 14c2 .5 3 1.5 4 3 1-1.5 2-2.5 4-3"/></svg>`;
  }

  // 10. Fitness / Gym / Pilates / Workout / Athletic / Training / TechnoGym / Performance Center
  if (n.includes('fit') || n.includes('gym') || n.includes('pilates') || n.includes('athletic') || n.includes('training') || n.includes('technogym') || n.includes('workout') || n.includes('performance center')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`;
  }

  // 11. Yoga / Zen / Meditation
  if (n.includes('yoga') || n.includes('zen') || n.includes('meditation')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M4 17l4-2 4 2 4-2 4 2"/><path d="M12 7v6"/><path d="M7 11l5 2 5-2"/></svg>`;
  }

  // 12. Tennis / Padel / Pickleball / Court / Football / Pitch / Sports Arena / Simulator
  if (n.includes('padel') || n.includes('tennis') || n.includes('pickleball') || n.includes('court') || n.includes('pitch') || n.includes('football') || n.includes('sports arena') || n.includes('simulator') || (n.includes('sports') && !n.includes('bar'))) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2.2 14.8C5.5 13 8 10.5 9.8 7.2"/><path d="M14.2 21.8c1.8-3.3 4.3-5.8 7.6-7.6"/></svg>`;
  }

  // 13. Children / Kids / Playrooms / Playground / Gaming / Arena
  if (n.includes('child') || n.includes('kid') || n.includes('playroom') || n.includes('playground') || n.includes('play area') || n.includes('gaming') || n.includes('game room') || n.includes('e-gaming') || n.includes('nursery') || (n.includes('play') && !n.includes('display'))) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="4"/></svg>`;
  }

  // 14. Dining / Restaurant / Cafe / Bistro / Kitchen / Chef / Catering / Bar / Lounge / Cigar
  if (n.includes('café') || n.includes('cafe') || n.includes('restaurant') || n.includes('dining') || n.includes('bistro') || n.includes('kitchen') || n.includes('chef') || n.includes('catering') || n.includes('bar') || n.includes('cigar')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M5 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2"/><path d="M7 14v8"/></svg>`;
  }

  // 15. Supermarket / Grocery / Market / Farm-to-Table
  if (n.includes('supermarket') || n.includes('grocery') || n.includes('market') || n.includes('farm-to-table')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;
  }

  // 16. Retail / Boutique / Florist / Shop
  if (n.includes('retail') || n.includes('boutique') || n.includes('florist') || n.includes('shop')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
  }

  // 17. Co-working / Lounge / Club / Private Members / Business / Salon
  if (n.includes('co-working') || n.includes('coworking') || n.includes('work') || n.includes('business') || n.includes('lounge') || n.includes('club') || n.includes('member') || n.includes('salon')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
  }

  // 18. Park / Garden / Green / Forest / Walking / Jogging / Trail / Walkways / Equestrian / Tree
  if (n.includes('park') || n.includes('garden') || n.includes('green') || n.includes('forest') || n.includes('trail') || n.includes('walk') || n.includes('jog') || n.includes('path') || n.includes('equestrian') || n.includes('nature')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7"/><path d="M7 15a5 5 0 0 1 10 0Z"/><path d="M8 11a4 4 0 0 1 8 0Z"/><path d="M9 7a3 3 0 0 1 6 0Z"/></svg>`;
  }

  // 19. Smart Home / Automation / Technology
  if (n.includes('smart home') || n.includes('automation') || n.includes('smart ') || n.includes('tech')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  }

  // 20. Concierge / Valet / Security / 24/7 / White-Glove / Gated / Service
  if (n.includes('concierge') || n.includes('valet') || n.includes('security') || n.includes('white-glove') || n.includes('gated') || n.includes('service')) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="12" cy="2" r="1"/></svg>`;
  }

  // 21. Default Luxury Diamond / Gem icon
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>`;
}

function renderAmenities(proj) {
  const container = document.getElementById('pdetailAmenitiesGrid');
  if (!container) return;

  const amenities = Array.isArray(proj.amenities) && proj.amenities.length > 0
    ? proj.amenities
    : ['Infinity Pool', 'Private Beach Club', 'Wellness Spa', 'State-of-the-Art Fitness', 'Valet Parking', '24/7 Concierge'];

  container.innerHTML = amenities.map(am => `
    <div class="amenity-item">
      <div class="amenity-icon-wrap" aria-hidden="true">
        ${getAmenitySvg(am)}
      </div>
      <span class="amenity-name">${escapeHtml(am)}</span>
    </div>
  `).join('');
}

function renderConnectivityAndMap(proj) {
  const connContainer = document.getElementById('pdetailConnectivityGrid');
  if (connContainer) {
    const items = Array.isArray(proj.connectivity) && proj.connectivity.length > 0
      ? proj.connectivity
      : [
          { destination: 'International Airport', durationMinutes: 15 },
          { destination: 'Downtown & Financial District', durationMinutes: 20 },
          { destination: 'Waterfront Promenade & Marinas', durationMinutes: 8 }
        ];

    connContainer.innerHTML = items.map(c => `
      <div class="conn-card">
        <div class="conn-time gold-text font-serif">${c.durationMinutes} Mins</div>
        <div class="conn-dest">${escapeHtml(c.destination)}</div>
      </div>
    `).join('');
  }

  // Initialize Map
  const mapEl = document.getElementById('pdetailMap');
  if (mapEl && typeof L !== 'undefined') {
    const lat = proj.coordinates?.lat || 25.2048;
    const lng = proj.coordinates?.lng || 55.2708;

    if (leafletProjectMap) {
      leafletProjectMap.remove();
    }

    try {
      leafletProjectMap = L.map('pdetailMap', {
        center: [lat, lng],
        zoom: 13,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(leafletProjectMap);

      const customPin = L.divIcon({
        className: 'custom-gold-marker',
        html: `<div style="background: #D4AF37; color: #090A0E; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid #FFF; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">📍</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      L.marker([lat, lng], { icon: customPin })
        .addTo(leafletProjectMap)
        .bindPopup(`<b>${escapeHtml(proj.title)}</b><br>${escapeHtml(proj.location || '')}`)
        .openPopup();
    } catch (err) {
      console.warn('Leaflet error rendering project map:', err);
    }
  }
}

function renderFaqs(proj) {
  const container = document.getElementById('pdetailFaqsAccordion');
  if (!container) return;

  const faqs = Array.isArray(proj.faqs) && proj.faqs.length > 0
    ? proj.faqs
    : [
        {
          question: `Can foreigners purchase residences in ${proj.title}?`,
          answer: `Yes, ${proj.title} is an approved freehold investment zone allowing 100% freehold property ownership to all international nationalities with full title deed registration.`
        },
        {
          question: 'Does buying this property qualify for the 10-Year UAE Golden Visa?',
          answer: 'Yes, purchases exceeding AED 2,000,000 qualify the primary investor and their family members for the 10-Year UAE Golden Visa.'
        },
        {
          question: 'How is buyer payment secured before project completion?',
          answer: 'All payments are held in a secure, government-regulated Escrow Account managed by the land authority. Developer withdrawals are permitted strictly in stages corresponding to verified physical construction milestones.'
        }
      ];

  container.innerHTML = faqs.map((faq, idx) => `
    <details class="faq-accordion-item" ${idx === 0 ? 'open' : ''}>
      <summary class="faq-summary">
        <span class="faq-question">${escapeHtml(faq.question)}</span>
        <svg class="faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </summary>
      <div class="faq-answer">
        <p>${escapeHtml(faq.answer)}</p>
      </div>
    </details>
  `).join('');
}

function renderMasterPlan(proj) {
  const sec = document.getElementById('masterPlanSection');
  const navAnchor = document.getElementById('navAnchorMasterPlan');
  const img = document.getElementById('pdetailMasterPlanImg');
  const desc = document.getElementById('pdetailMasterPlanDesc');
  const wrap = document.getElementById('pdetailMasterPlanWrap');
  if (!sec) return;

  if (proj.masterPlanImage || proj.masterPlanDescription) {
    sec.style.display = 'block';
    if (navAnchor) navAnchor.style.display = 'inline-block';
    if (desc) desc.textContent = proj.masterPlanDescription || `${proj.title} is an integrated master-planned community designed for seamless pedestrian movement and lush greenery.`;
    if (img && proj.masterPlanImage) {
      img.src = proj.masterPlanImage;
      wrap.style.display = 'block';
    } else if (wrap) {
      wrap.style.display = 'none';
    }
  } else {
    sec.style.display = 'none';
    if (navAnchor) navAnchor.style.display = 'none';
  }
}

function renderUnitsTable(proj) {
  const wrap = document.getElementById('pdetailUnitsTableWrap');
  const tbody = document.getElementById('pdetailUnitsTableBody');
  if (!wrap || !tbody) return;

  if (Array.isArray(proj.unitsTable) && proj.unitsTable.length > 0) {
    wrap.style.display = 'block';
    tbody.innerHTML = proj.unitsTable.map(u => `
      <tr>
        <td class="table-unit-name font-serif">${escapeHtml(u.unitType)}</td>
        <td>${escapeHtml(u.avgGsaSqm)} <span style="color: var(--text-muted); font-size: 0.78rem;">(${escapeHtml(u.avgGsaSqft)})</span></td>
        <td>${escapeHtml(u.balconySqm)} <span style="color: var(--text-muted); font-size: 0.78rem;">(${escapeHtml(u.balconySqft)})</span></td>
        <td class="table-price font-serif">${escapeHtml(u.startingPrice)}</td>
        <td>
          <a href="#inquireSection" class="table-action-btn">
            <span>Inquire Unit</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </td>
      </tr>
    `).join('');
  } else {
    wrap.style.display = 'none';
  }
}

function renderInvestment(proj) {
  const sec = document.getElementById('investmentSection');
  const navAnchor = document.getElementById('navAnchorInvestment');
  if (!sec) return;

  if (Array.isArray(proj.investmentTabs) && proj.investmentTabs.length > 0) {
    sec.style.display = 'block';
    if (navAnchor) navAnchor.style.display = 'inline-block';
    
    const capitalTab = proj.investmentTabs.find(t => t.title && t.title.toLowerCase().includes('capital')) || proj.investmentTabs[0];
    const rentalTab = proj.investmentTabs.find(t => t.title && t.title.toLowerCase().includes('rental')) || proj.investmentTabs[1] || proj.investmentTabs[0];

    const capitalDesc = document.getElementById('invCapitalDesc');
    const capitalPoints = document.getElementById('invCapitalPoints');
    if (capitalDesc && capitalTab) capitalDesc.textContent = capitalTab.content || '';
    if (capitalPoints && capitalTab && Array.isArray(capitalTab.points)) {
      capitalPoints.innerHTML = capitalTab.points.map(pt => `
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${escapeHtml(pt)}</span>
        </li>
      `).join('');
    }

    const rentalDesc = document.getElementById('invRentalDesc');
    const rentalPoints = document.getElementById('invRentalPoints');
    if (rentalDesc && rentalTab) rentalDesc.textContent = rentalTab.content || '';
    if (rentalPoints && rentalTab && Array.isArray(rentalTab.points)) {
      rentalPoints.innerHTML = rentalTab.points.map(pt => `
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${escapeHtml(pt)}</span>
        </li>
      `).join('');
    }

    // Set up tab buttons
    const btnCapital = document.getElementById('btnInvTabCapital');
    const btnRental = document.getElementById('btnInvTabRental');
    if (btnCapital && capitalTab) btnCapital.textContent = capitalTab.title;
    if (btnRental && rentalTab) btnRental.textContent = rentalTab.title;

    if (btnCapital) {
      btnCapital.onclick = () => switchInvTab('capital');
    }
    if (btnRental) {
      btnRental.onclick = () => switchInvTab('rental');
    }
  } else {
    sec.style.display = 'none';
    if (navAnchor) navAnchor.style.display = 'none';
  }
}

function switchInvTab(type) {
  const btnCapital = document.getElementById('btnInvTabCapital');
  const btnRental = document.getElementById('btnInvTabRental');
  const paneCapital = document.getElementById('paneInvCapital');
  const paneRental = document.getElementById('paneInvRental');

  if (type === 'capital') {
    if (btnCapital) btnCapital.classList.add('active');
    if (btnRental) btnRental.classList.remove('active');
    if (paneCapital) paneCapital.classList.add('active');
    if (paneRental) paneRental.classList.remove('active');
  } else {
    if (btnCapital) btnCapital.classList.remove('active');
    if (btnRental) btnRental.classList.add('active');
    if (paneCapital) paneCapital.classList.remove('active');
    if (paneRental) paneRental.classList.add('active');
  }
}
window.switchInvTab = switchInvTab;

function renderLifestyleCategories(proj) {
  const wrap = document.getElementById('pdetailLifestyleCategoriesWrap');
  const container = document.getElementById('pdetailLifestyleGroups');
  if (!wrap || !container) return;

  if (Array.isArray(proj.lifestyleCategories) && proj.lifestyleCategories.length > 0) {
    wrap.style.display = 'block';
    container.innerHTML = proj.lifestyleCategories.map(cat => `
      <div class="lifestyle-group-card">
        <h4 class="lifestyle-group-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${escapeHtml(cat.category)}</span>
        </h4>
        <ul class="lifestyle-items-list">
          ${(cat.items || []).map(item => `
            <li class="lifestyle-item">
              <span class="lifestyle-item-name">${escapeHtml(item.name)}</span>
              <span class="lifestyle-item-time">${escapeHtml(item.time)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');
  } else {
    wrap.style.display = 'none';
  }
}

async function loadRelatedProjects(currentProj) {
  const container = document.getElementById('relatedProjectsGrid');
  if (!container) return;

  let related = [];
  try {
    const apiBase = getDiamoraApiEndpoint();
    const res = await fetch(`${apiBase}/projects`);
    if (res.ok) {
      const allData = await res.json();
      const all = Array.isArray(allData) ? allData : (allData.projects || allData.data || []);
      related = all.filter(p => (p.slug !== currentProj.slug && p._id !== currentProj._id));
    }
  } catch (e) {}

  if (related.length === 0) {
    related = FALLBACK_PROJECTS.filter(p => p.slug !== currentProj.slug);
  }

  container.innerHTML = related.slice(0, 3).map(proj => {
    const slug = proj.slug || proj._id;
    const title = escapeHtml(proj.title || '');
    const dev = escapeHtml(proj.developer || 'Master Developer');
    const loc = escapeHtml(proj.location || `${proj.city || 'UAE'}`);
    const price = Number(proj.startingPrice || 0);
    const priceStr = price >= 1000000 ? `AED ${(price / 1000000).toFixed(1)}M` : `AED ${price.toLocaleString()}`;
    const logoUrl = resolveDeveloperLogo(proj);
    const devLogo = logoUrl ? `<div class="offplan-dev-emblem-wrap"><img src="${logoUrl}" alt="${dev}" class="offplan-dev-emblem" loading="lazy" onerror="this.parentElement.style.display='none'"></div>` : '';

    let imgSrc = proj.heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';
    if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/')) imgSrc = '/' + imgSrc;

    return `
      <article class="offplan-card" aria-label="${title}">
        <div class="offplan-card-media">
          <img src="${imgSrc}" alt="${title}" class="offplan-card-img" loading="lazy">
          <div class="offplan-card-overlay"></div>
        </div>
        <div class="offplan-card-top">
          <div class="offplan-dev-badge"><span class="offplan-dev-name">${dev}</span></div>
          <span class="offplan-status-pill">${escapeHtml(proj.status || 'New Launch')}</span>
        </div>
        <div class="offplan-card-body">
          ${devLogo}
          <div class="offplan-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>By ${dev} · ${loc}</span>
          </div>
          <h3 class="offplan-title">${title}</h3>
          <div class="offplan-meta-grid">
            <div class="offplan-meta-item"><span class="meta-lbl">Starting Price</span><span class="meta-val gold-text">${priceStr}</span></div>
            <div class="offplan-meta-item"><span class="meta-lbl">Handover</span><span class="meta-val">${escapeHtml(proj.handoverDate || 'TBA')}</span></div>
            <div class="offplan-meta-item"><span class="meta-lbl">Plan</span><span class="meta-val">${escapeHtml(proj.paymentPlan || 'Milestone')}</span></div>
          </div>
          <div class="offplan-card-footer">
            <a href="project-detail.html?slug=${encodeURIComponent(slug)}" class="btn-offplan-explore">
              <span>Explore Project</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function initInquiryForm() {
  const form = document.getElementById('pdetailInquiryForm');
  const resultMsg = document.getElementById('inquiryResultMsg');
  const btn = document.getElementById('btnSubmitInquiry');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('inqFullName').value.trim();
    const email = document.getElementById('inqEmail').value.trim();
    const phone = document.getElementById('inqPhone').value.trim();
    const typology = document.getElementById('inqBedrooms').value;
    const userMsg = document.getElementById('inqMessage').value.trim();
    const projectTitle = currentProject ? currentProject.title : 'Off-Plan Project';
    const developer = currentProject ? currentProject.developer : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Registering Interest...</span>';
    }

    try {
      const apiBase = getDiamoraApiEndpoint();
      const res = await fetch(`${apiBase}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          type: 'off-plan',
          budget: `Preferred: ${typology}`,
          intent: 'Pre-Launch Off-Plan Reservation',
          propertyTitle: `${projectTitle} (${developer})`,
          message: `${userMsg ? userMsg + ' | ' : ''}Preferred Typology: ${typology}`
        })
      });

      if (res.ok) {
        if (resultMsg) {
          resultMsg.style.display = 'block';
          resultMsg.style.color = '#25D366';
          resultMsg.innerHTML = '✅ <strong>VIP Registration Confirmed</strong>. Our luxury off-plan desk will contact you within 2 business hours with full allocations.';
        }
        form.reset();
      } else {
        throw new Error('Failed submission');
      }
    } catch (err) {
      if (resultMsg) {
        resultMsg.style.display = 'block';
        resultMsg.style.color = 'var(--gold-light)';
        resultMsg.innerHTML = '✅ Registration noted. Connecting with our advisory team on WhatsApp.';
      }
      setTimeout(() => {
        const text = encodeURIComponent(`Hello Diamora Properties, my name is ${name}. I just registered for ${projectTitle} (${typology}).`);
        window.open(`https://wa.me/971506760668?text=${text}`, '_blank');
      }, 1000);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Submit Registration</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      }
    }
  });
}
