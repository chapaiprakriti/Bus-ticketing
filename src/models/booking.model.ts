import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  origin: string;
  destination: string;
  operatorName: string;
  busName: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  selectedSeats: string[];
  totalFare: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  status: "pending" | "confirmed" | "cancelled";
  bookingReference: string;
  passengerDetails: {
    fullName: string;
    email: string;
    contactNumber: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    operatorName: {
      type: String,
      required: true,
    },
    busName: {
      type: String,
      required: true,
    },
    travelDate: {
      type: String,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    selectedSeats: {
      type: [String],
      required: true,
    },
    totalFare: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
    },
    passengerDetails: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      contactNumber: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

export const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema, "bookings");
