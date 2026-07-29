import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import path from "path";

import userRouter from "./routes/user.route";
import adminRouter from "./routes/admin/admin.routes";
import bookingRouter from "./routes/booking.route";
import paymentRouter from "./routes/payment.route";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import { PORT, DUMMY } from "./configs/constant";

const app: Application = express();

if (!process.env.KHALTI_SECRET_KEY) {
  console.error("ERROR: KHALTI_SECRET_KEY is not set. Payments will not work without it.");
  console.error("Please configure KHALTI_SECRET_KEY in your deployment environment.");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/admin", (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "public", "admin.html"));
});

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/payments", paymentRouter);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Seat Sathi API is running",
    port: PORT,
    dummy: DUMMY,
  });
});

// 404 handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new HttpException(404, "Route not found"));
});

// Global error handler
app.use(
  (
    error: Error | HttpException,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (error instanceof HttpException) {
      return ApiResponseHelper.error(res, error.message, error.statusCode);
    }

    console.error(error);

    return ApiResponseHelper.error(res, "Internal server error", 500);
  }
);

export { PORT, DUMMY } from "./configs/constant";
export default app;