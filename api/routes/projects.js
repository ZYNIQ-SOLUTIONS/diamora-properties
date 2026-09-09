const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

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
      query.developer = new RegExp(`^${developer}$`, 'i');
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
      const term = search.trim();
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

// PUT /api/projects/:id - Update project (Private - Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    let project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updates = { ...req.body };
    if (updates.startingPrice) {
      updates.startingPrice = Number(updates.startingPrice);
    }

    if (typeof updates.propertyTypes === 'string') {
      updates.propertyTypes = updates.propertyTypes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    project = await Project.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (err) {
    console.error('Error updating project:', err.message);
    res.status(400).json({ message: err.message || 'Validation error updating project' });
  }
});

// DELETE /api/projects/:id - Remove project (Private - Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.findByIdAndDelete(id);

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
