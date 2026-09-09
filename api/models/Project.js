const mongoose = require('mongoose');

function generateSlug(title) {
  if (!title) return `project-${Date.now()}`;
  let clean = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || `project-${Date.now()}`;
}

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  tagline: {
    type: String,
    trim: true,
    default: ''
  },
  developer: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  developerLogo: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    enum: ['Dubai', 'Abu Dhabi', 'Ras Al Khaimah', 'Sharjah', 'International'],
    default: 'Dubai',
    index: true
  },
  startingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'AED'
  },
  handoverDate: {
    type: String,
    required: true,
    trim: true
  },
  paymentPlan: {
    type: String,
    required: true,
    trim: true
  },
  downPayment: {
    type: String,
    default: '20%',
    trim: true
  },
  propertyTypes: [{
    type: String,
    trim: true
  }],
  bedrooms: {
    type: String,
    default: '1 - 4 Bedrooms',
    trim: true
  },
  status: {
    type: String,
    enum: ['New Launch', 'Under Construction', 'Handover Soon', 'Sold Out'],
    default: 'New Launch',
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  heroImage: {
    type: String,
    required: true
  },
  gallery: [{
    type: String
  }],
  description: {
    type: String,
    required: true,
    default: ''
  },
  highlights: [{
    type: String
  }],
  amenities: [{
    type: String
  }],
  unitTypes: [{
    name: { type: String, required: true },
    bedrooms: { type: String, default: '' },
    sizeSqFt: { type: String, default: '' },
    startingPrice: { type: Number, default: 0 },
    floorPlanImage: { type: String, default: '' }
  }],
  paymentMilestones: [{
    milestone: { type: String, required: true },
    percentage: { type: Number, required: true },
    notes: { type: String, default: '' }
  }],
  connectivity: [{
    destination: { type: String, required: true },
    durationMinutes: { type: Number, required: true }
  }],
  brochureUrl: {
    type: String,
    default: ''
  },
  coordinates: {
    lat: { type: Number, default: 25.2048 },
    lng: { type: Number, default: 55.2708 }
  },
  faqs: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  permitNumber: {
    type: String,
    default: '',
    trim: true
  },
  ownership: {
    type: String,
    default: '100% Freehold - All Nationalities',
    trim: true
  },
  masterPlanImage: {
    type: String,
    default: ''
  },
  masterPlanDescription: {
    type: String,
    default: ''
  },
  unitsTable: [{
    unitType: { type: String, default: '' },
    avgGsaSqm: { type: String, default: '' },
    avgGsaSqft: { type: String, default: '' },
    balconySqm: { type: String, default: '' },
    balconySqft: { type: String, default: '' },
    startingPrice: { type: String, default: '' }
  }],
  lifestyleCategories: [{
    category: { type: String, default: '' },
    items: [{
      name: { type: String, default: '' },
      time: { type: String, default: '' }
    }]
  }],
  investmentTabs: [{
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    points: [{ type: String }]
  }]
}, { timestamps: true });

// Auto-generate slug before saving if not supplied or changed
projectSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = generateSlug(this.title);
  }
  next();
});

// Full-text search index for projects
projectSchema.index({
  title: 'text',
  developer: 'text',
  location: 'text',
  description: 'text'
});

module.exports = mongoose.model('Project', projectSchema);
