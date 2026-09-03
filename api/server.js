require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static Media Delivery
app.use('/uploads', express.static(uploadsDir));

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diamora';
mongoose.connect(mongoURI)
  .then(() => console.log(`MongoDB connected successfully to ${mongoURI}`))
  .catch(err => console.log('MongoDB connection notice:', err.message));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Diamora Properties API',
    time: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Diamora Properties API running on port ${PORT}`));
