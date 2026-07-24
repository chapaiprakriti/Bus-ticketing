"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingSchema = exports.PaymentStatusSchema = exports.BookingStatusSchema = void 0;
const zod_1 = require("zod");
exports.BookingStatusSchema = zod_1.z.enum(["pending", "confirmed", "cancelled"]);
exports.PaymentStatusSchema = zod_1.z.enum(["pending", "paid", "failed"]);
exports.BookingSchema = zod_1.z.object({
    origin: zod_1.z.string().min(1, "Origin is required"),
    destination: zod_1.z.string().min(1, "Destination is required"),
    operatorName: zod_1.z.string().min(1, "Operator name is required"),
    busName: zod_1.z.string().min(1, "Bus name is required"),
    travelDate: zod_1.z.string().min(1, "Travel date is required"),
    departureTime: zod_1.z.string().min(1, "Departure time is required"),
    arrivalTime: zod_1.z.string().min(1, "Arrival time is required"),
    selectedSeats: zod_1.z.array(zod_1.z.string()).min(1, "Select at least one seat"),
    totalFare: zod_1.z.number().nonnegative("Total fare must be a positive number"),
    paymentMethod: zod_1.z.string().min(1, "Payment method is required"),
    paymentStatus: exports.PaymentStatusSchema,
    status: exports.BookingStatusSchema.optional(),
    bookingReference: zod_1.z.string().optional(),
    passengerDetails: zod_1.z
        .object({
        fullName: zod_1.z.string(),
        email: zod_1.z.string().email(),
        contactNumber: zod_1.z.string().min(1),
    })
        .optional(),
});
//# sourceMappingURL=booking.type.js.map