import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/user.model";
import generateToken from "../utils/generateToken";
import { sendEmail, emailTemplates } from "../services/email.service";

// Roles a client is allowed to self-assign at registration. "admin" is
// deliberately excluded — it can only be granted through a privileged flow.
const SELF_ASSIGNABLE_ROLES = ["buyer", "vendor"];

const FRONTEND = () => process.env.FRONTEND_URL || "http://localhost:3000";
const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

const authPayload = (user: any) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  vendorStatus: user.vendorStatus,
  emailVerified: user.emailVerified,
  token: generateToken(String(user._id)),
});

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const safeRole = SELF_ASSIGNABLE_ROLES.includes(role) ? role : "buyer";

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const rawVerify = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: safeRole,
      emailVerifyToken: sha256(rawVerify),
    });

    // Best-effort verification email — fire-and-forget so a slow SMTP host can
    // never delay (or hang) the registration response. sendEmail catches its
    // own errors internally.
    const verifyUrl = `${FRONTEND()}/verify-email?token=${rawVerify}&email=${encodeURIComponent(
      user.email
    )}`;
    void sendEmail({
      to: user.email,
      subject: "Confirm your email",
      html: emailTemplates.verifyEmail(user.firstName, verifyUrl),
    });

    res.status(201).json(authPayload(user));
  } catch (error: any) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json(authPayload(user));
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token, email } = req.body;
  const user = await User.findOne({ email, emailVerifyToken: sha256(token) });
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired verification link" });
  }
  user.emailVerified = true;
  user.emailVerifyToken = undefined;
  await user.save();
  res.json({ message: "Email verified" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Only act if the user exists, but always return the same response so the
  // endpoint can't be used to enumerate registered emails.
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = sha256(rawToken);
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    const url = `${FRONTEND()}/reset-password?token=${rawToken}&email=${encodeURIComponent(
      user.email
    )}`;
    void sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: emailTemplates.passwordReset(user.firstName, url),
    });
  }

  res.json({
    message: "If an account exists for that email, a reset link has been sent.",
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, email, password } = req.body;
  const user = await User.findOne({
    email,
    resetPasswordToken: sha256(token),
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset link" });
  }

  user.password = password; // pre-save hook re-hashes
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful. You can now log in." });
};
