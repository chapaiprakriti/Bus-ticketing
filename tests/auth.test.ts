import request from "supertest";
import app from "./testApp";
import { register, login, registerAndGetToken, authHeader, randEmail, randPhone } from "./helpers";

describe("POST /api/v1/auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test User",
        email: randEmail(),
        contactNumber: randPhone(),
        gender: "male",
        password: "Password123",
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBeDefined();
  });

  it("should reject missing fullName", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: randEmail(),
        contactNumber: randPhone(),
        gender: "male",
        password: "Password123",
      });
    expect(res.status).toBe(400);
  });

  it("should reject missing email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test",
        contactNumber: randPhone(),
        gender: "male",
        password: "Password123",
      });
    expect(res.status).toBe(400);
  });

  it("should reject missing contactNumber", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test",
        email: randEmail(),
        gender: "male",
        password: "Password123",
      });
    expect(res.status).toBe(400);
  });

  it("should reject missing gender", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test",
        email: randEmail(),
        contactNumber: randPhone(),
        password: "Password123",
      });
    expect(res.status).toBe(400);
  });

  it("should reject invalid email format", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test",
        email: "invalid-email",
        contactNumber: randPhone(),
        gender: "male",
        password: "Password123",
      });
    expect(res.status).toBe(400);
  });

  it("should reject short contactNumber", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test",
        email: randEmail(),
        contactNumber: "123",
        gender: "male",
        password: "Password123",
      });
    expect(res.status).toBe(400);
  });

  it("should reject weak password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test",
        email: randEmail(),
        contactNumber: randPhone(),
        gender: "male",
        password: "123",
      });
    expect(res.status).toBe(400);
  });

  it("should reject duplicate email", async () => {
    const email = randEmail();
    await register({ email });
    const res = await register({ email });
    expect(res.res.status).toBe(400);
    expect(res.res.body.message).toMatch(/email already exists/i);
  });
});

describe("POST /api/v1/auth/login", () => {
  it("should login with valid credentials", async () => {
    const email = randEmail();
    await register({ email, password: "Password123" });
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "Password123" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("should reject invalid email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nonexistent@test.com", password: "Password123" });
    expect(res.status).toBe(400);
  });

  it("should reject wrong password", async () => {
    const email = randEmail();
    await register({ email, password: "Password123" });
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "WrongPass" });
    expect(res.status).toBe(400);
  });

  it("should reject missing password", async () => {
    const email = randEmail();
    await register({ email });
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/auth/whoami", () => {
  it("should return current user with valid token", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .get("/api/v1/auth/whoami")
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.email).toBeDefined();
  });

  it("should reject without token", async () => {
    const res = await request(app).get("/api/v1/auth/whoami");
    expect(res.status).toBe(401);
  });

  it("should reject invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/whoami")
      .set(authHeader("invalid-token"));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/v1/auth/forgot-password", () => {
  it("should send OTP for registered email", async () => {
    const email = randEmail();
    await register({ email });
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should reject unregistered email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "nouser@test.com" });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/auth/reset-password", () => {
  it("should reject missing fields", async () => {
    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({});
    expect(res.status).toBe(400);
  });

  it("should reject invalid OTP", async () => {
    const email = randEmail();
    await register({ email });
    await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email });
    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        email,
        otp: "000000",
        newPassword: "NewPass123",
      });
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/v1/auth/update", () => {
  it("should update profile successfully", async () => {
    const token = await registerAndGetToken();
    const newName = "Updated Name";
    const res = await request(app)
      .put("/api/v1/auth/update")
      .set(authHeader(token))
      .send({ fullName: newName });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe(newName);
  });

  it("should reject without token", async () => {
    const res = await request(app)
      .put("/api/v1/auth/update")
      .send({ fullName: "Updated" });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/auth/reset-password-direct", () => {
  it("should reset password successfully for registered user", async () => {
    const email = randEmail();
    await register({ email, password: "OldPass123" });
    const res = await request(app)
      .post("/api/v1/auth/reset-password-direct")
      .send({ email, newPassword: "NewPass123" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const loginRes = await login(email, "NewPass123");
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.token).toBeDefined();
  });

  it("should reject missing email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/reset-password-direct")
      .send({ newPassword: "NewPass123" });
    expect(res.status).toBe(400);
  });

  it("should reject missing newPassword", async () => {
    const email = randEmail();
    await register({ email });
    const res = await request(app)
      .post("/api/v1/auth/reset-password-direct")
      .send({ email });
    expect(res.status).toBe(400);
  });

  it("should reject short newPassword", async () => {
    const email = randEmail();
    await register({ email });
    const res = await request(app)
      .post("/api/v1/auth/reset-password-direct")
      .send({ email, newPassword: "123" });
    expect(res.status).toBe(400);
  });

  it("should reject unregistered email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/reset-password-direct")
      .send({ email: "nouser@test.com", newPassword: "NewPass123" });
    expect(res.status).toBe(404);
  });
});

describe("Additional register scenarios", () => {
  it("should register a female user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test Female",
        email: randEmail(),
        contactNumber: randPhone(),
        gender: "female",
        password: "Password123",
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBeDefined();
  });

  it("should reject missing password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test",
        email: randEmail(),
        contactNumber: randPhone(),
        gender: "male",
      });
    expect(res.status).toBe(400);
  });

  it("should reject duplicate contactNumber", async () => {
    const phone = randPhone();
    await register({ contactNumber: phone });
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test",
        email: randEmail(),
        contactNumber: phone,
        gender: "male",
        password: "Password123",
      });
    expect([400, 500]).toContain(res.status);
  });
});

describe("Additional login scenarios", () => {
  it("should login with uppercase email (emails are lowercased)", async () => {
    const email = randEmail();
    await register({ email, password: "Password123" });
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: email.toUpperCase(), password: "Password123" });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it("should login and return user email", async () => {
    const email = randEmail();
    await register({ email, password: "Password123" });
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "Password123" });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email.toLowerCase());
  });
});

describe("Additional whoami scenarios", () => {
  it("should return full user data including fullName", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .get("/api/v1/auth/whoami")
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBeDefined();
  });

  it("should return correct user after registration", async () => {
    const email = randEmail();
    await register({ email, fullName: "Unique Name" });
    const loginRes = await login(email);
    const token = loginRes.body.data.token;
    const res = await request(app)
      .get("/api/v1/auth/whoami")
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email.toLowerCase());
  });
});

describe("Additional forgot-password scenarios", () => {
  it("should reject invalid email format", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "notanemail" });
    expect(res.status).toBe(400);
  });

  it("should reject empty email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "" });
    expect(res.status).toBe(400);
  });
});

describe("Additional reset-password scenarios", () => {
  it("should reject short newPassword", async () => {
    const email = randEmail();
    await register({ email });
    await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email });
    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        email,
        otp: "000000",
        newPassword: "12345",
      });
    expect(res.status).toBe(400);
  });

  it("should reject missing email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ otp: "123456", newPassword: "NewPass123" });
    expect(res.status).toBe(400);
  });
});

describe("Additional update profile scenarios", () => {
  it("should update contactNumber", async () => {
    const token = await registerAndGetToken();
    const newPhone = randPhone();
    const res = await request(app)
      .put("/api/v1/auth/update")
      .set(authHeader(token))
      .send({ contactNumber: newPhone });
    expect(res.status).toBe(200);
    expect(res.body.data.contactNumber).toBe(newPhone);
  });

  it("should update gender", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .put("/api/v1/auth/update")
      .set(authHeader(token))
      .send({ gender: "female" });
    expect(res.status).toBe(200);
    expect(res.body.data.gender).toBe("female");
  });
});
