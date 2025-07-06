import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

//Todo here in create task function => Check if the owner exists in middleware and title are unique
const createTask = async (req, res) => {
    const { title, description, assigned_user, status, priority, owner } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    try {
        //Todo => Check if the owner exists in middleware and title are unique

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
        return res.status(201).json({ message: "Task created successfully", task: savedTask, success : true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Internal server error: ${err}`, success: false });
    }
}



// Editing the task here
const editTask = async (req, res) => {
    const { taskId, title, description, status, priority, owner } = req.body;

    if (!taskId) {
        return res.status(400).json({ message: "Task ID is required" });
    }

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { title, description, status, priority },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({ message: "Task updated successfully", task: updatedTask });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Internal server error: ${err}` });
    }

}


// function for deleting the task, one to do is here deleting the id of deleted task from owner's array
const deleteTask = async (req, res) => {
    const { taskId } = req.body;
    if (!taskId) {
        return res.status(400).json({ message: "Task ID is required" });
    }

    try {
        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        // todo, you can also remove the task from the user's created_Tasks or assigned_Tasks

        res.status(200).json({ message: "Task deleted successfully", task: deletedTask });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Internal server error: ${err}` });
    }

}


// function for assigning the task
const assignTask = async (req, res) => {
   const {taskId, assignedUserId} = req.body;

   if(!taskId || !assignedUserId) {
       return res.status(400).json({ message: "Task ID and Assigned User ID are required" });
   }

    try{
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const user = await User.findById(assignedUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        task.assigned_user = assignedUserId;
        await task.save();

        // Optionally, you can also update the user's tasks
        await User.findByIdAndUpdate(assignedUserId, { $push: { assigned_Tasks: task._id } });
        return res.status(200).json({ message: "Task assigned successfully", task });

    }catch(err) {
        console.error(err);
        return res.status(500).json({message: `Internal server error: ${err}`})
    }


}

const getAllTask = async (req, res) => {
    // Try to get userId from params, query, or body for flexibility
    const userId = req.params.userId || req.query.userId || req.body.userId;
    console.log("params:", req.params);
    console.log("userId", userId);
    if (!userId) {
        return res.status(401).json({ message: "user's id is required", success: false });
    }

    try {
        const result = await User.findOne({ _id: userId }).populate("created_Tasks");
        if (!result) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        const tasks = result.created_Tasks;
        return res.status(200).json({ tasks: tasks, success: true });

    } catch (err) {
        console.error("Error getting Task: ", err);
        return res.status(500).json({ message: err, success: false });
    }
}


const taskController = {
    createTask,
    editTask,
    deleteTask,
    assignTask,
    getAllTask

}

export default taskController;