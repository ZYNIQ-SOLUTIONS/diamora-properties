const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const { processBrochure } = require('../utils/brochureExtractor');

// Helper to escape user input before using in RegExp to prevent ReDoS
function escapeRegex(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/projects - Public listing with filters & search
router.get('/', async (req, res) => {
  try {
    const {
      city,
      developer,
      status,
      featured,
      search,
      propertyType,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (city && city !== 'all' && city !== 'All UAE') {
      query.city = city;
    }

    if (developer && developer !== 'all') {
      query.developer = new RegExp(`^${escapeRegex(developer)}$`, 'i');
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (propertyType && propertyType !== 'all') {
      query.propertyTypes = { $in: [propertyType] };
    }

    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = Number(minPrice);
      if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      const term = escapeRegex(search.trim());
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { developer: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { startingPrice: 1 };
    if (sort === 'price_desc') sortOption = { startingPrice: -1 };
    if (sort === 'featured') sortOption = { isFeatured: -1, createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      projects,
      data: projects,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    console.error('Error fetching projects:', err.message);
    res.status(500).json({ message: 'Server Error fetching projects' });
  }
});

// GET /api/projects/featured - Top featured projects for homepage
router.get('/featured', async (req, res) => {
  try {
    let projects = await Project.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(10);
    // If fewer than 3 featured, fill with latest active projects
    if (projects.length < 3) {
      const more = await Project.find({ _id: { $nin: projects.map(p => p._id) } })
        .sort({ createdAt: -1 })
        .limit(6 - projects.length);
      projects = [...projects, ...more];
    }
    res.json({ success: true, projects, data: projects });
  } catch (err) {
    console.error('Error fetching featured projects:', err.message);
    res.status(500).json({ message: 'Server Error fetching featured projects' });
  }
});

// GET /api/projects/:idOrSlug - Single project lookup
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let project = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      project = await Project.findById(idOrSlug);
    }

    if (!project) {
      project = await Project.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Also fetch 3 related projects in the same city or developer
    const related = await Project.find({
      _id: { $ne: project._id },
      $or: [{ city: project.city }, { developer: project.developer }]
    }).limit(3);

    res.json({
      success: true,
      project,
      data: project,
      related
    });
  } catch (err) {
    console.error('Error fetching project:', err.message);
    res.status(500).json({ message: 'Server Error fetching project' });
  }
});

// POST /api/projects/extract-brochure - Extract project info & images from brochure PDF (Private - Admin)
router.post('/extract-brochure', auth, async (req, res) => {
  try {
    const { brochureUrl } = req.body;
    if (!brochureUrl || typeof brochureUrl !== 'string') {
      return res.status(400).json({ message: 'A valid brochureUrl string is required for extraction.' });
    }

    const uploadsDir = path.join(__dirname, '../uploads');
    let pdfPath = '';

    // Handle uploaded file path vs external URL
    if (brochureUrl.startsWith('/uploads/')) {
      const filename = path.basename(brochureUrl);
      pdfPath = path.join(uploadsDir, filename);
    } else if (brochureUrl.includes('/uploads/')) {
      const parts = brochureUrl.split('/uploads/');
      const filename = parts[parts.length - 1];
      pdfPath = path.join(uploadsDir, filename);
    } else if (brochureUrl.startsWith('http://') || brochureUrl.startsWith('https://')) {
      // Download remote PDF into uploads temporary file
      const tempFilename = `remote_brochure_${Date.now()}.pdf`;
      pdfPath = path.join(uploadsDir, tempFilename);
      const fetchResponse = await fetch(brochureUrl);
      if (!fetchResponse.ok) {
        return res.status(400).json({ message: `Failed to download remote brochure: HTTP ${fetchResponse.status}` });
      }
      const arrayBuffer = await fetchResponse.arrayBuffer();
      fs.writeFileSync(pdfPath, Buffer.from(arrayBuffer));
    } else {
      return res.status(400).json({ message: 'Unrecognized brochureUrl format.' });
    }

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'Brochure PDF file was not found on the server.' });
    }

    const result = await processBrochure(pdfPath, uploadsDir, brochureUrl);
    res.json(result);
  } catch (err) {
    console.error('Error extracting brochure:', err);
    res.status(500).json({ message: `Brochure extraction failed: ${err.message}` });
  }
});

// POST /api/projects - Create project (Private - Admin)
router.post('/', auth, async (req, res) => {
  try {
    const projectData = { ...req.body };
    
    // Ensure numerical price
    if (projectData.startingPrice) {
      projectData.startingPrice = Number(projectData.startingPrice);
    }

    // Clean propertyTypes array
    if (typeof projectData.propertyTypes === 'string') {
      projectData.propertyTypes = projectData.propertyTypes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    const newProject = new Project(projectData);
    const savedProject = await newProject.save();

    res.status(201).json({
      success: true,
      message: 'Off-plan project created successfully',
      project: savedProject
    });
  } catch (err) {
    console.error('Error creating project:', err.message);
    res.status(400).json({ message: err.message || 'Validation error creating project' });
  }
});

// PUT /api/projects/:idOrSlug - Update project (Private - Admin)
router.put('/:idOrSlug', auth, async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let project = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      project = await Project.findById(idOrSlug);
    }
    if (!project) {
      project = await Project.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updates = { ...req.body };
    if (updates.startingPrice !== undefined && updates.startingPrice !== '') {
      updates.startingPrice = Number(updates.startingPrice);
    }

    if (typeof updates.propertyTypes === 'string') {
      updates.propertyTypes = updates.propertyTypes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    // Apply updates directly to the project model
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== '_id' && key !== '__v') {
        project[key] = updates[key];
      }
    });

    const saved = await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: saved
    });
  } catch (err) {
    console.error('Error updating project:', err.message);
    res.status(400).json({ message: err.message || 'Validation error updating project' });
  }
});

// DELETE /api/projects/:idOrSlug - Remove project (Private - Admin)
router.delete('/:idOrSlug', auth, async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let project = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      project = await Project.findById(idOrSlug);
    }
    if (!project) {
      project = await Project.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.findByIdAndDelete(project._id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting project:', err.message);
    res.status(500).json({ message: 'Server Error deleting project' });
  }
});

module.exports = router;
