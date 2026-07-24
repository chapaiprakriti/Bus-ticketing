"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const authorized_middleware_1 = require("../middlewares/authorized.middleware");
const router = (0, express_1.Router)();
const bookingController = new booking_controller_1.BookingController();
router.post("/", authorized_middleware_1.authorizedMiddleware, bookingController.createBooking.bind(bookingController));
router.get("/", authorized_middleware_1.authorizedMiddleware, bookingController.getMyBookings.bind(bookingController));
router.get("/:id", authorized_middleware_1.authorizedMiddleware, bookingController.getBookingById.bind(bookingController));
exports.default = router;
//# sourceMappingURL=booking.route.js.map