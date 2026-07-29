import request from "supertest";
import app from "./testApp";
import { registerAndGetToken, authHeader } from "./helpers";

const BASE = "/api/v1/payments/khalti";

describe("POST /api/v1/payments/khalti/initiate", () => {
  it("should reject unauthorized", async () => {
    const res = await request(app)
      .post(`${BASE}/initiate`)
      .send({
        amount: 1000,
        purchase_order_id: "order-1",
        purchase_order_name: "Test",
        return_url: "http://localhost/return",
        website_url: "http://localhost",
      });
    expect(res.status).toBe(401);
  });

  it("should reject missing required fields", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`${BASE}/initiate`)
      .set(authHeader(token))
      .send({ amount: 1000 });
    expect(res.status).toBe(400);
  });

  it("should reject amount below minimum", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`${BASE}/initiate`)
      .set(authHeader(token))
      .send({
        amount: 500,
        purchase_order_id: "order-2",
        purchase_order_name: "Test",
        return_url: "http://localhost/return",
        website_url: "http://localhost",
      });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/payments/khalti/verify", () => {
  it("should reject unauthorized", async () => {
    const res = await request(app)
      .post(`${BASE}/verify`)
      .send({ pidx: "abc123" });
    expect(res.status).toBe(401);
  });

  it("should reject invalid token", async () => {
    const res = await request(app)
      .post(`${BASE}/verify`)
      .set(authHeader("bad-token"))
      .send({ pidx: "abc123" });
    expect([401, 500]).toContain(res.status);
  });

  it("should reject missing pidx", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`${BASE}/verify`)
      .set(authHeader(token))
      .send({});
    expect(res.status).toBe(400);
  });

  it("should reject when booking data is invalid", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`${BASE}/verify`)
      .set(authHeader(token))
      .send({ pidx: "pidx123", bookingData: { origin: "KT" } });
    expect(res.status).toBe(400);
  });

  it("should accept and book when Khalti returns Completed", async () => {
    const token = await registerAndGetToken();
    const bookingData = {
      origin: "Kathmandu",
      destination: "Pokhara",
      operatorName: "Super Deluxe",
      busName: "Bus 101",
      travelDate: "2025-08-01",
      departureTime: "07:00",
      arrivalTime: "13:00",
      selectedSeats: ["A1", "A2"],
      totalFare: 1500,
      paymentMethod: "cash",
      paymentStatus: "pending",
    };

    const mockLookup = (status: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status,
            transaction_id: "txn123",
            total_amount: 1500,
          }),
    });

    const spy = jest.spyOn(global, "fetch" as any).mockImplementation((url: string) => {
      return mockLookup("Completed") as any;
    });

    const res = await request(app)
      .post(`${BASE}/verify`)
      .set(authHeader(token))
      .send({ pidx: "pidx-ok", bookingData });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.booking).toBeDefined();
    expect(res.body.data.transactionId).toBe("txn123");

    spy.mockRestore();
  });

  it("should reject when Khalti lookup returns non-completed status", async () => {
    const token = await registerAndGetToken();
    const bookingData = {
      origin: "Kathmandu",
      destination: "Pokhara",
      operatorName: "Super Deluxe",
      busName: "Bus 101",
      travelDate: "2025-08-01",
      departureTime: "07:00",
      arrivalTime: "13:00",
      selectedSeats: ["A1", "A2"],
      totalFare: 1500,
      paymentMethod: "cash",
      paymentStatus: "pending",
    };

    const spy = jest.spyOn(global, "fetch" as any).mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "Pending",
            transaction_id: null,
            total_amount: 1500,
          }),
      }) as any;
    });

    const res = await request(app)
      .post(`${BASE}/verify`)
      .set(authHeader(token))
      .send({ pidx: "pidx-pending", bookingData });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Payment not completed|Pending/);

    spy.mockRestore();
  }, 15000);

  it("should reject now but retry lookup when Khalti is initially Pending", async () => {
    const token = await registerAndGetToken();
    const bookingData = {
      origin: "Kathmandu",
      destination: "Pokhara",
      operatorName: "Super Deluxe",
      busName: "Bus 101",
      travelDate: "2025-08-01",
      departureTime: "07:00",
      arrivalTime: "13:00",
      selectedSeats: ["A1", "A2"],
      totalFare: 1500,
      paymentMethod: "cash",
      paymentStatus: "pending",
    };

    let callCount = 0;
    const spy = jest.spyOn(global, "fetch" as any).mockImplementation(() => {
      callCount += 1;
      const status = callCount === 1 ? "Pending" : "Completed";
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status,
            transaction_id: "txn-retry",
            total_amount: 1500,
          }),
      }) as any;
    });

    const res = await request(app)
      .post(`${BASE}/verify`)
      .set(authHeader(token))
      .send({ pidx: "pidx-retry", bookingData });

    expect(res.status).toBe(201);
    expect(res.body.data.transactionId).toBe("txn-retry");

    spy.mockRestore();
  });
});

describe("POST /api/v1/payments/khalti/initiate additional scenarios", () => {
  it("should reject empty body", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`${BASE}/initiate`)
      .set(authHeader(token))
      .send({});
    expect(res.status).toBe(400);
  });

  it("should reject string amount", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`${BASE}/initiate`)
      .set(authHeader(token))
      .send({
        amount: "abc",
        purchase_order_id: "order-1",
        purchase_order_name: "Test",
        return_url: "http://localhost/return",
        website_url: "http://localhost",
      });
    expect(res.status).toBe(400);
  });

  it("should reject amount of zero", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`${BASE}/initiate`)
      .set(authHeader(token))
      .send({
        amount: 0,
        purchase_order_id: "order-1",
        purchase_order_name: "Test",
        return_url: "http://localhost/return",
        website_url: "http://localhost",
      });
    expect(res.status).toBe(400);
  });

  it("should reject missing purchase_order_id", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`${BASE}/initiate`)
      .set(authHeader(token))
      .send({
        amount: 1000,
        purchase_order_name: "Test",
        return_url: "http://localhost/return",
        website_url: "http://localhost",
      });
    expect(res.status).toBe(400);
  });

  it("should reject missing return_url", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`${BASE}/initiate`)
      .set(authHeader(token))
      .send({
        amount: 1000,
        purchase_order_id: "order-1",
        purchase_order_name: "Test",
        website_url: "http://localhost",
      });
    expect(res.status).toBe(400);
  });

  it("should reject missing website_url", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`${BASE}/initiate`)
      .set(authHeader(token))
      .send({
        amount: 1000,
        purchase_order_id: "order-1",
        purchase_order_name: "Test",
        return_url: "http://localhost/return",
      });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/payments/khalti/verify additional scenarios", () => {
  it("should reject when bookingData is completely missing", async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`${BASE}/verify`)
      .set(authHeader(token))
      .send({ pidx: "pidx123" });
    expect(res.status).toBe(400);
  });

  it("should reject when bookingData has invalid payment status", async () => {
    const token = await registerAndGetToken();
    const bookingData = {
      origin: "Kathmandu",
      destination: "Pokhara",
      operatorName: "Super Deluxe",
      busName: "Bus 101",
      travelDate: "2025-08-01",
      departureTime: "07:00",
      arrivalTime: "13:00",
      selectedSeats: ["A1", "A2"],
      totalFare: 1500,
      paymentMethod: "cash",
      paymentStatus: "invalid-status",
    };

    const res = await request(app)
      .post(`${BASE}/verify`)
      .set(authHeader(token))
      .send({ pidx: "pidx123", bookingData });

    expect(res.status).toBe(400);
  });
});
