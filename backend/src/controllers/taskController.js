import Task from "../models/taskModel.js";

// function for gettinga all the task
const getAllTask = async (req, res) => {
  // Try to get userId from params, query, or body for flexibility
  const userId = req.params.userId || req.query.userId || req.body.userId;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "user's id is required", success: false });
  }

  try {
    const result = await Task.find().populate("assigned_user");
    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ message: "No tasks found for this user", success: false });
    }
    const tasks = result;
    return res.status(200).json({ tasks: tasks, success: true });
  } catch (err) {
    console.error("Error getting Task: ", err);
    return res.status(500).json({ message: err, success: false });
  }
};

const taskController = {
  getAllTask,
};

export default taskController;
