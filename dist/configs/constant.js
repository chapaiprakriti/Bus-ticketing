"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMTP_FROM = exports.SMTP_PASS = exports.SMTP_USER = exports.SMTP_PORT = exports.SMTP_HOST = exports.SECRET_KEY = exports.MONGODB_URL = exports.DUMMY = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), ".env"),
});
console.log("ENV PORT:", process.env.PORT);
console.log("ENV MONGODB_URL:", process.env.MONGODB_URL);
exports.PORT = Number(process.env.PORT) || 8089;
exports.DUMMY = process.env.DUMMY || "Dummy Export";
exports.MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/seatsathi";
exports.SECRET_KEY = process.env.SECRET_KEY || "merosecretkey";
// SMTP — for OTP emails
exports.SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
exports.SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
exports.SMTP_USER = process.env.SMTP_USER || "";
exports.SMTP_PASS = process.env.SMTP_PASS || "";
exports.SMTP_FROM = process.env.SMTP_FROM || "SeatSathi <noreply@seatsathi.com>";
//# sourceMappingURL=constant.js.map