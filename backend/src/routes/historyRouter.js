import Router from "express";
import getHistory from "../controllers/historyController.js";
const historyRouter = Router();

historyRouter.route("/get").get(getHistory);

export default historyRouter;
