"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const booking_service_1 = require("../services/booking.service");
const booking_dto_1 = require("../dtos/booking.dto");
const apihelper_util_1 = require("../utils/apihelper.util");
const zod_1 = require("zod");
const bookingService = new booking_service_1.BookingService();
class BookingController {
    async createBooking(req, res) {
        try {
            const loggedInUser = req.user;
            if (!loggedInUser?._id && !loggedInUser?.id) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const bookingData = booking_dto_1.CreateBookingDTO.safeParse(req.body);
            if (!bookingData.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(bookingData.error), 400);
            }
            const passengerDetails = {
                fullName: loggedInUser.fullName,
                email: loggedInUser.email,
                contactNumber: loggedInUser.contactNumber,
            };
            const booking = await bookingService.createBooking(loggedInUser._id.toString(), bookingData.data, passengerDetails);
            return apihelper_util_1.ApiResponseHelper.success(res, booking, "Booking created successfully", 201);
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.statusCode || 500);
        }
    }
    async getMyBookings(req, res) {
        try {
            const loggedInUser = req.user;
            if (!loggedInUser?._id && !loggedInUser?.id) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const bookings = await bookingService.getBookingsByUser(loggedInUser._id.toString());
            return apihelper_util_1.ApiResponseHelper.success(res, bookings, "Bookings fetched successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.statusCode || 500);
        }
    }
    async getBookingById(req, res) {
        try {
            const loggedInUser = req.user;
            if (!loggedInUser?._id && !loggedInUser?.id) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const booking = await bookingService.getBookingById(loggedInUser._id.toString(), String(req.params.id));
            return apihelper_util_1.ApiResponseHelper.success(res, booking, "Booking fetched successfully");
        }
        catch (error) {
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Internal Server Error", error.statusCode || 500);
        }
    }
}
exports.BookingController = BookingController;
//# sourceMappingURL=booking.controller.js.map