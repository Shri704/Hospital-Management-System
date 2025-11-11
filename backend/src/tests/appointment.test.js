import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js"; // your express app entry
import Appointment from "../src/models/Appointment.js";
import User from "../src/models/User.js";
import Doctor from "../src/models/Doctor.js";
import Patient from "../src/models/Patient.js";

let adminToken = "";
let doctorId = "";
let patientId = "";

/**
 * Helper function: create user & login to get auth token
 */
const registerAndLogin = async (role = "admin") => {
  const email = `${role}${Date.now()}@test.com`;
  const password = "Test@123";

  await request(app)
    .post("/api/auth/register")
    .send({
      firstName: role,
      lastName: "User",
      email,
      password,
      role,
    });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token;
};

beforeAll(async () => {
  // connect to test DB
  await mongoose.connect(process.env.MONGO_URI_TEST);

  // create admin & token
  adminToken = await registerAndLogin("admin");

  // create doctor
  const doctor = await Doctor.create({
    firstName: "Test",
    lastName: "Doctor",
    email: `doc${Date.now()}@test.com`,
    specialization: "Heart",
    consultationFee: 500,
  });
  doctorId = doctor._id.toString();

  // create patient
  const patient = await Patient.create({
    firstName: "Test",
    lastName: "Patient",
    phone: "9876543210",
    gender: "male",
    bloodGroup: "O+",
  });
  patientId = patient._id.toString();
});

afterAll(async () => {
  await Appointment.deleteMany();
  await Patient.deleteMany();
  await Doctor.deleteMany();
  await User.deleteMany();
  await mongoose.connection.close();
});

/**
 * Test Suite: Appointment API
 */
describe("Appointment API Tests", () => {
  let appointmentId = "";

  test("✅ Create Appointment", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        patient: patientId,
        doctor: doctorId,
        date: "2025-05-10",
        timeSlot: "10:00 AM - 10:30 AM",
        reason: "Regular checkup"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.patient).toBe(patientId);
    expect(res.body.status).toBe("pending");

    appointmentId = res.body._id;
  });

  test("📌 Get Appointment List", async () => {
    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("📌 Get Single Appointment", async () => {
    const res = await request(app)
      .get(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(appointmentId);
  });

  test("🟡 Update Appointment Status", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "confirmed" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("confirmed");
  });

  test("🗑️ Delete Appointment", async () => {
    const res = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Appointment removed");
  });
});
