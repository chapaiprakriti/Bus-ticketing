"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authorizedMiddleware = void 0;
const constant_1 = require("../configs/constant");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("../repositories/user.repository");
const http_exception_1 = require("../exceptions/http-exception");
const apihelper_util_1 = require("../utils/apihelper.util");
const userRepository = new user_repository_1.UserMongoRepository();
const authorizedMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new http_exception_1.HttpException(401, "Unauthorized JWT invalid");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new http_exception_1.HttpException(401, "Unauthorized JWT missing");
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, constant_1.SECRET_KEY);
        if (!decodedToken || !decodedToken.id) {
            throw new http_exception_1.HttpException(401, "Unauthorized JWT unverified");
        }
        const user = await userRepository.getUserById(decodedToken.id);
        if (!user) {
            throw new http_exception_1.HttpException(401, "Unauthorized user not found");
        }
        req.user = user;
        return next();
    }
    catch (err) {
        return apihelper_util_1.ApiResponseHelper.error(res, err.message || "Internal Server Error", err.statusCode || 500);
    }
};
exports.authorizedMiddleware = authorizedMiddleware;
const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new http_exception_1.HttpException(401, "Unauthorized no user info");
        }
        if (req.user.role !== "admin") {
            throw new http_exception_1.HttpException(403, "Forbidden not admin");
        }
        return next();
    }
    catch (err) {
        return apihelper_util_1.ApiResponseHelper.error(res, err.message || "Internal Server Error", err.statusCode || 500);
    }
};
exports.adminMiddleware = adminMiddleware;
//# sourceMappingURL=authorized.middleware.js.map