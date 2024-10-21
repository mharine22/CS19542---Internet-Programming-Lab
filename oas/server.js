const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./config/db_connect'); // Import database connection
const authRoutes = require('./routes/auth'); // Import auth routes
const auctionRoutes = require('./routes/auction'); // Import auction routes

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key', // Change this to a strong secret
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Routes
app.use('/', authRoutes); // Handle auth routes
app.use('/', auctionRoutes); // Handle auction routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
