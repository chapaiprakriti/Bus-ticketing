"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const otp_service_1 = require("../services/otp.service");
const user_repository_1 = require("../repositories/user.repository");
const zod_1 = require("zod");
const user_dto_1 = require("../dtos/user.dto");
const apihelper_util_1 = require("../utils/apihelper.util");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userService = new user_service_1.UserService();
const otpService = new otp_service_1.OtpService();
const userRepo = new user_repository_1.UserMongoRepository();
class UserController {
    // ── Register ───────────────────────────────────────────────────────────────
    async createUser(req, res) {
        try {
            const userData = user_dto_1.CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(userData.error), 400);
            }
            const user = await userService.createUser(userData.data);
            return apihelper_util_1.ApiResponseHelper.success(res, user, "User created successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.statusCode || 500);
        }
    }
    // ── Login ──────────────────────────────────────────────────────────────────
    async loginUser(req, res) {
        try {
            const parsedData = user_dto_1.LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsedData.error), 400);
            }
            const { user, token } = await userService.loginUser(parsedData.data);
            console.log("========== BACKEND LOGIN SUCCESS ==========");
            console.log("User:", user.email, "| Role:", user.role);
            console.log("===========================================");
            return apihelper_util_1.ApiResponseHelper.success(res, { user, token }, "Login successful");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.statusCode || 500);
        }
    }
    // ── Who Am I ───────────────────────────────────────────────────────────────
    async whoAmI(req, res) {
        try {
            const loggedInUser = req.user;
            if (!loggedInUser?._id && !loggedInUser?.id) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const userId = loggedInUser._id || loggedInUser.id;
            const user = await userService.getUserById(userId.toString());
            return apihelper_util_1.ApiResponseHelper.success(res, user, "Logged in user fetched successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.statusCode || 500);
        }
    }
    async whoami(req, res) {
        return this.whoAmI(req, res);
    }
    // ── Update Profile ─────────────────────────────────────────────────────────
    async updateProfile(req, res) {
        try {
            console.log("========== UPDATE PROFILE REQUEST ==========");
            console.log("Body:", req.body);
            console.log("File:", req.file);
            const loggedInUser = req.user;
            if (!loggedInUser?._id && !loggedInUser?.id) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const userId = loggedInUser._id || loggedInUser.id;
            const updateData = {};
            if (req.body.fullName)
                updateData.fullName = req.body.fullName;
            if (req.body.contactNumber)
                updateData.contactNumber = req.body.contactNumber;
            if (req.body.gender)
                updateData.gender = req.body.gender;
            if (req.file)
                updateData.profileImage = `/uploads/${req.file.filename}`;
            if (req.body.currentPassword && req.body.newPassword) {
                updateData.currentPassword = req.body.currentPassword;
                updateData.newPassword = req.body.newPassword;
            }
            const updatedUser = await userService.updateProfile(userId.toString(), updateData);
            return apihelper_util_1.ApiResponseHelper.success(res, updatedUser, "Profile updated successfully");
        }
        catch (error) {
            console.log("UPDATE PROFILE ERROR:", error);
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.statusCode || 500);
        }
    }
    // ── Forgot Password: send OTP ──────────────────────────────────────────────
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email || !String(email).includes("@")) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Please provide a valid email address", 400);
            }
            const user = await userRepo.getUserByEmail(String(email).toLowerCase());
            if (!user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "No account found with this email address", 404);
            }
            await otpService.sendOtp(String(email).toLowerCase());
            return apihelper_util_1.ApiResponseHelper.success(res, null, "OTP sent to your email. Valid for 5 minutes.");
        }
        catch (error) {
            console.error("forgotPassword error:", error);
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Failed to send OTP", 500);
        }
    }
    // ── Reset Password: verify OTP + update password ───────────────────────────
    async resetPassword(req, res) {
        try {
            const { email, otp, newPassword } = req.body;
            if (!email || !otp || !newPassword) {
                return apihelper_util_1.ApiResponseHelper.error(res, "email, otp and newPassword are required", 400);
            }
            if (String(newPassword).length < 6) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Password must be at least 6 characters", 400);
            }
            const valid = otpService.verifyOtp(String(email).toLowerCase(), String(otp));
            if (!valid) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Invalid or expired OTP", 400);
            }
            const user = await userRepo.getUserByEmail(String(email).toLowerCase());
            if (!user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "User not found", 404);
            }
            const hashedPassword = await bcryptjs_1.default.hash(String(newPassword), 10);
            await userRepo.update(user._id.toString(), { password: hashedPassword });
            return apihelper_util_1.ApiResponseHelper.success(res, null, "Password reset successfully. You can now log in.");
        }
        catch (error) {
            console.error("resetPassword error:", error);
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Failed to reset password", 500);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map