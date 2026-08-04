import mongoose from "mongoose";
import { app } from "./app";

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Fail fast on missing critical config rather than falling back to hardcoded
// credentials or signing tokens with an undefined secret.
if (!MONGO_URI) {
  console.error("FATAL: MONGO_URI is not set");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
