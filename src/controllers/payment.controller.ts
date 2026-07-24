import { Request, Response } from "express";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { KHALTI_SECRET_KEY, KHALTI_VERIFY_URL } from "../configs/constant";
import { BookingService } from "../services/booking.service";

const bookingService = new BookingService();

export class PaymentController {
  /**
   * POST /api/v1/payments/khalti/verify
   * Body: { pidx, bookingData }
   *   pidx       — Khalti payment identifier (from redirect)
   *   bookingData — full booking payload to create after verification
   */
  async verifyKhalti(req: Request, res: Response) {
    try {
      const loggedInUser = (req as any).user;
      if (!loggedInUser?._id && !loggedInUser?.id) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const { pidx, bookingData } = req.body;

      if (!pidx) {
        return ApiResponseHelper.error(res, "pidx is required", 400);
      }

      // ── Verify with Khalti ────────────────────────────────────────────
      const khaltiRes = await fetch(KHALTI_VERIFY_URL, {
        method: "POST",
        headers: {
          "Authorization": `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx }),
      });

      const khaltiData = await khaltiRes.json() as any;

      console.log("Khalti verify response:", khaltiData);

      // Status must be "Completed" for a successful payment
      if (!khaltiRes.ok || khaltiData.status !== "Completed") {
        return ApiResponseHelper.error(
          res,
          `Payment verification failed: ${khaltiData.detail || khaltiData.status || "Unknown error"}`,
          400
        );
      }

      // ── Create booking ────────────────────────────────────────────────
      const passengerDetails = {
        fullName: loggedInUser.fullName,
        email: loggedInUser.email,
        contactNumber: loggedInUser.contactNumber,
      };

      const booking = await bookingService.createBooking(
        loggedInUser._id.toString(),
        {
          ...bookingData,
          paymentStatus: "paid",
          paymentMethod: "khalti",
        },
        passengerDetails
      );

      return ApiResponseHelper.success(
        res,
        {
          booking,
          khaltiAmount: khaltiData.total_amount,
          transactionId: khaltiData.transaction_id,
        },
        "Payment verified and booking confirmed",
        201
      );
    } catch (error: any) {
      console.error("Khalti verify error:", error);
      return ApiResponseHelper.error(
        res,
        error.message || "Payment verification failed",
        500
      );
    }
  }
}
