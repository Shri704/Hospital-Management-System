import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Patient from "../src/models/Patient.js";

let adminToken = "";
let patientId = "";

// ✅ Helper: register + login to get admin token
const registerAndLoginAdmin = async () => {
  const adminData = {
    firstName: "Admin",
    lastName: "Test",
    email: `admin${Date.now()}@mail.com`,
    password: "Test@123",
    role: "admin"
  };

  await request(app).post("/api/auth/register").send(adminData);

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: adminData.email, password: adminData.password });

  return res.body.token;
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
  adminToken = await registerAndLoginAdmin();
});

afterAll(async () => {
  await Patient.deleteMany();
  await User.deleteMany();
  await mongoose.connection.close();
});

describe("Patient API Tests", () => {
  test("✅ Create patient", async () => {
    const res = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        firstName: "Bruce",
        lastName: "Wayne",
        phone: "9998887776",
        gender: "male",
        bloodGroup: "O+",
        address: { city: "Gotham" }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.firstName).toBe("Bruce");
    patientId = res.body._id;
  });

  test("📌 Get all patients", async () => {
    const res = await request(app)
      .get("/api/patients")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.patients || res.body)).toBe(true);
  });

  test("📌 Get patient by ID", async () => {
    const res = await request(app)
      .get(`/api/patients/${patientId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(patientId);
  });

  test("✏️ Update patient", async () => {
    const res = await request(app)
      .patch(`/api/patients/${patientId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ phone: "9999999999" });

    expect(res.statusCode).toBe(200);
    expect(res.body.phone).toBe("9999999999");
  });

  test("🛑 Unauthorized access without token", async () => {
    const res = await request(app).get("/api/patients");
    expect(res.statusCode).toBe(401);
  });

  test("🗑️ Delete patient", async () => {
    const res = await request(app)
      .delete(`/api/patients/${patientId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/removed|deleted/i);
  });
});
