import { z } from "zod";
import { UserSchema } from "../types/user.type";

// Create a DTO for creating a user
// export const CreateUserDTO = UserSchema.omit({ role: true });
export const CreateUserDTO = UserSchema.pick({
    fullName: true,
    email: true,
    contactNumber: true,
    password: true,
    gender: true
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// Login Dto
// 1. Create new schame
// export const LoginUserDTO = z.object({
//     email: z.email(),
//     password: z.string().min(6, "Password must be at least 6 characters long")
// });
// 2. Reuse existing schema
export const LoginUserDTO = UserSchema.pick({
    email: true,
    password: true
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

// DTO for updating profile info (excludes password/email)
export const UpdateProfileDTO = z.object({
    fullName: z.string().min(1, "Full name is required").optional(),
    contactNumber: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    profileImage: z.string().nullable().optional(),
});
export type UpdateProfileDTO = z.infer<typeof UpdateProfileDTO>;

// DTO for changing password
export const UpdatePasswordDTO = z.object({
    currentPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordDTO>;