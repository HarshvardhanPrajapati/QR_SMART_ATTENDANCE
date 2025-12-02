const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Create HTTP server & Socket.io instance
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
});

// Make io available in routes/controllers
app.set('io', io);

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('joinSession', (sessionId) => {
        if (!sessionId) return;
        socket.join(String(sessionId));
        console.log(`Socket ${socket.id} joined session room ${sessionId}`);
    });

    socket.on('leaveSession', (sessionId) => {
        if (!sessionId) return;
        socket.leave(String(sessionId));
        console.log(`Socket ${socket.id} left session room ${sessionId}`);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

// Import Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const adminRoutes = require('./routes/admin');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);

// Default Route
app.get('/', (req, res) => {
    res.send('QR Attendance API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});