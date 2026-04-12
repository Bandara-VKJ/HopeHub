const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Example API (your streak)
app.get('/api/streak', (req, res) => {
  res.json({
    days: 50,
    message: 'Keep going 🔥'
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});