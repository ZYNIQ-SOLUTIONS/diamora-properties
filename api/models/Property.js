const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  propertyType: { type: String, required: true }, // e.g., 'Villa', 'Apartment', 'Penthouse'
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  area: { type: Number, required: true }, // in sq ft or sqm
  imageUrl: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  gallery: [{ type: String }],
  status: { type: String, default: 'Available' } // 'Available', 'Sold', 'Rented', 'Reserved', 'Off-Market'
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
