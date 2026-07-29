import request from "supertest";
import app from "../src/app";
import { UserModel } from "../src/models/user.model";
import bcrypt from "bcryptjs";

export const randEmail = () => `test${Date.now()}${Math.floor(Math.random() * 10000)}@example.com`;
export const randPhone = () => `98765${(Date.now() % 100000).toString().padStart(5, "0")}`;

export const register = async (overrides: any = {}) => {
  const body = {
    fullName: "Test User",
    email: randEmail(),
    contactNumber: randPhone(),
    gender: "male",
    password: "Password123",
    ...overrides,
  };
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send(body);
  return { res, body };
};

export const login = async (email: string, password = "Password123") => {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });
  return res;
};

export const registerAndGetToken = async (overrides: any = {}) => {
  const email = overrides.email || randEmail();
  const regRes = await register({ ...overrides, email });
  expect(regRes.res.status).toBe(200);
  const loginRes = await login(email, overrides.password || "Password123");
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.data).toBeDefined();
  expect(loginRes.body.data.token).toBeDefined();
  return loginRes.body.data.token;
};

export const createAdminDirect = async () => {
  const email = `admin${Date.now()}@test.com`;
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const user = await UserModel.create({
    fullName: "Admin",
    email,
    contactNumber: randPhone(),
    password: hashedPassword,
    gender: "male",
    role: "admin",
  });
  const loginRes = await login(email, "admin123");
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.data).toBeDefined();
  expect(loginRes.body.data.token).toBeDefined();
  return loginRes.body.data.token;
};

export const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
