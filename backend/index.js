import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import userRouter from './src/routes/userRouter.js';
import taskRouter from './src/routes/taskRouter.js';
import socketManager from './src/controllers/socketManager.js';
dotenv.config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
     origin: "*", // ✅ your React app origin
  credentials: true
}));

 console.log("connecting to socket with frontend")
const httpServer = createServer(app);
const io = socketManager(httpServer)

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
app.use("/api/user", userRouter);
app.use("/api/task", taskRouter);


const start = async () => {
    // Connect to MongoDB first
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        // Start the server only after successful DB connection
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit the process with failure
    }
};

start();
