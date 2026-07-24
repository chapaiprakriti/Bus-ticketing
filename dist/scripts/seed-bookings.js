"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongodb_1 = require("../database/mongodb");
const user_model_1 = require("../models/user.model");
const booking_model_1 = require("../models/booking.model");
async function seedBookings() {
    await (0, mongodb_1.connectToMongoDB)();
    const userEmail = process.env.SEED_USER_EMAIL || "dummyuser@example.com";
    const userPassword = process.env.SEED_USER_PASSWORD || "Password123";
    let user = await user_model_1.UserModel.findOne({ email: userEmail });
    if (!user) {
        const hashedPassword = await bcryptjs_1.default.hash(userPassword, 10);
        user = await user_model_1.UserModel.create({
            fullName: "Dummy Passenger",
            email: userEmail,
            contactNumber: "9801234567",
            gender: "male",
            password: hashedPassword,
            role: "user",
        });
        console.log(`Created seed user: ${userEmail} / ${userPassword}`);
    }
    else {
        console.log(`Seed user already exists: ${userEmail}`);
    }
    const bookings = [
        {
            user: user._id,
            origin: "Kathmandu",
            destination: "Pokhara",
            operatorName: "Swift Holidays",
            busName: "Sofa Deluxe AC",
            travelDate: "2026-10-24",
            departureTime: "07:00 AM",
            arrivalTime: "02:30 PM",
            selectedSeats: ["S1"],
            totalFare: 1200,
            paymentMethod: "Khalti Wallet",
            paymentStatus: "paid",
            status: "confirmed",
            bookingReference: `BK-${Date.now()}-001`,
            passengerDetails: {
                fullName: user.fullName,
                email: user.email,
                contactNumber: user.contactNumber,
            },
        },
        {
            user: user._id,
            origin: "Kathmandu",
            destination: "Pokhara",
            operatorName: "Jagadamba Travels",
            busName: "AC VIP",
            travelDate: "2026-10-24",
            departureTime: "08:30 AM",
            arrivalTime: "04:00 PM",
            selectedSeats: ["S1", "S2", "S3"],
            totalFare: 4500,
            paymentMethod: "Cash on Boarding",
            paymentStatus: "pending",
            status: "pending",
            bookingReference: `BK-${Date.now()}-002`,
            passengerDetails: {
                fullName: user.fullName,
                email: user.email,
                contactNumber: user.contactNumber,
            },
        },
    ];
    for (const booking of bookings) {
        const existing = await booking_model_1.BookingModel.findOne({ bookingReference: booking.bookingReference });
        if (!existing) {
            await booking_model_1.BookingModel.create(booking);
            console.log(`Created booking: ${booking.bookingReference}`);
        }
        else {
            console.log(`Booking already exists: ${booking.bookingReference}`);
        }
    }
    console.log("Booking seed completed.");
    process.exit(0);
}
seedBookings().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed-bookings.js.map