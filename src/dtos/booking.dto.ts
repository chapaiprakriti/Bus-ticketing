import { z } from "zod";

export const CreateBookingDTO = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  operatorName: z.string().min(1, "Operator name is required"),
  busName: z.string().min(1, "Bus name is required"),
  travelDate: z.string().min(1, "Travel date is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  selectedSeats: z.array(z.string()).min(1, "Select at least one seat"),
  totalFare: z.number().nonnegative("Total fare must be a non-negative number"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentStatus: z.enum(["pending", "paid", "failed"]),
});

export type CreateBookingDTO = z.infer<typeof CreateBookingDTO>;
