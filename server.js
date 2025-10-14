// JavaScript Document
// server.js

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

// Initialize the Express application
const app = express();
const port = 3000;

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// =========================================================================
// PRODUCT DATA
// =========================================================================
const PRODUCTS = [
    { id: 'p1', name: 'Dried Molasses 50 Lbs', sku: '7.48936E+11', category: 'Grain', inStock: 3, wholesalePrice: 22.07, salePrice: 32.99 },
    { id: 'p2', name: 'Ball Pint And Half Jars Wide Mouth With', sku: '14400655005', category: 'other', inStock: 3, wholesalePrice: 8.26, salePrice: 15.99 },
    { id: 'p3', name: 'Snap Cut Pruning Saw', sku: '43063785316', category: 'other', inStock: 1, wholesalePrice: 22.37, salePrice: 31.95 },
    { id: 'p4', name: 'P-Line Tarp 12x20', sku: '11738112200', category: 'other', inStock: 2, wholesalePrice: 8.12, salePrice: 15.99 },
    { id: 'p5', name: 'Ice Chaser Floating Stock Tank De-Icer', sku: '85045004183', category: 'other', inStock: 6, wholesalePrice: 30.76, salePrice: 34.99 },
    { id: 'p6', name: 'Dare Equi-Rope 1/4 Braid', sku: '38923030941', category: 'other', inStock: 1, wholesalePrice: 64.38, salePrice: 75.99 },
    { id: 'p7', name: 'Propane Tank Exchange', sku: null, category: 'other', inStock: 5, wholesalePrice: 18.75, salePrice: 24.95 },
    { id: 'p8', name: 'ZON Propane Cannon', sku: '81180201018', category: 'other', inStock: 1, wholesalePrice: 282.88, salePrice: 319.99 },
    { id: 'p9', name: 'Squirrels No More', sku: '87042800361', category: 'other', inStock: 2, wholesalePrice: 9.39, salePrice: 16.99 },
    { id: 'p10', name: 'Horse Mints 5lb Bag', sku: '26079010474', category: 'Horse', inStock: 1, wholesalePrice: 13.92, salePrice: 24.99 },
    // ... (other products)
];

// =========================================================================
// EMAIL TRANSPORT
// =========================================================================
const transporter = nodemailer.createTransport({
    service: 'yahoo',
    auth: {
        user: 'rabby229@yahoo.com',
        pass: 'Dolce33!' // ⚠️ For production, use an app-specific password!
    }
});

// =========================================================================
// API ENDPOINTS
// =========================================================================

// Get all products
app.get('/api/products', (req, res) => {
    res.json(PRODUCTS);
});

// Get products by category
app.get('/api/products/:category', (req, res) => {
    const category = req.params.category.toLowerCase();
    const filteredProducts = PRODUCTS.filter(p => 
        p.category.toLowerCase().replace('/', '-') === category
    );

    if (filteredProducts.length === 0) {
        return res.status(404).json({ message: 'No products found for this category.' });
    }

    res.json(filteredProducts);
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    const formData = req.body;
    console.log('Received contact form submission:', formData);
    res.json({ message: 'Form submitted successfully!' });
});

// Order received (PayPal webhook or frontend call)
app.post('/api/order-received', (req, res) => {
    const orderDetails = req.body;

    let emailBody = 'New Order Received!\n\n';
    emailBody += `PayPal Order ID: ${orderDetails.details?.id}\n`;
    emailBody += `Payer Name: ${orderDetails.details?.payer?.name?.given_name || ''} ${orderDetails.details?.payer?.name?.surname || ''}\n`;
    emailBody += `Payer Email: ${orderDetails.details?.payer?.email_address}\n\n`;
    emailBody += 'Items:\n';

    if (orderDetails.items) {
        orderDetails.items.forEach(item => {
            emailBody += `- ${item.title} (x${item.qty}): $${(item.price * item.qty).toFixed(2)}\n`;
        });
    }

    const mailOptions = {
        from: 'rabby229@yahoo.com',
        to: 'rabby229@yahoo.com',
        subject: 'New Order - Hemlocks Farm & Garden',
        text: emailBody
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
            res.status(500).json({ message: 'Order received, but email notification failed.' });
        } else {
            console.log('Email sent:', info.response);
            res.json({ message: 'Order processed successfully and email sent.' });
        }
    });
});

// =========================================================================
// STATIC FILES
// =========================================================================
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =========================================================================
// START SERVER
// =========================================================================
app.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${port}`);
    console.log('Press Ctrl+C to stop the server.');
});
