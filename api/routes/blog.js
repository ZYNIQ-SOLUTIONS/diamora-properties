const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const auth = require('../middleware/auth');

// GET /api/blog - List posts (Public, supports pagination, filtering, searching)
router.get('/', async (req, res) => {
  try {
    const { status, category, tag, search, featured, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    else if (!req.user) query.status = 'published'; // Public visitors only see published

    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (featured === 'true') query.featured = true;

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let sort = { publishedAt: -1, createdAt: -1 };
    if (search) {
      sort = { score: { $meta: 'textScore' } }; // Sort by relevance if searching
    }

    const posts = await BlogPost.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BlogPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalPosts: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/blog/categories - Get distinct categories with counts (Public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/blog/tags - Get distinct tags with counts (Public)
router.get('/tags', async (req, res) => {
  try {
    const tags = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    res.json(tags);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/blog/:slug - Get single post by slug (Public)
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Increment views asynchronously
    BlogPost.updateOne({ _id: post._id }, { $inc: { views: 1 } }).exec();
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/blog - Create new post (Private)
router.post('/', auth, async (req, res) => {
  try {
    const newPost = new BlogPost(req.body);
    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A post with this slug already exists.' });
    }
    res.status(500).send('Server Error');
  }
});

// PUT /api/blog/:id - Update post (Private)
router.put('/:id', auth, async (req, res) => {
  try {
    let post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Blog post not found' });

    // Explicitly update fields and let pre('validate') handle slug/readTime/SEO
    Object.keys(req.body).forEach(key => {
      post[key] = req.body[key];
    });

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A post with this slug already exists.' });
    }
    res.status(500).send('Server Error');
  }
});

// DELETE /api/blog/:id - Delete post (Private)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Blog post not found' });

    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PATCH /api/blog/:id/publish - Toggle publish status (Private)
router.patch('/:id/publish', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Blog post not found' });

    post.status = req.body.status || (post.status === 'published' ? 'draft' : 'published');
    await post.save();
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PATCH /api/blog/:id/feature - Toggle feature status (Private)
router.patch('/:id/feature', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Blog post not found' });

    post.featured = typeof req.body.featured !== 'undefined' ? req.body.featured : !post.featured;
    await post.save();
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
