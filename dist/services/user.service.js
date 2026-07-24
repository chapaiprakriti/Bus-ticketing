"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const http_exception_1 = require("../exceptions/http-exception");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constant_1 = require("../configs/constant");
const userRepository = new user_repository_1.UserMongoRepository();
class UserService {
    toPublicUser(user) {
        return {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            contactNumber: user.contactNumber,
            gender: user.gender,
            role: user.role,
            profileImage: user.profileImage || null,
            avatar: user.profileImage || null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async createUser(userData) {
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new http_exception_1.HttpException(400, "Email already exists");
        }
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
        userData.password = hashedPassword;
        const user = await userRepository.createUser(userData);
        return this.toPublicUser(user);
    }
    async loginUser(loginData) {
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new http_exception_1.HttpException(400, "Invalid email");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new http_exception_1.HttpException(400, "Invalid password");
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        }, constant_1.SECRET_KEY, { expiresIn: "30d" });
        console.log("Bearer Token:");
        console.log(`Bearer ${token}`);
        return {
            user: this.toPublicUser(user),
            token,
        };
    }
    // Sprint 3: whoami support
    async getUserById(userId) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new http_exception_1.HttpException(404, "User not found");
        }
        return this.toPublicUser(user);
    }
    // Keep old name also, if other files use it
    async getCurrentUser(userId) {
        return this.getUserById(userId);
    }
    // Sprint 3: profile update + image update + password update
    async updateProfile(userId, profileData) {
        const updateData = {};
        if (profileData.fullName) {
            updateData.fullName = profileData.fullName;
        }
        if (profileData.contactNumber) {
            updateData.contactNumber = profileData.contactNumber;
        }
        if (profileData.gender) {
            updateData.gender = profileData.gender;
        }
        if (profileData.profileImage) {
            updateData.profileImage = profileData.profileImage;
        }
        // Password update from same /update API
        if (profileData.currentPassword && profileData.newPassword) {
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new http_exception_1.HttpException(404, "User not found");
            }
            const isPasswordValid = await bcryptjs_1.default.compare(profileData.currentPassword, user.password);
            if (!isPasswordValid) {
                throw new http_exception_1.HttpException(400, "Current password is incorrect");
            }
            updateData.password = await bcryptjs_1.default.hash(profileData.newPassword, 10);
        }
        const updatedUser = await userRepository.update(userId, updateData);
        if (!updatedUser) {
            throw new http_exception_1.HttpException(404, "User not found");
        }
        return this.toPublicUser(updatedUser);
    }
    async updatePassword(userId, passwordData) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new http_exception_1.HttpException(404, "User not found");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(passwordData.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new http_exception_1.HttpException(400, "Current password is incorrect");
        }
        const hashedPassword = await bcryptjs_1.default.hash(passwordData.newPassword, 10);
        const updatedUser = await userRepository.update(userId, {
            password: hashedPassword,
        });
        if (!updatedUser) {
            throw new http_exception_1.HttpException(404, "User not found");
        }
        return this.toPublicUser(updatedUser);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map