import { Server } from "socket.io";
import User from "../models/userModel.js";
import Task from "../models/taskModel.js";
import History from "../models/historyModel.js";
import dotenv from "dotenv";
dotenv.config();

const socketManager = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    //event for adding task
    socket.on("addTask", async (taskData) => {
      const { title, description, assigned_user, status, priority, owner } =
        taskData;

      if (!owner) {
        socket.emit("error", { message: "Owner is required" });
        return;
      }

      if (!title) {
        socket.emit("error", { message: "Title is required" });
        return;
      }

      try {
        const isTaskExist = await Task.findOne({ title: title });
        if (isTaskExist) {
          socket.emit("error", { message: "This task already Exists" });
          return;
        }
        const newTask = new Task({
          title,
          description,
          assigned_user: assigned_user || null,
          owner,
          status: status || "pending",
          priority: priority || "medium",
        });

        const savedTask = await newTask.save();
        await User.findByIdAndUpdate(owner, {
          $push: { created_Tasks: savedTask._id },
        });
        io.emit("addTask", {
          message: "Task created successfully",
          task: savedTask,
          success: true,
          socketId: socket.id,
        });
      } catch (err) {
        console.error(err);
        socket.emit("error", { message: `Internal server error: ${err}` });
      }
    });

    // event for deleting task
    socket.on("deleteTask", async (data) => {
      const { task } = data;
      if (!task) {
        socket.emit("error", {
          message: "task not exist",
        });
        return;
      }
      try {
        const deletedTask = await Task.findByIdAndDelete(task._id);
        if (!deletedTask) {
          socket.emit("deleteTask", {
            message: "Task not found",
            success: false,
            socketId: socket.id,
          });
          return;
        }

        const assignedUser = await User.findById(task.assigned_user);
        if (assignedUser) {
          assignedUser.assigned_Tasks.pull(task._id);
          await assignedUser.save();
        }

        const user = await User.findByIdAndUpdate(deletedTask.owner, {
          $pull: { created_Tasks: task._id },
        });
        io.emit("deleteTask", {
          message: "Task deleted successfully",
          task: deletedTask,
          success: true,
          socketId: socket.id,
          userId: user._id,
          assignedUserId: assignedUser?._id,
        });
      } catch (err) {
        console.error("Error in deleting task: ", err);
        socket.emit("error", {
          message: `Internal server error: ${err}`,
        });
      }
    });

    // event for showing real time drag and drop
    socket.on("dragAndDrop", async (result) => {
      if (!result) {
        socket.emit("dragAndDrop", {
          message: "something went wrong while dragging",
          success: false,
          socketId: socket.id,
        });
      }
      try {
        const task = await Task.findById(result.draggableId);
        if (!task) {
          io.emit("dragAndDrop", {
            message: "task not found",
            success: false,
            socketId: socket.id,
          });
        }
        task.status = result.destination.droppableId;
        const statusChangedTask = await task.save();
        io.emit("dragAndDrop", {
          message: "Dragged task status changed successfully",
          socketId: socket.id,
          task: statusChangedTask,
          success: true,
          dndResult: result,
        });
      } catch (err) {
        console.error("Error in dnd", err);
        io.emit("dragAndDrop", { message: err, success: false });
      }
    });

    // event for editting task

    socket.on("editTask", async (taskData) => {
      const { taskId, newTitle, newDescription, userId } = taskData;

      if (!taskId || !newTitle) {
        socket.emit("error", { message: "Task ID and title are required" });
        return;
      }

      try {
        const task = await Task.findById(taskId);

        if (!task) {
          socket.emit("error", { message: "Task not found" });
          return;
        }
        const user = await User.findById(userId);
        if (!user) {
          socket.emit("error", { message: "user not found" });
          return;
        }
        task.title = newTitle;
        task.description = newDescription || task.description;
        const updatedTask = await task.save();
        io.emit("editTask", {
          message: "Task updated successfully",
          task: updatedTask,
          success: true,
          socketId: socket.id,
        });
      } catch (err) {
        console.error("Error in editing task: ", err);
        socket.emit("error", {
          message: `Internal server error: ${err}`,
          success: false,
        });
        return;
      }
    });

    // event for syncing edit input with peer user
    socket.on("edittingTask", (taskData) => {
      const { newTitle, newDes, taskId } = taskData;
      try {
        io.emit("edittingTask", {
          newTitle,
          newDes,
          edittinTaskId: taskId,
          socketId: socket.id,
        });
      } catch (err) {
        console.error(err);
        socket.emit("error", { message: err, success: false });
      }
    });

    // assigning task
    socket.on("assignTask", async (userData) => {
      const { member_email, userId, taskId } = userData;
      if (!member_email || !taskId || !userId) {
        socket.emit("error", {
          message: "email & task's id are required to assign",
        });
        return;
      }

      try {
        const member_user = await User.findOne({ email: member_email });

        if (!member_user) {
          socket.emit("error", { message: "This member is not exists" });
          return;
        }
        const isTaskExist = await Task.findById(taskId).populate(
          "assigned_user"
        );

        if (!isTaskExist) {
          socket.emit("error", { message: "task not found" });
          return;
        }

        const user = await User.findById(userId).populate("team_members");

        if (!isTaskExist.owner.equals(user._id)) {
          socket.emit("error", { message: "You haven't created this task!" });
          return;
        }

        if (
          !user.team_members.some((memberId) =>
            memberId.equals(member_user._id)
          )
        ) {
          socket.emit("error", { message: "This user is not in your team" });
          return;
        }

        let prevAssignedUser = null;

        for (const member of user.team_members) {
          if (member.email === member_email) {
            if (member.assigned_Tasks.includes(taskId)) {
              socket.emit("error", {
                message: "This task is already assigned to this user",
              });
              return; // Exit the async handler completely
            } else {
              if (
                isTaskExist.assigned_user !== null &&
                isTaskExist.assigned_user !== undefined
              ) {
                const prevAssignedUserId = isTaskExist.assigned_user._id;
                prevAssignedUser = await User.findById(prevAssignedUserId);
                if (prevAssignedUser && prevAssignedUser.assigned_Tasks) {
                  prevAssignedUser.assigned_Tasks.pull(isTaskExist._id);
                  await prevAssignedUser.save();
                }
              }

              member.assigned_Tasks.push(taskId);
              isTaskExist.assigned_user = member._id;
              await isTaskExist.save();
              await member.save();
            }
          }
        }

        io.emit("assignTask", {
          message: "Task assigned successfully",
          assigned_task: isTaskExist,
          success: true,
          socketId: socket.id,
          assigned_user: member_user,
          currUser: user,
          prevAssignedUser,
        });
      } catch (err) {
        console.error("Error in assigning:", err);
        socket.emit("error", { message: err });
      }
    });

    // setting history
    socket.on("setHistory", async (historyData) => {
      const { who, what } = historyData;
      if (!who) {
        socket.emit("error", { message: "Doer is required !" });
      }
      try {
        // Step 1: Insert new history item
        const savedHistory = await History.create({
          username: who,
          action: what,
        });

        // Step 2: Count histories for the user
        const count = await History.countDocuments();

        // Step 3: If count > 20, delete the oldest entries
        if (count > 20) {
          const oldest = await History.find()
            .sort({ timestamp: 1 }) // ascending = oldest first
            .limit(count - 20); // number of items to delete

          const idsToDelete = oldest.map((entry) => entry._id);
          await History.deleteMany({ _id: { $in: idsToDelete } });
        }
        io.emit("getHistory", {
          message: "History updated successfully",
          newHistory: savedHistory,
          success: true,
          socketId: socket.id,
        });
      } catch (err) {
        console.error("Error in adding history: ", err);
        socket.emit("error", { message: err });
      }
    });

    socket.on("addMember", async (data) => {
      const { member_email, userId } = data;
      if (!member_email || !userId) {
        socket.emit("error", {
          message: "Member email and user ID are required",
        });
        return;
      }
      try {
        const isMemberExist = await User.findOne({ email: member_email });

        if (!isMemberExist) {
          socket.emit("error", { message: "Please enter a valid email" });
          return;
        }
        const user = await User.findById(userId);
        if (user.team_members.includes(isMemberExist._id)) {
          socket.emit("error", {
            message: "This member is already added to your team",
          });
          return;
        }
        user.team_members.push(isMemberExist._id);
        isMemberExist.team_members.push(user._id);
        await user.save();
        await isMemberExist.save();

        io.emit("addMember", {
          message: "member added successfully",
          success: true,
          currUser: user,
          member: isMemberExist,
        });
      } catch (err) {
        console.error("Error in add member", err);
        socket.emit("error", { message: err });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Add more event listeners as needed
  });

  return io;
};

export default socketManager;
