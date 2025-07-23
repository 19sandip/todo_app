import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  assigned_Tasks: {
    type: [Schema.Types.ObjectId],
    ref: "task",
  },
  created_Tasks: {
    type: [Schema.Types.ObjectId],
    ref: "task",
  },
  team_members: {
    type: [Schema.Types.ObjectId],
    ref: "user",
  },
});

const User = model("user", userSchema);
export default User;
