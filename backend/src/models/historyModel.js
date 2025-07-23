import { Schema, model } from "mongoose";

const historySchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    default: new Date(),
  },
});

const History = model("history", historySchema);

export default History;
