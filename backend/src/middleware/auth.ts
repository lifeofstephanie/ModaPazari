import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/user.model";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: IUser;
}

interface DecodedToken extends JwtPayload {
  id: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Not authorized, token missing" });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      if (typeof decoded === "string" || !("id" in decoded)) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = await User.findById((decoded as DecodedToken).id).select(
        "-password"
      );
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
