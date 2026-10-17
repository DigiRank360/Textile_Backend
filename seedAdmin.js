import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import Admin from "./models/Admin.js";

dotenv.config();

// Usage: npm run seed            -> create admin with generated credentials
//        npm run seed -- --reset -> regenerate the admin password
const RESET = process.argv.includes("--reset");

const ensureJwtSecret = () => {
  if (process.env.JWT_SECRET) return;
  const secret = crypto.randomBytes(48).toString("hex");
  fs.appendFileSync(".env", `\nJWT_SECRET=${secret}\n`);
  console.log("🔑 JWT_SECRET generated and saved to .env");
};

const createAdmin = async () => {
  try {
    ensureJwtSecret();
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const username =
      process.env.ADMIN_USERNAME || "admin_" + crypto.randomBytes(3).toString("hex");
    const password = crypto.randomBytes(9).toString("base64url");
    const hashed = await bcrypt.hash(password, 10);

    const existing = await Admin.findOne();
    if (existing && !RESET) {
      console.log("⚠️ Admin already exists. Run `npm run seed -- --reset` to generate new credentials.");
      process.exit();
    }

    if (existing) {
      existing.username = username;
      existing.password = hashed;
      await existing.save();
    } else {
      await Admin.create({ username, password: hashed });
    }

    console.log("\n✅ Admin credentials (save them now, shown only once):");
    console.log("   Username:", username);
    console.log("   Password:", password, "\n");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();
