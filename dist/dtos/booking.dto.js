"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookingDTO = void 0;
const zod_1 = require("zod");
exports.CreateBookingDTO = zod_1.z.object({
    origin: zod_1.z.string().min(1, "Origin is required"),
    destination: zod_1.z.string().min(1, "Destination is required"),
    operatorName: zod_1.z.string().min(1, "Operator name is required"),
    busName: zod_1.z.string().min(1, "Bus name is required"),
    travelDate: zod_1.z.string().min(1, "Travel date is required"),
    departureTime: zod_1.z.string().min(1, "Departure time is required"),
    arrivalTime: zod_1.z.string().min(1, "Arrival time is required"),
    selectedSeats: zod_1.z.array(zod_1.z.string()).min(1, "Select at least one seat"),
    totalFare: zod_1.z.number().nonnegative("Total fare must be a non-negative number"),
    paymentMethod: zod_1.z.string().min(1, "Payment method is required"),
    paymentStatus: zod_1.z.enum(["pending", "paid", "failed"]),
});
//# sourceMappingURL=booking.dto.js.map