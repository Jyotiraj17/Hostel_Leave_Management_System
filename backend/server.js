const dns = require("dns");

dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const wardenRoutes = require('./routes/warden.routes');
const studentRoutes = require('./routes/student.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files and uploads
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/student', studentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'HMS Backend API is running smoothly' });
});

// Serve frontend SPA/MPA default fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../frontend/auth/login.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend page not found');
    }
  });
});

// Global Error Handler
app.use(errorHandler);

// Seed Default Admin Account if missing
const seedDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'jyotirajpanda17@gmail.com';
      const adminPassword = process.env.DEFAULT_ADMIN_PASS || 'Admin@123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      console.log(`[Seed] Initial Admin Account Created: ${adminEmail} / ${adminPassword}`);
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed default admin:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

// Start Server
connectDB().then(() => {
  seedDefaultAdmin();
  app.listen(PORT, () => {
    console.log(`HMS Backend Server running on http://localhost:${PORT}`);
  });
});
