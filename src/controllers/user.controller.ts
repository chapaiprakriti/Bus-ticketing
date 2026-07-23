import { UserService } from "../services/user.service";
import { OtpService } from "../services/otp.service";
import { UserMongoRepository } from "../repositories/user.repository";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";
import bcryptjs from "bcryptjs";

const userService = new UserService();
const otpService  = new OtpService();
const userRepo    = new UserMongoRepository();

export class UserController {

  // ── Register ───────────────────────────────────────────────────────────────
  async createUser(req: Request, res: Response) {
    try {
      const userData = CreateUserDTO.safeParse(req.body);
      if (!userData.success) {
        return ApiResponseHelper.error(res, z.prettifyError(userData.error), 400);
      }
      const user = await userService.createUser(userData.data);
      return ApiResponseHelper.success(res, user, "User created successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.statusCode || 500);
    }
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async loginUser(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsedData.error), 400);
      }
      const { user, token } = await userService.loginUser(parsedData.data);
      console.log("========== BACKEND LOGIN SUCCESS ==========");
      console.log("User:", user.email, "| Role:", user.role);
      console.log("===========================================");
      return ApiResponseHelper.success(res, { user, token }, "Login successful");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.statusCode || 500);
    }
  }

  // ── Who Am I ───────────────────────────────────────────────────────────────
  async whoAmI(req: Request, res: Response) {
    try {
      const loggedInUser = (req as any).user;
      if (!loggedInUser?._id && !loggedInUser?.id) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }
      const userId = loggedInUser._id || loggedInUser.id;
      const user = await userService.getUserById(userId.toString());
      return ApiResponseHelper.success(res, user, "Logged in user fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.statusCode || 500);
    }
  }

  async whoami(req: Request, res: Response) {
    return this.whoAmI(req, res);
  }

  // ── Update Profile ─────────────────────────────────────────────────────────
  async updateProfile(req: Request, res: Response) {
    try {
      console.log("========== UPDATE PROFILE REQUEST ==========");
      console.log("Body:", req.body);
      console.log("File:", req.file);

      const loggedInUser = (req as any).user;
      if (!loggedInUser?._id && !loggedInUser?.id) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }
      const userId = loggedInUser._id || loggedInUser.id;

      const updateData: any = {};
      if (req.body.fullName)      updateData.fullName      = req.body.fullName;
      if (req.body.contactNumber) updateData.contactNumber = req.body.contactNumber;
      if (req.body.gender)        updateData.gender        = req.body.gender;
      if (req.file)               updateData.profileImage  = `/uploads/${req.file.filename}`;
      if (req.body.currentPassword && req.body.newPassword) {
        updateData.currentPassword = req.body.currentPassword;
        updateData.newPassword     = req.body.newPassword;
      }

      const updatedUser = await userService.updateProfile(userId.toString(), updateData);
      return ApiResponseHelper.success(res, updatedUser, "Profile updated successfully");
    } catch (error: any) {
      console.log("UPDATE PROFILE ERROR:", error);
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.statusCode || 500);
    }
  }

  // ── Forgot Password: send OTP ──────────────────────────────────────────────
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email || !String(email).includes("@")) {
        return ApiResponseHelper.error(res, "Please provide a valid email address", 400);
      }

      const user = await userRepo.getUserByEmail(String(email).toLowerCase());
      if (!user) {
        return ApiResponseHelper.error(res, "No account found with this email address", 404);
      }

      await otpService.sendOtp(String(email).toLowerCase());

      return ApiResponseHelper.success(res, null, "OTP sent to your email. Valid for 5 minutes.");
    } catch (error: any) {
      console.error("forgotPassword error:", error);
      return ApiResponseHelper.error(res, error.message || "Failed to send OTP", 500);
    }
  }

  // ── Reset Password: verify OTP + update password ───────────────────────────
  async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return ApiResponseHelper.error(res, "email, otp and newPassword are required", 400);
      }
      if (String(newPassword).length < 6) {
        return ApiResponseHelper.error(res, "Password must be at least 6 characters", 400);
      }

      const valid = otpService.verifyOtp(String(email).toLowerCase(), String(otp));
      if (!valid) {
        return ApiResponseHelper.error(res, "Invalid or expired OTP", 400);
      }

      const user = await userRepo.getUserByEmail(String(email).toLowerCase());
      if (!user) {
        return ApiResponseHelper.error(res, "User not found", 404);
      }

      const hashedPassword = await bcryptjs.hash(String(newPassword), 10);
      await userRepo.update(user._id.toString(), { password: hashedPassword } as any);

      return ApiResponseHelper.success(res, null, "Password reset successfully. You can now log in.");
    } catch (error: any) {
      console.error("resetPassword error:", error);
      return ApiResponseHelper.error(res, error.message || "Failed to reset password", 500);
    }
  }
}
