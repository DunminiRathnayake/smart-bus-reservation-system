const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');

// Import routes
const authRoutes = require('./modules/auth/routes/routes');
const userRoutes = require('./modules/user/routes/routes');
const busRoutes = require('./modules/bus/routes/routes');
const routeRoutes = require('./modules/route/routes/routes');
const driverRoutes = require('./modules/driver/routes/routes');
const scheduleRoutes = require('./modules/schedule/routes/routes');
const seatRoutes = require('./modules/seat/routes/routes');
const bookingRoutes = require('./modules/booking/routes/routes');
const paymentRoutes = require('./modules/payment/routes/routes');
const ticketRoutes = require('./modules/ticket/routes/routes');
const feedbackRoutes = require('./modules/feedback/routes/routes');
const dashboardRoutes = require('./modules/dashboard/routes/routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'SmartGo REST API',
    version: '1.0.0',
    description: 'Smart Bus Reservation & Management System backend services.'
  });
});

// Versioned Modular API Routing Configuration
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/buses', busRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/schedules', seatRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/admin/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin/payments', paymentRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
