import request from "supertest";
import app from "./testApp";

describe("GET /", () => {
  it("should return API running status", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Seat Sathi API is running");
  });
});
