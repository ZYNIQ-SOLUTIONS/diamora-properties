const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const auth = require('../middleware/auth');

// GET /api/properties - Public
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/properties/:id - Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Property not found' });
    res.status(500).send('Server Error');
  }
});

// POST /api/properties - Private
router.post('/', auth, async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    const property = await newProperty.save();
    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT /api/properties/:id - Private
router.put('/:id', auth, async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE /api/properties/:id - Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
