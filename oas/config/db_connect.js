// config/db_connect.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         // Change if your MySQL username is different
    password: '',         // Change if you have a password
    database: 'auction_system' // Your database name
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

module.exports = db;
