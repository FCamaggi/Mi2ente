require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const courseRoutes = require('./routes/courses.routes');
const schoolRoutes = require('./routes/schools.routes');
const debugRoutes = require('./routes/debug.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/schools', schoolRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', debugRoutes);
}

app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.status(readyState === 1 ? 200 : 503).json({
    success: readyState === 1,
    data: {
      status: readyState === 1 ? 'ok' : 'degraded',
      database: {
        state: states[readyState] || 'unknown',
        connected: readyState === 1
      }
    }
  });
});

app.use(errorHandler);

async function startServer() {
  await connectDB();
  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
}

startServer().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err.message);
  process.exit(1);
});
