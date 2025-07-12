import {Server} from 'socket.io';
import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import dotenv from 'dotenv';
dotenv.config();

 const socketManager = (server) =>{
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials : true
        },
    });


    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);



    socket.on("addTask", async (taskData) => {
        const { title, description, assigned_user, status, priority, owner } = taskData;
        if (!title) {
            socket.emit("addTaskResponse", { message: "Title is required", success: false, socketId: socket.id });
            return;
        }

        try {
            const newTask = new Task({
                title,
                description,
                assigned_user: assigned_user || null,
                owner,
                status: status || 'pending',
                priority: priority || 'medium'
            });

            const savedTask = await newTask.save();
            await User.findByIdAndUpdate(owner, { $push: { created_Tasks: savedTask._id } });
            io.emit("addTask", { message: "Task created successfully", task: savedTask, success: true, socketId: socket.id  });

        } catch (err) {
            console.error(err);
            io.emit("addTask", { message: `Internal server error: ${err}`, success: false, socketId: socket.id  });
        }
    })


    socket.on("deleteTask", async (data) => {
        const { taskId } = data;   
        if(!taskId) {
            socket.emit("deleteTask", { message: "Task ID is required", success: false, socketId: socket.id });
            return;
        }
        try{
            const deletedTask = await Task.findByIdAndDelete(taskId);
            if (!deletedTask) {
                socket.emit("deleteTask", { message: "Task not found", success: false, socketId: socket.id });
                return;
            }
            console.log("socket id: ", socket.id);
            await User.findByIdAndUpdate(deletedTask.owner, { $pull: { created_Tasks: taskId } });
            io.emit("deleteTask", { message: "Task deleted successfully", taskId, success: true, socketId: socket.id });


        }catch(err) {
            console.error("Error in deleting task: ", err);
            socket.emit("deleteTask", { message: `Internal server error: ${err}`, success: false, socketId: socket.id });
            return;
        }
    })


        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });

        // Add more event listeners as needed
    });

    return io;
}

export default socketManager;
