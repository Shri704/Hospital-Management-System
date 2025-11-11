import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

const [, , emailArg, passwordArg, firstNameArg, lastNameArg] = process.argv;

const email = emailArg || "admin@hms.com";
const password = passwordArg || "Admin@1234";
const firstName = firstNameArg || "System";
const lastName = lastNameArg || "Administrator";

const ensureEnv = () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not set. Please add it to your .env file.");
    process.exit(1);
  }
};

const connectDb = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");
};

const upsertAdmin = async () => {
  let user = await User.findOne({ email });

  if (user) {
    user.firstName = firstName;
    user.lastName = lastName;
    user.role = "admin";
    user.isActive = true;

    if (passwordArg) {
      user.password = password;
    }

    await user.save();
    console.log(`🔁 Updated existing admin account (${email})`);
    return;
  }

  await User.create({
    firstName,
    lastName,
    email,
    password,
    role: "admin",
    isActive: true,
  });

  console.log(`✨ Created admin account (${email})`);
};

const run = async () => {
  try {
    ensureEnv();
    await connectDb();
    await upsertAdmin();
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

run();

