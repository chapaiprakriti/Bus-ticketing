import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const bookingController = new BookingController();

router.post(
  "/",
  authorizedMiddleware,
  bookingController.createBooking.bind(bookingController)
);
router.get(
  "/",
  authorizedMiddleware,
  bookingController.getMyBookings.bind(bookingController)
);
router.get(
  "/:id",
  authorizedMiddleware,
  bookingController.getBookingById.bind(bookingController)
);

export default router;
