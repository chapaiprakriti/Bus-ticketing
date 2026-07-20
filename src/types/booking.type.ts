import { z } from "zod";

export const BookingStatusSchema = z.enum(["pending", "confirmed", "cancelled"]);
export const PaymentStatusSchema = z.enum(["pending", "paid", "failed"]);

export const BookingSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  operatorName: z.string().min(1, "Operator name is required"),
  busName: z.string().min(1, "Bus name is required"),
  travelDate: z.string().min(1, "Travel date is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  selectedSeats: z.array(z.string()).min(1, "Select at least one seat"),
  totalFare: z.number().nonnegative("Total fare must be a positive number"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentStatus: PaymentStatusSchema,
  status: BookingStatusSchema.optional(),
  bookingReference: z.string().optional(),
  passengerDetails: z
    .object({
      fullName: z.string(),
      email: z.string().email(),
      contactNumber: z.string().min(1),
    })
    .optional(),
});

export type BookingType = z.infer<typeof BookingSchema>;
