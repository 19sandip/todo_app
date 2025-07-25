import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// Function to register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "please provide all the fields" });
  }

  try {
    const userExists = await User.find({ email: email });
    if (userExists.length > 0) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();
    return res.status(201).json({
      message: "user registered successfully",
      success: true,
      user: savedUser,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: `Internal server error : ${err}`, success: false });
  }
};

// function to login a user
const loginUser = async (req, res) => {
  const secret = process.env.JWT_SECRET;
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "please provide all the fields" });
  }

  try {
    const userExists = await User.findOne({ email: email }).populate([
      "created_Tasks",
      "assigned_Tasks",
      "team_members",
    ]);
    if (!userExists) {
      return res
        .status(400)
        .json({ message: "User does not exist with this email" });
    }
    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: userExists._id }, secret, { expiresIn: "1h" });
    return res.status(200).json({
      message: "User logged in successfully",
      token: token,
      success: true,
      user: userExists,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: `Internal server error : ${err}`, success: false });
  }
};

const userController = {
  loginUser,
  registerUser,
};

export default userController;
