const mongoose = require('mongoose');

const chatSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'default_bot'
  },
  systemPrompt: {
    type: String,
    required: true
  },
  temperature: {
    type: Number,
    default: 0.7,
    min: 0.0,
    max: 1.0
  },
  updatedBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatSetting', chatSettingSchema);
