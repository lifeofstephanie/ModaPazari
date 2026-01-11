import { Request, Response } from "express";
import User from "../models/user.model";
import generateToken from "../utils/generateToken";
import { AuthRequest } from "../middleware/auth";

export const registerUser = async (req: Request, res: Response) => {
  try {
    console.log("Register request body:", req.body);

    const { firstName, lastName, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(String(user._id)),
    });
  } catch (error: any) {
    console.error("Register error:", error.message, error.stack);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(String(user._id)),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
