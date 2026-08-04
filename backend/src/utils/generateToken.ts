import jwt, { SignOptions } from "jsonwebtoken";

const generateToken = (id: string) => {
  const expiresIn = (process.env.JWT_EXPIRES ||
    "7d") as SignOptions["expiresIn"];
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn });
};

export default generateToken;
