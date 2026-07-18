const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Body parser
app.use(express.json());

// Enable CORS for frontend API consumption
const allowedOrigins = [
  'http://localhost:3000',
  'https://stadium-pulse-phi.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Dev logging output
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crowd', require('./routes/crowd'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/protocols', require('./routes/protocol'));

// Basic health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'StadiumPulse API', version: '1.0.0' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
  });
}

module.exports = { app, server };
