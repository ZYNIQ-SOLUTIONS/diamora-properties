const mongoose = require('mongoose');

/**
 * DIAMORA PROPERTIES — Blog Post Schema
 * Full-featured blog model with SEO fields, categories, tags, and analytics.
 */

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const blogPostSchema = new mongoose.Schema({
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
  excerpt: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  content: {
    type: String,
    required: true,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: 'Diamora Properties',
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'Market Insights',
    enum: [
      'Market Insights',
      'Investment Tips',
      'Lifestyle',
      'UAE Property News',
      'Area Guides',
      'Developer News',
      'Buyer Guides',
      'Legal & Finance'
    ]
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  // SEO Fields
  seoTitle: {
    type: String,
    trim: true,
    maxlength: 70,
    default: ''
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: 160,
    default: ''
  },
  seoKeywords: {
    type: String,
    trim: true,
    default: ''
  },
  // Analytics
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  readTime: {
    type: Number,
    default: 1  // minutes
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Auto-generate slug from title before saving
blogPostSchema.pre('validate', async function(next) {
  if (this.isNew || this.isModified('title')) {
    if (!this.slug) {
      let baseSlug = generateSlug(this.title);
      let slug = baseSlug;
      let count = 1;

      // Ensure slug uniqueness
      while (true) {
        const existing = await mongoose.model('BlogPost').findOne({ slug, _id: { $ne: this._id } });
        if (!existing) break;
        slug = `${baseSlug}-${count++}`;
      }
      this.slug = slug;
    }
  }

  // Auto-calculate read time (avg 200 words/min)
  if (this.isModified('content') && this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  // Auto-set publishedAt when first publishing
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Default SEO fields from post data
  if (!this.seoTitle && this.title) {
    this.seoTitle = `${this.title} | Diamora Properties`;
  }
  if (!this.seoDescription && this.excerpt) {
    this.seoDescription = this.excerpt.substring(0, 160);
  }

  next();
});

// Index for full-text search
blogPostSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
blogPostSchema.index({ category: 1, status: 1, publishedAt: -1 });
blogPostSchema.index({ featured: 1, status: 1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
