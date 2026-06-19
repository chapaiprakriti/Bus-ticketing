import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";

import userRouter from "./routes/user.route";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/v1/auth", userRouter);

app.get("/", (req: Request, res: Response) => {
  return res.send("Hello, TypeScript-Express!");
});

const PORT: number = 8089;

app.use((req: Request, res: Response) => {
  return res.status(404).json({ message: "API not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  if (err instanceof HttpException) {
    return ApiResponseHelper.error(res, err.message, err.status);
  }

  return ApiResponseHelper.error(res, "Internal Server Error", 500);
});

const DUMMY: string = "Dummy Export";

export { PORT, DUMMY };

export default app;