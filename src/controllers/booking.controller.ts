import { Request, Response } from "express";
import { BookingService } from "../services/booking.service";
import { CreateBookingDTO } from "../dtos/booking.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { z } from "zod";

const bookingService = new BookingService();

export class BookingController {
  async createBooking(req: Request, res: Response) {
    try {
      const loggedInUser = (req as any).user;

      if (!loggedInUser?._id && !loggedInUser?.id) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const bookingData = CreateBookingDTO.safeParse(req.body);

      if (!bookingData.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(bookingData.error),
          400
        );
      }

      const passengerDetails = {
        fullName: loggedInUser.fullName,
        email: loggedInUser.email,
        contactNumber: loggedInUser.contactNumber,
      };

      const booking = await bookingService.createBooking(
        loggedInUser._id.toString(),
        bookingData.data,
        passengerDetails
      );

      return ApiResponseHelper.success(res, booking, "Booking created successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.statusCode || 500
      );
    }
  }

  async getMyBookings(req: Request, res: Response) {
    try {
      const loggedInUser = (req as any).user;

      if (!loggedInUser?._id && !loggedInUser?.id) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const bookings = await bookingService.getBookingsByUser(
        loggedInUser._id.toString()
      );

      return ApiResponseHelper.success(res, bookings, "Bookings fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.statusCode || 500
      );
    }
  }

  async getBookingById(req: Request, res: Response) {
    try {
      const loggedInUser = (req as any).user;

      if (!loggedInUser?._id && !loggedInUser?.id) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const booking = await bookingService.getBookingById(
        loggedInUser._id.toString(),
        String(req.params.id)
      );

      return ApiResponseHelper.success(res, booking, "Booking fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.statusCode || 500
      );
    }
  }
}
