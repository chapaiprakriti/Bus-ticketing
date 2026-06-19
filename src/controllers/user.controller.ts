import { UserService } from "../services/user.service";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";

const userService = new UserService();

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const userData = CreateUserDTO.safeParse(req.body);

      if (!userData.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(userData.error),
          400
        );
      }

      const user = await userService.createUser(userData.data);

      return ApiResponseHelper.success(
        res,
        user,
        "User created successfully"
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(parsedData.error),
          400
        );
      }

      const { user, token } = await userService.loginUser(parsedData.data);
console.log("========== BACKEND LOGIN SUCCESS ==========");
console.log("User:", user.email);
console.log("TOKEN:", token);
console.log("BEARER TOKEN:", `Bearer ${token}`);
console.log("===========================================");

      return ApiResponseHelper.success(
        res,
        { user, token },
        "Login successful"
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      console.log("========== UPDATE PROFILE REQUEST ==========");
      console.log("Params:", req.params);
      console.log("File:", req.file);

      const userId = String(req.params.id);

      if (!userId) {
        return ApiResponseHelper.error(res, "User ID is required", 400);
      }

      if (!req.file) {
        return ApiResponseHelper.error(res, "Profile image is required", 400);
      }

      const profileImage = `/uploads/profile/${req.file.filename}`;

      const updatedUser = await userService.updateProfile(userId, {
        profileImage,
      });

      return ApiResponseHelper.success(
        res,
        updatedUser,
        "Profile image updated successfully"
      );
    } catch (error: any) {
      console.log("UPDATE PROFILE ERROR:", error);

      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }
}