import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/user.type";

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  role?: "admin" | "user";
  profileImage?: string | null;
}

const UserMongoSchema: Schema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },

    contactNumber: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    gender: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUser>(
  "User",
  UserMongoSchema
);