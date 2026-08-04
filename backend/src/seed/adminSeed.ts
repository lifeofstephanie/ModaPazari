import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model";

dotenv.config();

/**
 * Seeds (or ensures) an admin account.
 *
 * Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD, falling back to sane
 * defaults for local dev. Run with:  npm run seed:admin
 *
 * Uses User.create so the model's pre-save hook hashes the password.
 */
const run = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("FATAL: MONGO_URI is not set");
    process.exit(1);
  }

  const email = (process.env.ADMIN_EMAIL || "admin@modapazari.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";

  await mongoose.connect(MONGO_URI);
  console.log(`Connected to database: "${mongoose.connection.name}"`);

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`Promoted existing user ${email} to admin.`);
    } else {
      console.log(`Admin already exists: ${email} (no changes made).`);
    }
  } else {
    await User.create({
      firstName: "Site",
      lastName: "Admin",
      email,
      password,
      role: "admin",
    });
    console.log("Admin created.");
    console.log(`  email:    ${email}`);
    console.log(`  password: ${password}`);
    console.log("  ⚠  Change this password after first login in production.");
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
