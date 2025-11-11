import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js"; // your express app
import User from "../src/models/User.js";

const testUser = {
  firstName: "Test",
  lastName: "User",
  email: `test${Date.now()}@mail.com`,
  password: "Test@123",
  role: "admin",
};

let token = "";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("Auth API Tests", () => {
  it("✅ Register new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("✅ Login user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it("❌ Login wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword123!",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("🔐 Access protected route /auth/me", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it("🚫 Access /auth/me without token", async () => {
    const res = await request(app)
      .get("/api/auth/me");

    expect(res.statusCode).toBe(401);
  });

  it("✅ Logout user", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });
});
