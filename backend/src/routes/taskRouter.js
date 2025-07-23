import { Router } from "express";
import taskController from "../controllers/taskController.js";

const taskRouter = Router();
taskRouter.route("/get").get(taskController.getAllTask);

export default taskRouter;
