require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const authRoutes = require('./auth');
const taskRoutes = require('./tasks');

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
