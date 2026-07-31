const express = require('express');
const cors = require('cors');
const config = require('./config/config');

const app = express();   // <-- this MUST come before any app.use(...)

const allowedOrigins = [
  'http://localhost:5173',
  'https://full-stack-project-murex-six.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                       /^https:\/\/full-stack-project-.*\.vercel\.app$/.test(origin);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json()); // if you're not already parsing JSON bodies somewhere

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const questionsRoutes = require('./routes/questions');
const interviewsRoutes = require('./routes/interviews');
const codingRoutes = require('./routes/coding');
const videosRoutes = require('./routes/videos');
const progressRoutes = require('./routes/progress');
const leaderboardRoutes = require('./routes/leaderboard');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});