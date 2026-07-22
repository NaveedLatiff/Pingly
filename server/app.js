import './tracing.js';
import express from "express";
import cors from "cors";
import 'dotenv/config';
import http from "http";
import { Server } from "socket.io";
import mongoose from 'mongoose';
import cookieParser from "cookie-parser";
import { trace } from '@opentelemetry/api';
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/auth.js";
import messageRouter from "./routes/message.js";
import Message from "./models/message.js";
import { register, httpRequestCounter, httpRequestDuration, activeSocketConnections, activeOnlineUsers } from './metrics.js';

const app = express();
const server = http.createServer(app);
const tracer = trace.getTracer('pingly-server');

// 1. Core Middlewares (Placed at top for proper metric capture)
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// 2. Metrics Middleware (Captures Latency & Traffic)
app.use((req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const duration = process.hrtime(start);
        const seconds = duration[0] + duration[1] / 1e9;
        const route = req.route ? req.route.path : req.path;
        const labels = { method: req.method, route, status_code: res.statusCode };
        
        httpRequestCounter.inc(labels);
        httpRequestDuration.observe(labels, seconds);
    });
    next();
});

// 3. Prometheus Endpoint
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

app.get('/health', (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? 'ok' : 'degraded',
        database: databaseConnected ? 'connected' : 'disconnected',
    });
});

app.get('/tracing-test', async (req, res) => {
    await tracer.startActiveSpan('tracing-test-span', async (span) => {
        try {   
            span.setAttribute('test.route', '/tracing-test');
            span.addEvent('entered tracing-test route');
            res.json({ message: 'Tracing test route executed' });
        } catch (error) {
            span.recordException(error);
            res.status(500).json({ error: 'Tracing test route failed' });
        } finally {
            span.end();
        }
    });
});

// 4. Socket.io Setup
const io = new Server(server, {
    cors: { origin: ["http://localhost:3000"], credentials: true }
});

export const userSocketMap = {};

io.on("connection", (socket) => {
    activeSocketConnections.inc(); // Monitoring total connections

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    activeOnlineUsers.set(Object.keys(userSocketMap).length);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("markMessageAsSeen", async ({ messageId, senderId, receiverId }) => {
        try {
            await Message.findByIdAndUpdate(messageId, { seen: true });
            const senderSocketId = userSocketMap[senderId];
            if (senderSocketId) io.to(senderSocketId).emit("messagesSeen", { seenBy: receiverId });
        } catch (error) {
            console.error("Socket error:", error);
        }
    });

    socket.on("disconnect", () => {
        activeSocketConnections.dec(); // Decrement on disconnect
        delete userSocketMap[userId];
        activeOnlineUsers.set(Object.keys(userSocketMap).length);
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// Inject io into request for routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/auth', authRouter);
app.use('/message', messageRouter);

const PORT = process.env.PORT || 3003;
connectDB();

server.listen(PORT, () => {
    console.log(`Server (with Socket.io & Metrics) is running on port ${PORT}`);
});

export { app, io, server };
