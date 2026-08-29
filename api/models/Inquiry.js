const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['consultation', 'newsletter', 'property_inquiry'], 
    default: 'consultation' 
  },
  name: { type: String, default: '' },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  budget: { type: String, default: '' },
  intent: { type: String, default: '' },
  propertyTitle: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Qualified', 'Closed'], 
    default: 'New' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
