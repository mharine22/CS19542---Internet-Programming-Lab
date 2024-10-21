const express = require('express');
const multer = require('multer');
const db = require('../config/db_connect'); // Database connection
const path = require('path');
const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Save images in 'public/images'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    }
});

const upload = multer({ storage: storage });

// View Auction Items
router.get('/view_auction', (req, res) => {
    const sql = 'SELECT * FROM items';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching auction items');
        }
        // Render view_auction.html with items data
        res.sendFile(path.join(__dirname, '../public/view_auction.html'));
    });
});

// Render Bid Page
router.get('/bid', (req, res) => {
    const itemId = req.query.id;
    const sql = 'SELECT * FROM items WHERE id = ?'; 
    db.query(sql, [itemId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).send('Error fetching item details');
        }
        // Extract item details
        const auctionItem = results[0]; // Get the first result
        const { name, description, starting_price, end_time } = auctionItem;

        // Send the bid page with item details
        res.sendFile(path.join(__dirname, '../public/bid.html')); // Serve bid.html instead
    });
});

// Upload Auction Item
router.post('/upload_item', upload.single('image'), (req, res) => {
    const { name, description, starting_price, end_time } = req.body;
    const user_id = req.session.userId; // Get user ID from session
    const imagePath = '/images/' + req.file.filename; // File path

    // Updated SQL statement to use image_path
    const sql = 'INSERT INTO items (user_id, name, description, starting_price, end_time, image_path) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [user_id, name, description, starting_price, end_time, imagePath], (err, results) => {
        if (err) {
            console.error(err);
            console.error('SQL Query:', sql, [user_id, name, description, starting_price, end_time, imagePath]);
            return res.status(500).send('Error uploading item');
        }
        res.redirect('/view_auction');
    });
});

// Place a Bid
router.post('/place_bid', (req, res) => {
    const { item_id, bid_amount } = req.body;
    const user_id = req.session.userId; // Get user ID from session

    // Validate end time before placing the bid
    const sqlEndTime = 'SELECT end_time FROM items WHERE id = ?';
    db.query(sqlEndTime, [item_id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).send('Error fetching item details');
        }

        const endTime = new Date(results[0].end_time);
        const currentTime = new Date();

        if (currentTime >= endTime) {
            return res.status(400).send('The auction has already ended. You cannot place a bid.');
        }

        const sqlBid = 'INSERT INTO bids (item_id, user_id, bid_amount) VALUES (?, ?, ?)';
        db.query(sqlBid, [item_id, user_id, bid_amount], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error placing bid');
            }
            console.log('Bid placed:', { item_id, user_id, bid_amount });
            res.redirect('/view_auction');
        });
    });
});

// API Endpoints

// Get Auction Items
router.get('/api/auction_items', (req, res) => {
    const sql = 'SELECT * FROM items'; // Adjust your SQL query as needed
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching auction items' });
        }
        res.json(results); // Send auction items as JSON
    });
});

// Get Bids for a Specific Item
router.get('/api/bids', (req, res) => {
    const itemId = req.query.item_id; // Get the item_id from the query parameters
    const sql = 'SELECT username, bid_amount AS amount, timestamp FROM bids WHERE item_id = ?'; // Adjust query to filter by item_id
    db.query(sql, [itemId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching bids' });
        }
        res.json(results); // Send bids as JSON
    });
});

// Export the router
module.exports = router;
