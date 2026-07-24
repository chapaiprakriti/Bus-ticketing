"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingMongoRepository = void 0;
const booking_model_1 = require("../models/booking.model");
class BookingMongoRepository {
    async createBooking(data) {
        const created = await booking_model_1.BookingModel.create(data);
        return created;
    }
    async getBookingById(id) {
        return booking_model_1.BookingModel.findById(id).exec();
    }
    async getBookingsByUser(userId) {
        return booking_model_1.BookingModel.find({ user: userId }).sort({ createdAt: -1 }).exec();
    }
}
exports.BookingMongoRepository = BookingMongoRepository;
//# sourceMappingURL=booking.repository.js.map