"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePasswordDTO = exports.UpdateProfileDTO = exports.LoginUserDTO = exports.CreateUserDTO = void 0;
const zod_1 = require("zod");
const user_type_1 = require("../types/user.type");
// Create a DTO for creating a user
// export const CreateUserDTO = UserSchema.omit({ role: true });
exports.CreateUserDTO = user_type_1.UserSchema.pick({
    fullName: true,
    email: true,
    contactNumber: true,
    password: true,
    gender: true
});
// Login Dto
// 1. Create new schame
// export const LoginUserDTO = z.object({
//     email: z.email(),
//     password: z.string().min(6, "Password must be at least 6 characters long")
// });
// 2. Reuse existing schema
exports.LoginUserDTO = user_type_1.UserSchema.pick({
    email: true,
    password: true
});
// DTO for updating profile info (excludes password/email)
exports.UpdateProfileDTO = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Full name is required").optional(),
    contactNumber: zod_1.z.string().optional(),
    gender: zod_1.z.enum(["male", "female", "other"]).optional(),
    profileImage: zod_1.z.string().nullable().optional(),
});
// DTO for changing password
exports.UpdatePasswordDTO = zod_1.z.object({
    currentPassword: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    newPassword: zod_1.z.string().min(6, "New password must be at least 6 characters"),
});
//# sourceMappingURL=user.dto.js.map