const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
const nurseRoutes = require('./routes/nurseRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const overtimeRoutes = require('./routes/overtimeRoutes');
const { seedFourDepartmentsDatabase } = require('./seed');

let seedInProgress = false;

app.use('/api/nurses', nurseRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/overtime', overtimeRoutes);

app.post('/seed', async (req, res) => {
    if (seedInProgress) {
        return res.status(409).json({ message: 'Database seeding is already in progress' });
    }

    seedInProgress = true;
    console.log('[seed] Seed request received');

    try {
        const result = await seedFourDepartmentsDatabase();
        console.log('[seed] Seed completed successfully');
        res.json(result);
    } catch (error) {
        console.error('[seed] Seed failed:', error.message);
        res.status(500).json({ message: 'Database seed failed', error: error.message });
    } finally {
        seedInProgress = false;
    }
});

// Serve Frontend Static Files
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// SPA Fallback for client-side routing
app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nursing_portal')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Integrated Server is running on port ${PORT}`);
});
