const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const auth = require('../middleware/auth');

// POST /api/inquiries - Public (Save lead from website)
router.post('/', async (req, res) => {
  try {
    const { type, name, email, phone, budget, intent, propertyTitle, message } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const newInquiry = new Inquiry({
      type: type || 'consultation',
      name: name || '',
      email,
      phone: phone || '',
      budget: budget || '',
      intent: intent || '',
      propertyTitle: propertyTitle || '',
      message: message || '',
      status: 'New'
    });

    const saved = await newInquiry.save();
    res.status(201).json({
      success: true,
      message: 'Inquiry received successfully',
      inquiry: saved
    });
  } catch (err) {
    console.error('Error saving inquiry:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/inquiries - Private (Admin access)
router.get('/', auth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    console.error('Error fetching inquiries:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/inquiries/:id - Private (Update lead status)
router.put('/:id', auth, async (req, res) => {
  try {
    let inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(inquiry);
  } catch (err) {
    console.error('Error updating inquiry:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/inquiries/:id - Private (Delete lead)
router.delete('/:id', auth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inquiry removed' });
  } catch (err) {
    console.error('Error deleting inquiry:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
