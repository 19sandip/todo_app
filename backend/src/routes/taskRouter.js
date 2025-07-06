import { Router } from "express";
import taskController from "../controllers/taskController.js";

const taskRouter = Router();
taskRouter.route("/create").post(taskController.createTask);
taskRouter.route("/edit").post(taskController.editTask);
taskRouter.route("/delete").post(taskController.deleteTask);
taskRouter.route("/assign").post(taskController.assignTask);
taskRouter.route("/get").get(taskController.getAllTask);


export default taskRouter;