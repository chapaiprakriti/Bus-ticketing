import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

console.log("ENV PORT:", process.env.PORT);
console.log("ENV MONGODB_URL:", process.env.MONGODB_URL);

export const PORT: number = Number(process.env.PORT) || 8089;
export const DUMMY: string = process.env.DUMMY || "Dummy Export";
export const MONGODB_URL: string =
  process.env.MONGODB_URL || "mongodb://localhost:27017/seatsathi";
export const SECRET_KEY: string = process.env.SECRET_KEY || "merosecretkey";

// Khalti Payment
export const KHALTI_SECRET_KEY: string = process.env.KHALTI_SECRET_KEY || "test_secret_key_f59e8b7d18b4499ca40f68195a846e9b";
export const KHALTI_INITIATE_URL: string = "https://dev.khalti.com/api/v2/epayment/initiate/";
export const KHALTI_VERIFY_URL: string = "https://dev.khalti.com/api/v2/epayment/lookup/";

// SMTP — for OTP emails
export const SMTP_HOST: string  = process.env.SMTP_HOST  || "smtp.gmail.com";
export const SMTP_PORT: number  = Number(process.env.SMTP_PORT) || 587;
export const SMTP_USER: string  = process.env.SMTP_USER  || "";
export const SMTP_PASS: string  = process.env.SMTP_PASS  || "";
export const SMTP_FROM: string  = process.env.SMTP_FROM  || "SeatSathi <noreply@seatsathi.com>";