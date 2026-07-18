import mongoose from 'mongoose';
import { databaseConnectionState } from '../metrics.js';

const connectDB = async () => {
    try {
        databaseConnectionState.set(mongoose.connection.readyState);
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection;
        databaseConnectionState.set(db.readyState);
        console.log("MongoDB Connected to DB:", db.name);
    } catch (err) {
        databaseConnectionState.set(mongoose.connection.readyState);
        console.error("DB Connection Failed", err);
    }
};

mongoose.connection.on('connected', () => databaseConnectionState.set(1));
mongoose.connection.on('disconnected', () => databaseConnectionState.set(0));
mongoose.connection.on('connecting', () => databaseConnectionState.set(2));
mongoose.connection.on('disconnecting', () => databaseConnectionState.set(3));

export default connectDB;
