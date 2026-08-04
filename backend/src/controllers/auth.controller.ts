import { Request, Response } from "express";
import User from "../models/user.model";
import generateToken from "../utils/generateToken";
import { AuthRequest } from "../middleware/auth";

// Roles a client is allowed to self-assign at registration. "admin" is
// deliberately excluded — it can only be granted through a privileged flow,
// otherwise anyone could POST { role: "admin" } and become an admin.
const SELF_ASSIGNABLE_ROLES = ["buyer", "vendor"];

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const safeRole = SELF_ASSIGNABLE_ROLES.includes(role) ? role : "buyer";

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: safeRole,
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
    console.error("Register error:", error.message);
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
