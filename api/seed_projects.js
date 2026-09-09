require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');

const sampleProjects = [
  {
    title: 'Sobha City Abu Dhabi',
    slug: 'sobha-city-abu-dhabi',
    tagline: 'Luxury Apartments, Villas & Townhouses by Sobha Realty',
    developer: 'Sobha Realty',
    developerLogo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop&q=80',
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
      }
    ]
  },
  {
    title: 'Tilal Binghatti Dubai',
    slug: 'tilal-binghatti-dubai',
    tagline: 'Hyper-Tower Architectural Masterpiece by Binghatti Developers',
    developer: 'Binghatti Developers',
    developerLogo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop&q=80',
    location: 'Dubai Science Park, Dubai',
    city: 'Dubai',
    startingPrice: 1250000,
    currency: 'AED',
    handoverDate: 'Q2 2026',
    paymentPlan: '70/30 Investor Advantage Plan',
    downPayment: '20%',
    propertyTypes: ['Apartments', 'Penthouses'],
    bedrooms: 'Studio, 1 to 3 Bedrooms',
    status: 'Under Construction',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80'
    ],
    description: `Tilal Binghatti represents an iconic fusion of avant-garde architecture and intelligent modern luxury in the flourishing heart of Dubai. Rising dramatically above Dubai Science Park, this hyper-contemporary tower features Binghatti's signature geometric motifs, energy-efficient thermal facade elements, and private balcony plunge pools overlooking the glittering Dubai skyline.`,
    highlights: [
      'Striking branded architectural design with private balcony plunge pools',
      'Strategic central position adjacent to Al Khail Road and Umm Suqeim Street',
      'Projected net rental yields of 8.5% - 10.2% per annum',
      'Turnkey luxury finishing with smart home automation integration'
    ],
    amenities: [
      'Rooftop Horizon Infinity Pool',
      'Jacuzzi & Hydrotherapy Deck',
      'TechnoGym Panoramic Fitness Suite',
      'Private Cinema & Gaming Room',
      'Sky Lounge with Skyline Views',
      'Landscaped Zen Podium Gardens',
      'EV Charging Stations',
      '24/7 Security & Valet Services'
    ],
    unitTypes: [
      {
        name: 'Executive Studio',
        bedrooms: 'Studio',
        sizeSqFt: '460 - 520 Sq.Ft',
        startingPrice: 1250000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
      },
      {
        name: '1-Bedroom Skyline Suite',
        bedrooms: '1 Bedroom',
        sizeSqFt: '780 - 890 Sq.Ft',
        startingPrice: 1650000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
      },
      {
        name: '2-Bedroom Sky Residence with Pool',
        bedrooms: '2 Bedrooms',
        sizeSqFt: '1,320 - 1,510 Sq.Ft',
        startingPrice: 2450000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
      }
    ],
    paymentMilestones: [
      { milestone: 'Down Payment', percentage: 20, notes: 'On booking' },
      { milestone: 'During Construction', percentage: 50, notes: 'Structured in easy quarterly installments' },
      { milestone: 'On Handover', percentage: 30, notes: 'Q2 2026' }
    ],
    connectivity: [
      { destination: 'Dubai Hills Mall & Estate', durationMinutes: 7 },
      { destination: 'Mall of the Emirates', durationMinutes: 10 },
      { destination: 'Downtown Dubai & Burj Khalifa', durationMinutes: 15 },
      { destination: 'Dubai Marina & JBR Beach', durationMinutes: 18 }
    ],
    coordinates: { lat: 25.0719, lng: 55.2476 },
    faqs: [
      {
        question: 'What is the estimated completion date for Tilal Binghatti?',
        answer: 'Handover is firmly scheduled for Q2 2026, with construction actively on schedule.'
      }
    ]
  },
  {
    title: 'Manchester City Yas Residences',
    slug: 'manchester-city-yas-residences',
    tagline: 'Official Branded Luxury Waterfront Living by Ohana Development',
    developer: 'Ohana Development',
    developerLogo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop&q=80',
    location: 'Yas Island, Abu Dhabi',
    city: 'Abu Dhabi',
    startingPrice: 1850000,
    currency: 'AED',
    handoverDate: 'Q1 2028',
    paymentPlan: '50/50 Post-Handover Available',
    downPayment: '10%',
    propertyTypes: ['Apartments', 'Penthouses', 'Duplexes'],
    bedrooms: '1 to 4 Bedrooms',
    status: 'New Launch',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'
    ],
    description: `The world's first Manchester City Football Club branded luxury residential development, situated in prime Yas Island, Abu Dhabi. Designed in collaboration with international sports legends and elite architects, this branded sanctuary integrates athletic wellness facilities, private marina promenades, smart sports simulators, and panoramic views of Yas Bay.`,
    highlights: [
      'Official Manchester City FC branded lifestyle residence',
      'Direct waterfront positioning on Yas Island Marina',
      'Exclusive sports medicine clinic, padel courts, and athletic training academy',
      'High capital appreciation driven by Yas Island entertainment ecosystem'
    ],
    amenities: [
      'Championship Padel Courts',
      'Athletic Training & Cryo-Recovery Spa',
      'Olympic-Length Swimming Pool',
      'Private Marina Boardwalk',
      'Simulators & VR Sports Arena',
      'Childrens Football Academy',
      'Members Club & Cigar Lounge',
      'Private Yacht Mooring Options'
    ],
    unitTypes: [
      {
        name: '1-Bedroom Champions Suite',
        bedrooms: '1 Bedroom',
        sizeSqFt: '820 - 980 Sq.Ft',
        startingPrice: 1850000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
      },
      {
        name: '2-Bedroom Marina Residence',
        bedrooms: '2 Bedrooms',
        sizeSqFt: '1,380 - 1,600 Sq.Ft',
        startingPrice: 2800000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
      },
      {
        name: '3-Bedroom Sky Penthouse',
        bedrooms: '3 Bedrooms',
        sizeSqFt: '2,600 - 3,200 Sq.Ft',
        startingPrice: 5100000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
      }
    ],
    paymentMilestones: [
      { milestone: 'Down Payment', percentage: 10, notes: 'On reservation' },
      { milestone: 'During Construction', percentage: 40, notes: 'Over 40 months' },
      { milestone: 'On Handover', percentage: 50, notes: 'Q1 2028' }
    ],
    connectivity: [
      { destination: 'Yas Marina Circuit (F1)', durationMinutes: 4 },
      { destination: 'Yas Bay Waterfront & Etihad Arena', durationMinutes: 5 },
      { destination: 'Ferrari World & Warner Bros World', durationMinutes: 7 },
      { destination: 'Abu Dhabi International Airport', durationMinutes: 10 }
    ],
    coordinates: { lat: 24.4672, lng: 54.6031 },
    faqs: [
      {
        question: 'Who is the developer of Manchester City Yas Residences?',
        answer: 'The project is proudly developed by Ohana Development in official licensing partnership with Manchester City Football Club.'
      }
    ]
  },
  {
    title: 'The Wilds Dubai',
    slug: 'the-wilds-dubai',
    tagline: 'Eco-Luxury Nature-Immersed Sanctuary by Aldar Properties',
    developer: 'Aldar Properties',
    developerLogo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop&q=80',
    location: 'Dubailand, Dubai',
    city: 'Dubai',
    startingPrice: 2400000,
    currency: 'AED',
    handoverDate: 'Q3 2027',
    paymentPlan: '60/40 Construction Linked',
    downPayment: '10%',
    propertyTypes: ['Villas', 'Townhouses'],
    bedrooms: '3 to 6 Bedrooms',
    status: 'New Launch',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80'
    ],
    description: `The Wilds Dubai is Aldar's debut signature residential master community in Dubai. Conceived around biophilic principles, native flora corridors, and zero-carbon living ideals, this private villa sanctuary combines rustic desert elegance with sovereign architectural pedigree.`,
    highlights: [
      'Master community developed by Aldar, Abu Dhabi’s leading sovereign developer',
      'Private nature reserve with deer roaming sanctuaries and natural streams',
      'Expansive standalone villas with double-height ceiling voids and private pools',
      'LEED Platinum design standards with solar-integrated roofing'
    ],
    amenities: [
      'Natural Freshwater Swimming Lagoons',
      'Forest Walking & Equestrian Trails',
      'Organic Farm-to-Table Community Kitchen',
      'Holistic Wellness Pavilions',
      'Championship Tennis & Pickleball Academy',
      'Clubhouse with Michelin-Caliber Dining',
      '24/7 Gated Security & Concierge'
    ],
    unitTypes: [
      {
        name: '3-Bedroom Forest Townhouse',
        bedrooms: '3 Bedrooms',
        sizeSqFt: '2,650 - 2,900 Sq.Ft',
        startingPrice: 2400000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
      },
      {
        name: '4-Bedroom Standalone Sanctuary Villa',
        bedrooms: '4 Bedrooms',
        sizeSqFt: '4,100 - 4,700 Sq.Ft',
        startingPrice: 4800000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
      }
    ],
    paymentMilestones: [
      { milestone: 'Down Payment', percentage: 10, notes: 'On booking' },
      { milestone: 'During Construction', percentage: 50, notes: 'Installments over 3 years' },
      { milestone: 'Handover', percentage: 40, notes: 'Q3 2027' }
    ],
    connectivity: [
      { destination: 'Global Village', durationMinutes: 8 },
      { destination: 'Downtown Dubai', durationMinutes: 20 },
      { destination: 'Dubai International Airport (DXB)', durationMinutes: 22 }
    ],
    coordinates: { lat: 25.0438, lng: 55.3021 },
    faqs: [
      {
        question: 'Are all villas in The Wilds standalone?',
        answer: 'The community features both semi-detached luxury townhomes and expansive standalone estates.'
      }
    ]
  },
  {
    title: 'Mercedes-Benz Places by Binghatti',
    slug: 'mercedes-benz-places-binghatti',
    tagline: 'Sensual Purity: The Ultra-Luxury Hyper-Tower in Downtown Dubai',
    developer: 'Binghatti Developers',
    developerLogo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop&q=80',
    location: 'Downtown Dubai',
    city: 'Dubai',
    startingPrice: 8500000,
    currency: 'AED',
    handoverDate: 'Q4 2026',
    paymentPlan: '70/30 Ultra-Prime Allocation',
    downPayment: '20%',
    propertyTypes: ['Penthouses', 'Sky Mansions'],
    bedrooms: '2 to 5 Bedrooms',
    status: 'Under Construction',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'
    ],
    description: `A triumphant collaboration between luxury German automotive pioneer Mercedes-Benz and Binghatti Developers. Soaring 341 meters above Downtown Dubai, Mercedes-Benz Places is an architectural tour de force echoing the iconic brand's design philosophy of Sensual Purity. Offering uninterrupted direct vistas of the Burj Khalifa, each residence includes bespoke automotive-inspired finishes, private sky-edge swimming pools, and private elevator access.`,
    highlights: [
      'Official Mercedes-Benz global branded hyper-tower',
      'Direct, uninterrupted views of Burj Khalifa and Dubai Fountain',
      'Every penthouse equipped with a private horizon pool and sky terrace',
      'Integrated automotive concierge, bespoke Maybach lounge, and EV mobility infrastructure'
    ],
    amenities: [
      'Private Horizon Plunge Pools in every unit',
      'Burj Khalifa Viewing Sky Deck',
      'Maybach Private Owners Lounge',
      'Acoustic Listening Salons & Cigar Lounge',
      'Chauffeured Mercedes-Benz Fleet Service',
      'Full-Floor Wellness Spa & Hammam',
      'Private Chef & Catering Dining Room',
      'Helipad Access Service'
    ],
    unitTypes: [
      {
        name: '2-Bedroom Mercedes-Benz Suite',
        bedrooms: '2 Bedrooms',
        sizeSqFt: '1,850 - 2,100 Sq.Ft',
        startingPrice: 8500000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
      },
      {
        name: '3-Bedroom Horizon Sky Suite',
        bedrooms: '3 Bedrooms',
        sizeSqFt: '2,800 - 3,250 Sq.Ft',
        startingPrice: 14500000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
      },
      {
        name: 'Duplex Penthouse Collection',
        bedrooms: '5 Bedrooms',
        sizeSqFt: '6,500 - 8,200 Sq.Ft',
        startingPrice: 35000000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
      }
    ],
    paymentMilestones: [
      { milestone: 'Down Payment', percentage: 20, notes: 'Immediate upon booking' },
      { milestone: 'During Construction', percentage: 50, notes: 'Phased installments' },
      { milestone: 'On Handover', percentage: 30, notes: 'Q4 2026' }
    ],
    connectivity: [
      { destination: 'Burj Khalifa & Dubai Mall', durationMinutes: 3 },
      { destination: 'Dubai Opera', durationMinutes: 4 },
      { destination: 'DIFC Financial Center', durationMinutes: 7 },
      { destination: 'Dubai International Airport', durationMinutes: 14 }
    ],
    coordinates: { lat: 25.1972, lng: 55.2744 },
    faqs: [
      {
        question: 'What makes Mercedes-Benz Places unique?',
        answer: 'It is the first residential tower in the world designed directly with the design team of Mercedes-Benz, combining automotive engineering precision with trophy luxury real estate.'
      }
    ]
  },
  {
    title: 'Sila at Masdar City',
    slug: 'sila-at-masdar-city',
    tagline: 'Sustainable Future Living in Abu Dhabi’s Pioneer Eco-City',
    developer: 'Reportage Properties',
    developerLogo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop&q=80',
    location: 'Masdar City, Abu Dhabi',
    city: 'Abu Dhabi',
    startingPrice: 890000,
    currency: 'AED',
    handoverDate: 'Q3 2026',
    paymentPlan: '1% Monthly Payment Plan',
    downPayment: '10%',
    propertyTypes: ['Apartments', 'Townhouses'],
    bedrooms: 'Studio, 1 to 3 Bedrooms',
    status: 'Under Construction',
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80'
    ],
    description: `Sila at Masdar City is an innovative residential haven situated within one of the world's most sustainable urban developments. Featuring state-of-the-art solar thermal shielding, smart energy monitoring, and pedestrianized shaded streets cooled by natural wind towers, Sila offers clean contemporary living with remarkably low operating costs.`,
    highlights: [
      'Located in Masdar City, Abu Dhabi’s premier green innovation cluster',
      'Extremely attractive 1% monthly payment plan',
      'High rental yield potential of 8.0% - 9.2% fueled by university & tech professionals',
      'Freehold title for all nationalities'
    ],
    amenities: [
      'Eco-Smart Solar Swimming Pool',
      'Shaded Walking & Jogging Paths',
      'Modern Gymnasium & Yoga Deck',
      'Electric Vehicle Fast Chargers',
      'Lush Community Parks & Play Areas',
      'On-site Retail & Organic Cafes',
      '24/7 Concierge Service'
    ],
    unitTypes: [
      {
        name: 'Studio Apartment',
        bedrooms: 'Studio',
        sizeSqFt: '390 - 450 Sq.Ft',
        startingPrice: 890000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'
      },
      {
        name: '1-Bedroom Eco Residence',
        bedrooms: '1 Bedroom',
        sizeSqFt: '680 - 790 Sq.Ft',
        startingPrice: 1150000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
      },
      {
        name: '2-Bedroom Family Suite',
        bedrooms: '2 Bedrooms',
        sizeSqFt: '1,100 - 1,280 Sq.Ft',
        startingPrice: 1680000,
        floorPlanImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
      }
    ],
    paymentMilestones: [
      { milestone: 'Down Payment', percentage: 10, notes: 'On booking' },
      { milestone: 'Monthly Installments', percentage: 60, notes: '1% per month until handover' },
      { milestone: 'On Handover', percentage: 30, notes: 'Q3 2026' }
    ],
    connectivity: [
      { destination: 'Abu Dhabi International Airport (AUH)', durationMinutes: 5 },
      { destination: 'Yas Island Entertainment District', durationMinutes: 10 },
      { destination: 'Saadiyat Island Cultural Zone', durationMinutes: 20 },
      { destination: 'Abu Dhabi Corniche', durationMinutes: 25 }
    ],
    coordinates: { lat: 24.4304, lng: 54.6186 },
    faqs: [
      {
        question: 'What is the payment plan for Sila Masdar City?',
        answer: 'The project features an exceptional 1% monthly payment plan after a modest 10% down payment.'
      }
    ]
  }
];

async function seed() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diamora';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB: ${mongoURI}`);

    // Check existing projects
    const count = await Project.countDocuments();
    console.log(`Current projects in database: ${count}`);

    // Clear and re-seed or upsert
    for (const proj of sampleProjects) {
      await Project.findOneAndUpdate(
        { slug: proj.slug },
        { $set: proj },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Seeded project: ${proj.title} (${proj.slug})`);
    }

    const newCount = await Project.countDocuments();
    console.log(`Projects seeding completed. Total projects in DB: ${newCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
