//--------------------------------- Importing Libraries and Defining Constants ---------------------------------//

if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;
const apiAuthRouter = require('./routes/api/auth');
const apiListingsRouter = require('./routes/api/listings');
const apiReviewsRouter = require('./routes/api/reviews');
const apiAiRouter = require('./routes/api/ai');
const agentChatRouter = require('./routes/api/agentChat');
const { verifyToken, requireAuth } = require('./middleware/apiAuth');
//--------------------------------- Initializing Express App ---------------------------------//

const app = express();

// CORS for React (dev: localhost:5173; production: set FRONTEND_URL in env)
// credentials: true required when client sends Authorization header cross-origin
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.set('trust proxy', true);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



//--------------------------------- Establishing MongoDB Connection ---------------------------------//

const main = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Successfully connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

main();

//--------------------------------- Routes ---------------------------------//

function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

app.use((req, res, next) => {
    try {
        req.time = new Date().toDateString();
        console.log(`[${req.time}] ${req.method} ${req.url} - Host: ${req.hostname}`);
        next();
    } catch (error) {
        console.error('Error processing request:', error);
        next(error);
    }
});

// API routes (JSON, JWT auth)
app.use('/api/auth', apiAuthRouter);
// Temp: seed listings with images, amenities, etc. (GET /api/seed-listings)
const { runSeed } = require('./scripts/seedListings');
app.get('/api/seed-listings', asyncWrap(async (req, res) => {
    const result = await runSeed({ disconnect: false });
    const inserted = result.inserted.length;
    const msg = result.skipped === 0
        ? `Seeded ${inserted} listings.`
        : `Inserted ${inserted} new seed listings; ${result.skipped} already existed.`;
    res.json({
        success: true,
        message: msg,
        inserted: inserted,
        skipped: result.skipped,
        total: result.total,
    });
}));
app.use('/api/listings', apiListingsRouter);
app.use('/api/listings/:id/reviews', apiReviewsRouter);
// AI routes require login (JWT)
app.use('/api/ai', verifyToken, requireAuth, apiAiRouter);
app.use('/api/agent', verifyToken, requireAuth, agentChatRouter);

// Serve React build and SPA fallback (when client/dist exists after `cd client && npm run build`)
const clientDist = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(clientDist, 'index.html'), (err) => { if (err) next(err); });
    });
}

//--------------------------------- Error Handling Middleware ---------------------------------//

// app.all('*', (req, res, next) => {
//     next(new ExpressError(404, 'Page Not Found'));
// });
app.all('*', (req, res, next) => {
    const err = new Error('Page Not Found');
    err.statusCode = 404;
    next(err);
});


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    console.error('Error Occurred:', err);
    res.status(statusCode).json({ success: false, message });
});

//--------------------------------- Start the Server ---------------------------------//

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
