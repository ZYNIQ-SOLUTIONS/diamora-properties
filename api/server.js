require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Diamora Properties API running on port ${PORT}`));
