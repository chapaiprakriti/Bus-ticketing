"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordDirect = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../models/user.model");
// POST /api/v1/auth/reset-password-direct
// Body: { email, newPassword }
// No OTP needed — OTP is verified on the frontend via Resend
const resetPasswordDirect = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required",
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }
        const user = await user_model_1.UserModel.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
exports.resetPasswordDirect = resetPasswordDirect;
//# sourceMappingURL=reset.controller.js.map