import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";

interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
}

interface CreateUserRequest {
  fullName: string;
  email: string;
  contactNumber: string;
  password: string;
  gender: string;
  role?: "admin" | "user";
  profileImage?: string;
}

interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  contactNumber?: string;
  gender?: string;
  role?: "admin" | "user";
  profileImage?: string;
  password?: string;
}

export class AdminUserController {
  /**
   * GET /api/v1/admin/users
   */
  static async getAllUsers(
    req: Request<{}, {}, {}, PaginationQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";

      if (page < 1 || limit < 1) {
        throw new HttpException(400, "Page and limit must be positive");
      }

      const skip = (page - 1) * limit;

      const searchFilter: any = {};

      if (search.trim()) {
        searchFilter.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { contactNumber: { $regex: search, $options: "i" } },
        ];
      }

      const users = await UserModel.find(searchFilter)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await UserModel.countDocuments(searchFilter);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/users/:id
   */
  static async getUserById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id).select("-password");

      if (!user) {
        throw new HttpException(404, "User not found");
      }

      res.status(200).json({
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/users
   */
  static async createUser(
    req: Request<{}, {}, CreateUserRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        fullName,
        email,
        contactNumber,
        password,
        gender,
        role,
        profileImage,
      } = req.body;

      if (!fullName || !email || !contactNumber || !password || !gender) {
        throw new HttpException(400, "All required fields must be provided");
      }

      const existingUser = await UserModel.findOne({
        $or: [{ email: email.toLowerCase() }, { contactNumber }],
      });

      if (existingUser) {
        throw new HttpException(
          409,
          "User with this email or contact number already exists"
        );
      }

      const hashedPassword = await bcryptjs.hash(password, 10);

      const newUser = await UserModel.create({
        fullName,
        email: email.toLowerCase(),
        contactNumber,
        password: hashedPassword,
        gender,
        role: role || "user",
        profileImage: profileImage || null,
      });

      const userResponse = newUser.toObject();
      delete (userResponse as any).password;

      res.status(201).json({
        message: "User created successfully",
        data: userResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT/PATCH /api/v1/admin/users/:id
   */
  static async updateUser(
    req: Request<{ id: string }, {}, UpdateUserRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await UserModel.findById(id);

      if (!user) {
        throw new HttpException(404, "User not found");
      }

      if (updateData.email || updateData.contactNumber) {
        const orConditions: any[] = [];

        if (updateData.email) {
          orConditions.push({ email: updateData.email.toLowerCase() });
        }

        if (updateData.contactNumber) {
          orConditions.push({ contactNumber: updateData.contactNumber });
        }

        const existingUser = await UserModel.findOne({
          $or: orConditions,
          _id: { $ne: id },
        });

        if (existingUser) {
          throw new HttpException(
            409,
            "User with this email or contact number already exists"
          );
        }
      }

      if (updateData.password) {
        updateData.password = await bcryptjs.hash(updateData.password, 10);
      }

      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");

      res.status(200).json({
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/users/:id
   */
  static async deleteUser(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const user = await UserModel.findByIdAndDelete(id);

      if (!user) {
        throw new HttpException(404, "User not found");
      }

      res.status(200).json({
        message: "User deleted successfully",
        data: {
          id: user._id,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}