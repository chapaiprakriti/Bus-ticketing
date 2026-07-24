import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { KHALTI_SECRET_KEY, KHALTI_INITIATE_URL, KHALTI_VERIFY_URL } from "../configs/constant";
import { CreateBookingDTO } from "../dtos/booking.dto";
import { BookingService } from "../services/booking.service";

const bookingService = new BookingService();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const lookupKhaltiPayment = async (pidx: string) => {
  const khaltiRes = await fetch(KHALTI_VERIFY_URL, {
    method: "POST",
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  const khaltiData = (await khaltiRes.json()) as any;
  return { khaltiRes, khaltiData };
};

export class PaymentController {

  /**
   * POST /api/v1/payments/khalti/initiate
   * Initiates a Khalti payment and returns the payment_url to redirect the user to.
   * Body: { amount, purchase_order_id, purchase_order_name, return_url, website_url, customer_info? }
   */
  async initiateKhalti(req: Request, res: Response) {
    try {
      const loggedInUser = (req as any).user;
      if (!loggedInUser?._id && !loggedInUser?.id) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const { amount, purchase_order_id, purchase_order_name, return_url, website_url } = req.body;

      if (!amount || !purchase_order_id || !purchase_order_name || !return_url || !website_url) {
        return ApiResponseHelper.error(res, "Missing required fields", 400);
      }

      const amountInPaisa = Math.round(Number(amount));
      if (!Number.isFinite(amountInPaisa) || amountInPaisa < 1000) {
        return ApiResponseHelper.error(res, "Amount must be at least Rs. 10 (1000 paisa)", 400);
      }

      const isSandbox = KHALTI_INITIATE_URL.includes("dev.khalti.com");

      const payload = {
        return_url,
        website_url,
        amount: amountInPaisa,
        purchase_order_id,
        purchase_order_name,
        customer_info: {
          name:  loggedInUser.fullName || "Test User",
          email: loggedInUser.email    || "test@khalti.com",
          // Sandbox test wallets only work with the merchant's own secret key + test number
          phone: isSandbox ? "9800000001" : (loggedInUser.contactNumber || "9800000001"),
        },
      };

      const khaltiRes = await fetch(KHALTI_INITIATE_URL, {
        method: "POST",
        headers: {
          "Authorization": `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const khaltiData = await khaltiRes.json() as any;
      console.log("Khalti initiate response:", khaltiData);

      if (!khaltiRes.ok || !khaltiData.payment_url) {
        return ApiResponseHelper.error(
          res,
          khaltiData?.detail || khaltiData?.error_key || "Failed to initiate Khalti payment",
          400
        );
      }

      return ApiResponseHelper.success(res, {
        pidx:        khaltiData.pidx,
        payment_url: khaltiData.payment_url,
        expires_at:  khaltiData.expires_at,
      }, "Khalti payment initiated");

    } catch (error: any) {
      console.error("Khalti initiate error:", error);
      return ApiResponseHelper.error(res, error.message || "Failed to initiate payment", 500);
    }
  }

  /**
   * POST /api/v1/payments/khalti/verify
   * Verifies payment via Khalti lookup API and creates the booking.
   * Body: { pidx, bookingData }
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

      const parsedBooking = CreateBookingDTO.safeParse(bookingData);
      if (!parsedBooking.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsedBooking.error), 400);
      }

      // ── Lookup payment status (retry while Khalti is still Pending) ───
      let khaltiLookupOk = false;
      let khaltiData: any = null;

      for (let attempt = 0; attempt < 4; attempt++) {
        const lookup = await lookupKhaltiPayment(pidx);
        khaltiLookupOk = lookup.khaltiRes.ok;
        khaltiData = lookup.khaltiData;
        console.log(`Khalti lookup attempt ${attempt + 1}:`, khaltiData);

        if (khaltiLookupOk && khaltiData.status === "Completed") break;
        if (khaltiData.status !== "Pending" && khaltiData.status !== "Initiated") break;
        if (attempt < 3) await sleep(1500);
      }

      if (!khaltiLookupOk || khaltiData?.status !== "Completed") {
        return ApiResponseHelper.error(
          res,
          khaltiData?.detail || `Payment not completed. Status: ${khaltiData?.status || "Unknown"}`,
          400
        );
      }

      // ── Create booking as paid ────────────────────────────────────────
      const passengerDetails = {
        fullName:      loggedInUser.fullName,
        email:         loggedInUser.email,
        contactNumber: loggedInUser.contactNumber,
      };

      const booking = await bookingService.createBooking(
        loggedInUser._id.toString(),
        { ...parsedBooking.data, paymentStatus: "paid", paymentMethod: "khalti" },
        passengerDetails
      );

      return ApiResponseHelper.success(res, {
        booking,
        transactionId: khaltiData.transaction_id,
        khaltiAmount:  khaltiData.total_amount,
      }, "Payment verified and booking confirmed", 201);

    } catch (error: any) {
      console.error("Khalti verify error:", error);
      return ApiResponseHelper.error(res, error.message || "Payment verification failed", 500);
    }
  }
}
