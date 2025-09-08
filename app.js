const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;
const subscribers = {};
const cors = require('cors');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], }));
const mongoURI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`;

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connection successful'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

app.use((req, res, next) => {
    if (req.path.includes('/') && req.method === 'GET') {
        res.set('X-Accel-Buffering', 'no');
        res.set('Cache-Control', 'no-cache');
    }
    next();
});

// Routes
const mainRoutes = require('./routes/index')(subscribers);
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const adminRoutes = require('./routes/admin');

// App routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', mainRoutes);


process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    Object.keys(subscribers).forEach(topicId => {
        subscribers[topicId].forEach(subscriberInfo => {
            try {
                subscriberInfo.res.end();
            } catch (error) {
                console.error('Error closing SSE connection:', error);
            }
        });
    });

    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
});