"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DUMMY = exports.PORT = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const admin_routes_1 = __importDefault(require("./routes/admin/admin.routes"));
const booking_route_1 = __importDefault(require("./routes/booking.route"));
const payment_route_1 = __importDefault(require("./routes/payment.route"));
const http_exception_1 = require("./exceptions/http-exception");
const apihelper_util_1 = require("./utils/apihelper.util");
const constant_1 = require("./configs/constant");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
app.use(express_1.default.static(path_1.default.join(process.cwd(), "public")));
app.get("/admin", (_req, res) => {
    res.sendFile(path_1.default.join(process.cwd(), "public", "admin.html"));
});
app.use("/api/v1/auth", user_route_1.default);
app.use("/api/v1/admin", admin_routes_1.default);
app.use("/api/v1/bookings", booking_route_1.default);
app.use("/api/v1/payments", payment_route_1.default);
app.get("/", (_req, res) => {
    res.status(200).json({
        message: "Seat Sathi API is running",
        port: constant_1.PORT,
        dummy: constant_1.DUMMY,
    });
});
// 404 handler
app.use((_req, _res, next) => {
    next(new http_exception_1.HttpException(404, "Route not found"));
});
// Global error handler
app.use((error, _req, res, _next) => {
    if (error instanceof http_exception_1.HttpException) {
        return apihelper_util_1.ApiResponseHelper.error(res, error.message, error.statusCode);
    }
    console.error(error);
    return apihelper_util_1.ApiResponseHelper.error(res, "Internal server error", 500);
});
var constant_2 = require("./configs/constant");
Object.defineProperty(exports, "PORT", { enumerable: true, get: function () { return constant_2.PORT; } });
Object.defineProperty(exports, "DUMMY", { enumerable: true, get: function () { return constant_2.DUMMY; } });
exports.default = app;
//# sourceMappingURL=app.js.map