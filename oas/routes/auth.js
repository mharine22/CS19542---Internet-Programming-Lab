// auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db_connect'); // Database connection
const path = require('path'); // Import path module
const router = express.Router();

// Register User
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

router.post('/register', (req, res) => {
    const { username, email, password, role } = req.body; // Include role
    const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password

    const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'; // Include role in SQL query
    db.query(sql, [username, email, hashedPassword, role], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error registering user');
        }
        // Redirect to index with success message
        res.redirect('/index.html?message=Registration successful!'); 
    });
});

// Login User
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send('Invalid email or password');
        }

        const user = results[0];
        if (bcrypt.compareSync(password, user.password)) {
            req.session.userId = user.id; // Store user ID in session
            res.redirect('/view_auction.html'); // Redirect to auction view
        } else {
            res.status(401).send('Invalid email or password');
        }
    });
});

module.exports = router;
