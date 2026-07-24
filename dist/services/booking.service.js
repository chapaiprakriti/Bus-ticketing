"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const booking_repository_1 = require("../repositories/booking.repository");
const http_exception_1 = require("../exceptions/http-exception");
const bookingRepository = new booking_repository_1.BookingMongoRepository();
class BookingService {
    toPublicBooking(booking) {
        return {
            id: booking._id.toString(),
            origin: booking.origin,
            destination: booking.destination,
            operatorName: booking.operatorName,
            busName: booking.busName,
            travelDate: booking.travelDate,
            departureTime: booking.departureTime,
            arrivalTime: booking.arrivalTime,
            selectedSeats: booking.selectedSeats,
            totalFare: booking.totalFare,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            status: booking.status,
            bookingReference: booking.bookingReference,
            passengerDetails: booking.passengerDetails,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
        };
    }
    async createBooking(userId, bookingData, passengerDetails) {
        const bookingReference = `BK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const booking = await bookingRepository.createBooking({
            user: userId,
            origin: bookingData.origin,
            destination: bookingData.destination,
            operatorName: bookingData.operatorName,
            busName: bookingData.busName,
            travelDate: bookingData.travelDate,
            departureTime: bookingData.departureTime,
            arrivalTime: bookingData.arrivalTime,
            selectedSeats: bookingData.selectedSeats,
            totalFare: bookingData.totalFare,
            paymentMethod: bookingData.paymentMethod,
            paymentStatus: bookingData.paymentStatus,
            status: bookingData.paymentStatus === "paid" ? "confirmed" : "pending",
            bookingReference,
            passengerDetails,
        });
        return this.toPublicBooking(booking);
    }
    async getBookingsByUser(userId) {
        const bookings = await bookingRepository.getBookingsByUser(userId);
        return bookings.map((booking) => this.toPublicBooking(booking));
    }
    async getBookingById(userId, bookingId) {
        const booking = await bookingRepository.getBookingById(bookingId);
        if (!booking) {
            throw new http_exception_1.HttpException(404, "Booking not found");
        }
        if (booking.user.toString() !== userId) {
            throw new http_exception_1.HttpException(403, "Forbidden");
        }
        return this.toPublicBooking(booking);
    }
}
exports.BookingService = BookingService;
//# sourceMappingURL=booking.service.js.map