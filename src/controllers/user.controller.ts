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
        error.statusCode || 500
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
      console.log("Role:", user.role);
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
        error.statusCode || 500
      );
    }
  }

  // Sprint 3 / Sprint 4: logged-in user detail
  async whoAmI(req: Request, res: Response) {
    try {
      const loggedInUser = (req as any).user;

      if (!loggedInUser?._id && !loggedInUser?.id) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const userId = loggedInUser._id || loggedInUser.id;

      const user = await userService.getUserById(userId.toString());

      return ApiResponseHelper.success(
        res,
        user,
        "Logged in user fetched successfully"
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.statusCode || 500
      );
    }
  }

  // Alias, in case any route uses lowercase whoami
  async whoami(req: Request, res: Response) {
    return this.whoAmI(req, res);
  }

  // Sprint 3: update profile image, profile detail, and password
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

      if (req.body.fullName) {
        updateData.fullName = req.body.fullName;
      }

      if (req.body.contactNumber) {
        updateData.contactNumber = req.body.contactNumber;
      }

      if (req.body.gender) {
        updateData.gender = req.body.gender;
      }

      if (req.file) {
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      if (req.body.currentPassword && req.body.newPassword) {
        updateData.currentPassword = req.body.currentPassword;
        updateData.newPassword = req.body.newPassword;
      }

      const updatedUser = await userService.updateProfile(
        userId.toString(),
        updateData
      );

      return ApiResponseHelper.success(
        res,
        updatedUser,
        "Profile updated successfully"
      );
    } catch (error: any) {
      console.log("UPDATE PROFILE ERROR:", error);

      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.statusCode || 500
      );
    }
  }
}