import mongoose from "mongoose";
import fs from "fs";
import User from "../src/models/User.js";
import Patient from "../src/models/Patient.js";
import Department from "../src/models/Department.js";
import Doctor from "../src/models/Doctor.js";
import Medicine from "../src/models/Medicine.js";
import Room from "../src/models/Room.js";
import dotenv from "dotenv";
dotenv.config();

const seedData = JSON.parse(fs.readFileSync("./seed/data.json", "utf-8"));

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Database connected ✅");

  await User.deleteMany();
  await Patient.deleteMany();
  await Department.deleteMany();
  await Doctor.deleteMany();
  await Medicine.deleteMany();
  await Room.deleteMany();

  await User.insertMany(seedData.users);
  await Patient.insertMany(seedData.patients);
  await Department.insertMany(seedData.departments);
  await Doctor.insertMany(seedData.doctors);
  await Medicine.insertMany(seedData.medicines);
  await Room.insertMany(seedData.rooms);

  console.log("🌱 Database Seeded Successfully!");
  process.exit();
};

start();
