import { UserMongoRepository } from "../repositories/user.repository";
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdatePasswordDTO,
  UpdateProfileDTO,
} from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";

const userRepository = new UserMongoRepository();

export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  contactNumber?: string;
  gender?: string;
  role?: "admin" | "user";
  profileImage?: string | null;
  avatar?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export class UserService {
  private toPublicUser(user: IUser): PublicUser {
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

  async createUser(userData: CreateUserDTO): Promise<PublicUser> {
    const existingEmail = await userRepository.getUserByEmail(userData.email);

    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    const hashedPassword = await bcryptjs.hash(userData.password, 10);
    userData.password = hashedPassword;

    const user = await userRepository.createUser(userData);

    return this.toPublicUser(user);
  }

  async loginUser(loginData: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(loginData.email);

    if (!user) {
      throw new HttpException(400, "Invalid email");
    }

    const isPasswordValid = await bcryptjs.compare(
      loginData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new HttpException(400, "Invalid password");
    }

    const token = jwt.sign(
  {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  },
  SECRET_KEY,
  { expiresIn: "30d" }
);
    console.log("Bearer Token:");
    console.log(`Bearer ${token}`);

    return {
      user: this.toPublicUser(user),
      token,
    };
  }

  // Sprint 3: whoami support
  async getUserById(userId: string): Promise<PublicUser> {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return this.toPublicUser(user);
  }

  // Keep old name also, if other files use it
  async getCurrentUser(userId: string): Promise<PublicUser> {
    return this.getUserById(userId);
  }

  // Sprint 3: profile update + image update + password update
  async updateProfile(userId: string, profileData: any): Promise<PublicUser> {
    const updateData: any = {};

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
        throw new HttpException(404, "User not found");
      }

      const isPasswordValid = await bcryptjs.compare(
        profileData.currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        throw new HttpException(400, "Current password is incorrect");
      }

      updateData.password = await bcryptjs.hash(profileData.newPassword, 10);
    }

    const updatedUser = await userRepository.update(userId, updateData);

    if (!updatedUser) {
      throw new HttpException(404, "User not found");
    }

    return this.toPublicUser(updatedUser);
  }

  async updatePassword(
    userId: string,
    passwordData: UpdatePasswordDTO
  ): Promise<PublicUser> {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const isPasswordValid = await bcryptjs.compare(
      passwordData.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new HttpException(400, "Current password is incorrect");
    }

    const hashedPassword = await bcryptjs.hash(passwordData.newPassword, 10);

    const updatedUser = await userRepository.update(userId, {
      password: hashedPassword,
    } as any);

    if (!updatedUser) {
      throw new HttpException(404, "User not found");
    }

    return this.toPublicUser(updatedUser);
  }
}