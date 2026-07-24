"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserController = void 0;
const user_model_1 = require("../models/user.model");
const http_exception_1 = require("../exceptions/http-exception");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AdminUserController {
    /**
     * GET /api/v1/admin/users
     */
    static async getAllUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            if (page < 1 || limit < 1) {
                throw new http_exception_1.HttpException(400, "Page and limit must be positive");
            }
            const skip = (page - 1) * limit;
            const searchFilter = {};
            if (search.trim()) {
                searchFilter.$or = [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { contactNumber: { $regex: search, $options: "i" } },
                ];
            }
            const users = await user_model_1.UserModel.find(searchFilter)
                .select("-password")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
            const total = await user_model_1.UserModel.countDocuments(searchFilter);
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
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/v1/admin/users/:id
     */
    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_model_1.UserModel.findById(id).select("-password");
            if (!user) {
                throw new http_exception_1.HttpException(404, "User not found");
            }
            res.status(200).json({
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/v1/admin/users
     */
    static async createUser(req, res, next) {
        try {
            const { fullName, email, contactNumber, password, gender, role, profileImage, } = req.body;
            if (!fullName || !email || !contactNumber || !password || !gender) {
                throw new http_exception_1.HttpException(400, "All required fields must be provided");
            }
            const existingUser = await user_model_1.UserModel.findOne({
                $or: [{ email: email.toLowerCase() }, { contactNumber }],
            });
            if (existingUser) {
                throw new http_exception_1.HttpException(409, "User with this email or contact number already exists");
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const newUser = await user_model_1.UserModel.create({
                fullName,
                email: email.toLowerCase(),
                contactNumber,
                password: hashedPassword,
                gender,
                role: role || "user",
                profileImage: profileImage || null,
            });
            const userResponse = newUser.toObject();
            delete userResponse.password;
            res.status(201).json({
                message: "User created successfully",
                data: userResponse,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PUT/PATCH /api/v1/admin/users/:id
     */
    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const user = await user_model_1.UserModel.findById(id);
            if (!user) {
                throw new http_exception_1.HttpException(404, "User not found");
            }
            if (updateData.email || updateData.contactNumber) {
                const orConditions = [];
                if (updateData.email) {
                    orConditions.push({ email: updateData.email.toLowerCase() });
                }
                if (updateData.contactNumber) {
                    orConditions.push({ contactNumber: updateData.contactNumber });
                }
                const existingUser = await user_model_1.UserModel.findOne({
                    $or: orConditions,
                    _id: { $ne: id },
                });
                if (existingUser) {
                    throw new http_exception_1.HttpException(409, "User with this email or contact number already exists");
                }
            }
            if (updateData.password) {
                updateData.password = await bcryptjs_1.default.hash(updateData.password, 10);
            }
            if (updateData.email) {
                updateData.email = updateData.email.toLowerCase();
            }
            const updatedUser = await user_model_1.UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).select("-password");
            res.status(200).json({
                message: "User updated successfully",
                data: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /api/v1/admin/users/:id
     */
    static async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_model_1.UserModel.findByIdAndDelete(id);
            if (!user) {
                throw new http_exception_1.HttpException(404, "User not found");
            }
            res.status(200).json({
                message: "User deleted successfully",
                data: {
                    id: user._id,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminUserController = AdminUserController;
//# sourceMappingURL=admin.user.controller.js.map