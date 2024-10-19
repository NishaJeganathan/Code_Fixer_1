// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Initialize the Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Basic route for the homepage
app.get('/', (req, res) => {
  res.send('Welcome to My Full-Stack App Backend!');
});

// Example route for another page (e.g., login)
app.get('/login', (req, res) => {
  res.send('This is the login page');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is running on port ${PORT}");
});