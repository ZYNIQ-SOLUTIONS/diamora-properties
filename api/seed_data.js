require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const Inquiry = require('./models/Inquiry');
const BlogPost = require('./models/BlogPost');

const sampleBlogPosts = [
  {
    title: "UAE Luxury Real Estate Market Intelligence: The Sovereign Shift in Dubai & Abu Dhabi 2026",
    slug: "uae-luxury-real-estate-market-intelligence-2026",
    excerpt: "An executive briefing on ultra-prime capital flows, record transaction volumes, and why sovereign investors are allocating heavily to waterfront estates across Dubai and Abu Dhabi.",
    category: "Market Insights",
    coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    author: "Diamora Research & Intelligence",
    status: "published",
    featured: true,
    readTime: 5,
    publishedAt: new Date("2026-02-15T10:00:00Z"),
    content: `
      <h2>The New Paradigm of Sovereign Wealth Inflows</h2>
      <p>The UAE ultra-luxury real estate sector continues its trajectory of unprecedented expansion. Institutional allocators, sovereign entities, and international ultra-high-net-worth individuals (UHNWIs) are diversifying capital into core coastal hubs across Dubai and Abu Dhabi.</p>
      
      <blockquote>"Prime residences in the UAE are no longer treated merely as lifestyle acquisitions, but as generational wealth preservation vehicles underpinned by unmatched geopolitical stability, zero-tax frameworks, and world-class infrastructure."</blockquote>

      <h2>Dubai Prime: Scarcity at the Water's Edge</h2>
      <p>In Dubai, prime waterfront inventory—particularly on Palm Jumeirah, Jumeirah Bay Island, and Dubai Islands—faces acute supply bottlenecks. Demand for signature beachfront mansions and high-floor sky penthouses consistently outstrips new construction cycles, driving double-digit capital appreciation across top-tier asset classes.</p>

      <h2>Abu Dhabi: Strategic Sovereign Allocations</h2>
      <p>Concurrently, Abu Dhabi has established itself as the cultural and sovereign epicenter of the Middle East. With major capital deployments across Saadiyat Island, Al Bateen, and Yas Island, global investors are securing trophy real estate adjacent to the world's most prestigious cultural institutions including the Louvre Abu Dhabi, the Guggenheim Abu Dhabi, and the Zayed National Museum.</p>

      <h2>Key Investor Takeaways for 2026</h2>
      <ul>
        <li><strong>Capital Preservation:</strong> The UAE Dirham peg to the USD ensures monetary stability in an era of global currency volatility.</li>
        <li><strong>Rental Yields:</strong> Gross luxury yields in prime Abu Dhabi and Dubai remain between 6.5% and 8.5%, significantly eclipsing London, New York, and Singapore.</li>
        <li><strong>Golden Visa Catalyst:</strong> Streamlined 10-year residency for property investments of AED 2M+ cements sustained end-user commitment.</li>
      </ul>
    `
  },
  {
    title: "The Sovereign Investor Guide to the UAE 10-Year Golden Visa via Real Estate Allocation",
    slug: "uae-golden-visa-real-estate-investment-guide",
    excerpt: "Comprehensive legal and financial framework for acquiring the 10-Year UAE Golden Visa through prime residential acquisitions starting from AED 2 Million.",
    category: "Investment Tips",
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    author: "Diamora Legal & Advisory",
    status: "published",
    featured: true,
    readTime: 4,
    publishedAt: new Date("2026-02-20T12:00:00Z"),
    content: `
      <h2>Strategic Value of the UAE Golden Visa</h2>
      <p>The UAE Golden Visa represents one of the world's most competitive residency-by-investment programs. Designed for global innovators, entrepreneurs, and high-net-worth investors, it grants renewable 10-year self-sponsored residency with full family sponsorship rights.</p>

      <h2>Core Eligibility Requirements</h2>
      <p>To qualify through real estate acquisition, an investor must fulfill the following criteria:</p>
      <ul>
        <li><strong>Minimum Investment Value:</strong> Ownership of one or more properties with an aggregate purchase value of at least AED 2,000,000 (approx. USD 545,000).</li>
        <li><strong>Asset Status:</strong> Valid for ready properties or qualifying off-plan properties from approved master developers.</li>
        <li><strong>Mortgage Flexibility:</strong> Properties purchased with bank financing from specific licensed UAE financial institutions remain eligible provided the equity threshold is met.</li>
      </ul>

      <h2>Family and Personnel Inclusions</h2>
      <p>The primary Golden Visa holder can sponsor their spouse, children of any age, and domestic staff. Critically, there is no restriction on maximum stay duration outside the UAE—holders can spend extended periods abroad without jeopardizing visa validity.</p>
    `
  },
  {
    title: "Saadiyat Cultural District: Why Abu Dhabi's Coastal Island is Setting Global Benchmark for Capital Growth",
    slug: "saadiyat-cultural-district-abu-dhabi-growth",
    excerpt: "Nestled between the Louvre Abu Dhabi, Guggenheim, and pristine marine sanctuaries, Saadiyat Island has emerged as the premier sanctuary for discerning global collectors and sovereign wealth.",
    category: "Area Guides",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    author: "Diamora Research & Intelligence",
    status: "published",
    featured: false,
    readTime: 6,
    publishedAt: new Date("2026-02-24T09:00:00Z"),
    content: `
      <h2>The Cultural Epicenter of the Middle East</h2>
      <p>Saadiyat Island stands in a class of its own. It is rare anywhere on earth to discover pristine white-sand marine ecosystems directly integrated with iconic Pritzker Prize-winning architecture and world-leading cultural institutions.</p>

      <h2>Architectural Prestige & Master Planning</h2>
      <p>From Jean Nouvel's Louvre Abu Dhabi to Frank Gehry's upcoming Guggenheim Abu Dhabi and Norman Foster's Zayed National Museum, Saadiyat is meticulously planned with strict environmental protections and ultra-low density zoning.</p>

      <h2>Capital Appreciation Outlook</h2>
      <p>Limited master-developer releases and strict beachfront conservation laws guarantee that land scarcity will continue to accelerate villa values over the coming decade. Prime estates in Saadiyat Beach Villas, Mamsha, and the Cultural District continue to demonstrate superior price resilience.</p>
    `
  },
  {
    title: "Palm Jumeirah & Waterfront Estates: Anatomy of Ultra-Prime Capital Appreciation",
    slug: "palm-jumeirah-waterfront-estates-capital-appreciation",
    excerpt: "Inside Dubai's most exclusive coastal archipelago: how scarcity, private beaches, and international wealth immigration continue to drive unprecedented returns.",
    category: "Lifestyle",
    coverImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80",
    author: "Diamora Private Office",
    status: "published",
    featured: false,
    readTime: 4,
    publishedAt: new Date("2026-02-28T14:30:00Z"),
    content: `
      <h2>Global Island Benchmark</h2>
      <p>Palm Jumeirah remains Dubai's most recognized luxury address. Over the past 36 months, prices for beachfront villas across the fronds have reached historic heights, driven by high demand for turnkey custom-built mansions with private berths.</p>

      <h2>The Frond Renaissance: Bespoke Architecture</h2>
      <p>Older Mediterranean and Arabic style villas on the Palm are increasingly being acquired and completely reconstructed into bespoke modern architectural masterworks featuring travertine facades, subterranean wellness suites, and frameless ocean-view glass.</p>
    `
  },
  {
    title: "Navigating UAE Off-Plan vs. Secondary Prime Assets: Tax-Efficient Wealth Preservation",
    slug: "navigating-uae-off-plan-vs-secondary-assets",
    excerpt: "Strategic comparison of developer payment plans versus immediate-yield turnkey estates for family offices and institutional buyers in the UAE.",
    category: "UAE Property News",
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
    author: "Diamora Advisory Team",
    status: "published",
    featured: false,
    readTime: 5,
    publishedAt: new Date("2026-03-01T08:00:00Z"),
    content: `
      <h2>Off-Plan vs Ready: The Strategic Allocation Matrix</h2>
      <p>When deploying capital in the UAE luxury residential market, high-net-worth investors balance cash-flow flexibility against immediate rental income.</p>
      
      <h2>Off-Plan Advantages</h2>
      <ul>
        <li><strong>Staged Capital Outlay:</strong> Payment plans extending up to 5-7 years with minimal down payments.</li>
        <li><strong>Capital Gains During Construction:</strong> Opportunity to capture price appreciation before project handover.</li>
        <li><strong>Latest Specifications:</strong> Contemporary sustainability standards, smart home automation, and modern amenities.</li>
      </ul>

      <h2>Secondary Market Strengths</h2>
      <ul>
        <li><strong>Immediate Cash Flow:</strong> Rental income begins upon acquisition completion.</li>
        <li><strong>Physical Due Diligence:</strong> Complete transparency of view corridors, construction build quality, and property management.</li>
      </ul>
    `
  }
];

const sampleProperties = [
  {
    title: "Palm Jumeirah Waterfront Beach Villa",
    description: "Ultra-luxury waterfront estate with private beach frontage, infinity pool, sunken firepit lounge, and panoramic skyline views over the Arabian Gulf.",
    price: 48000000,
    location: "Palm Jumeirah, Dubai",
    propertyType: "Villa",
    bedrooms: 6,
    bathrooms: 7,
    area: 12400,
    imageUrl: "assets/properties/palm-villa.jpg",
    status: "Available"
  },
  {
    title: "Saadiyat Cultural District Townhouse",
    description: "Contemporary travertine stone townhouse with private plunge pool courtyard, steps from Louvre Abu Dhabi and pristine Saadiyat beach.",
    price: 22500000,
    location: "Saadiyat Island, Abu Dhabi",
    propertyType: "Townhouse",
    bedrooms: 4,
    bathrooms: 5,
    area: 5800,
    imageUrl: "assets/properties/saadiyat-townhouse.jpg",
    status: "Available"
  },
  {
    title: "Dubai Hills Golf & Skyline Mansion",
    description: "Striking 3-tier architectural mansion overlooking championship golf greens with unobstructed Downtown Dubai skyline vistas and private basement gallery.",
    price: 36500000,
    location: "Dubai Hills Estate, Dubai",
    propertyType: "Mansion",
    bedrooms: 5,
    bathrooms: 6,
    area: 9600,
    imageUrl: "assets/properties/dubai-hills-mansion.jpg",
    status: "Available"
  },
  {
    title: "Downtown Burj Crown Sky Penthouse",
    description: "Full-floor duplex penthouse crowning an ultra-prime tower with private cantilevered sky pool and 360-degree vistas of Burj Khalifa and Dubai Fountain.",
    price: 65000000,
    location: "Downtown Dubai, Dubai",
    propertyType: "Penthouse",
    bedrooms: 5,
    bathrooms: 7,
    area: 14200,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    status: "Available"
  },
  {
    title: "Al Bateen Royal Waterfront Residence",
    description: "Sovereign waterfront villa nestled in the historic royal enclave of Al Bateen with private 90ft yacht berth, landscaped palm gardens, and majlis wing.",
    price: 42000000,
    location: "Al Bateen, Abu Dhabi",
    propertyType: "Villa",
    bedrooms: 6,
    bathrooms: 8,
    area: 11500,
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    status: "Available"
  },
  {
    title: "Yas Island Waterfront Signature Suite",
    description: "High-yield investment suite directly overlooking Yas Marina circuit with branded concierge services and private access to Yas beach club.",
    price: 8500000,
    location: "Yas Island, Abu Dhabi",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 3,
    area: 2100,
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    status: "Available"
  }
];

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diamora';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB at ${mongoURI}`);

    // 1. Seed Admin User (if none exists)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const admin = new User({
        username: 'admin',
        password: 'password123'
      });
      await admin.save();
      console.log('✅ Default admin user initialized (username="admin")');
    } else {
      console.log(`ℹ️ Admin accounts already exist (${userCount} users)`);
    }

    // 2. Seed Portfolio Properties (if none exists)
    const propCount = await Property.countDocuments();
    if (propCount === 0) {
      await Property.insertMany(sampleProperties);
      console.log(`✅ Seeded ${sampleProperties.length} luxury portfolio properties`);
    } else {
      console.log(`ℹ️ Properties already exist (${propCount} listings)`);
    }

    // 3. Seed Insights & Intelligence Blog Posts (if none exists)
    const blogCount = await BlogPost.countDocuments();
    if (blogCount === 0) {
      for (const p of sampleBlogPosts) {
        const post = new BlogPost(p);
        await post.save();
      }
      console.log(`✅ Seeded ${sampleBlogPosts.length} market intelligence blog posts`);
    } else {
      console.log(`ℹ️ Blog posts already exist (${blogCount} articles)`);
    }

    console.log('\n🌟 Diamora Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
