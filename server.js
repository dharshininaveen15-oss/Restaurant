const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());
// Serves static files (images, standard CSS) from the public folder
app.use(express.static(path.join(__dirname, 'public'))); 

// --- 2. MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quickserve')
    .then(() => console.log('✅ MongoDB Connected (QuickServe Mode)'))
    .catch(err => console.log('❌ DB Error:', err));

// --- 3. Guest Order Model ---
const Order = mongoose.model('Order', new mongoose.Schema({
    items: Array,
    total: String,
    tableNumber: String, 
    timestamp: { type: Date, default: Date.now }
}));

// --- 4. Page Routing Logic ---
// This helper points to your public/views folder and appends .html automatically
const viewPath = (name) => path.join(__dirname, 'public', 'views', `${name}.html`);

// Main Menu Routes
app.get('/', (req, res) => res.sendFile(viewPath('menu')));
app.get('/menu', (req, res) => res.sendFile(viewPath('menu')));

// Legal Routes (Privacy & Terms)
app.get('/privacy', (req, res) => res.sendFile(viewPath('privacy')));
app.get('/terms', (req, res) => res.sendFile(viewPath('terms')));

// Functional Routes
app.get('/checkout', (req, res) => res.sendFile(viewPath('checkout')));
app.get('/contact', (req, res) => res.sendFile(viewPath('contact')));

// Redirects
app.get('/home', (req, res) => res.redirect('/menu'));

// --- 5. API for Orders ---
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ success: true, message: "Order placed successfully!" });
    } catch (err) {
        console.error("Order Save Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 6. 404 Catch-all ---
// If a user types a URL that doesn't exist, send them back to the menu
app.use((req, res) => {
    res.status(404).redirect('/menu');
});

// --- 7. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`---`);
    console.log(`🚀 QuickServe Backend Active: http://localhost:${PORT}`);
    console.log(`📁 Serving views from: ./public/views/`);
    console.log(`---`);
});