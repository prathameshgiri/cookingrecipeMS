const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// --- User App (Port 3000) ---
const app = express();
const USER_PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
// Serve user static files (we will intercept admin.html to hide it from port 3000)
app.use(express.static(path.join(__dirname, 'public'), { index: 'index.html' }));

// Block access to admin.html on port 3000
app.get('/admin.html', (req, res) => {
    res.status(403).send('Admin portal only accessible on Port 3001');
});

// --- Admin App (Port 3001) ---
const adminApp = express();
const ADMIN_PORT = 3001;

adminApp.use(cors());
adminApp.use(bodyParser.json());
// Disable index.html so admin.html is correctly served on root (/)
adminApp.use(express.static(path.join(__dirname, 'public'), { index: false }));
// Make root serve admin.html on port 3001
adminApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Data file paths
const recipesFile = path.join(__dirname, 'data', 'recipes.json');
const feedbackFile = path.join(__dirname, 'data', 'feedback.json');
const contactFile = path.join(__dirname, 'data', 'contact.json');

// Helper functions to read/write JSON
const readData = (file) => {
    try {
        if (!fs.existsSync(file)) return [];
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeData = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error) {}
};

// ======== User APIs (Port 3000) ========

// API: Get all recipes
app.get('/api/recipes', (req, res) => {
    res.json(readData(recipesFile));
});

// API: Get feedback for a specific recipe
app.get('/api/feedback/:recipeId', (req, res) => {
    const feedbacks = readData(feedbackFile);
    const recipeFeedbacks = feedbacks.filter(f => f.recipeId === parseInt(req.params.recipeId));
    res.json(recipeFeedbacks);
});

// API: Submit feedback for a recipe
app.post('/api/feedback', (req, res) => {
    const { recipeId, user, comment, rating } = req.body;
    if (!recipeId || !user || !comment) return res.status(400).json({ message: "Missing data" });

    const feedbacks = readData(feedbackFile);
    const newFeedback = { id: Date.now(), recipeId: parseInt(recipeId), user, comment, rating: rating || 5, date: new Date().toISOString() };
    feedbacks.push(newFeedback);
    writeData(feedbackFile, feedbacks);
    res.status(201).json({ message: "Feedback submitted successfully", feedback: newFeedback });
});

// API: Contact Us Form Submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: "Missing data" });

    const contacts = readData(contactFile);
    contacts.push({ id: Date.now(), name, email, message, date: new Date().toISOString() });
    writeData(contactFile, contacts);
    res.status(201).json({ message: "Message sent successfully!" });
});


// ======== Admin APIs (Port 3001) ========

// API: Admin Login
adminApp.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ token: 'fake-jwt-token-for-admin-auth', success: true });
    } else {
        res.status(401).json({ message: 'Invalid credentials', success: false });
    }
});

// API: Get all feedbacks (Admin only)
adminApp.get('/api/admin/feedbacks', (req, res) => {
    if (req.headers.authorization === 'Bearer fake-jwt-token-for-admin-auth') {
        res.json(readData(feedbackFile));
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

// API: Get all contacts (Admin only)
adminApp.get('/api/admin/contacts', (req, res) => {
    if (req.headers.authorization === 'Bearer fake-jwt-token-for-admin-auth') {
        res.json(readData(contactFile));
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});


// Start both servers
app.listen(USER_PORT, () => {
    console.log(`User server is running on http://localhost:${USER_PORT}`);
});

adminApp.listen(ADMIN_PORT, () => {
    console.log(`Admin server is running on http://localhost:${ADMIN_PORT}`);
});
