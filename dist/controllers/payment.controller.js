"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const zod_1 = require("zod");
const apihelper_util_1 = require("../utils/apihelper.util");
const constant_1 = require("../configs/constant");
const booking_dto_1 = require("../dtos/booking.dto");
const booking_service_1 = require("../services/booking.service");
const bookingService = new booking_service_1.BookingService();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const lookupKhaltiPayment = async (pidx) => {
    const khaltiRes = await fetch(constant_1.KHALTI_VERIFY_URL, {
        method: "POST",
        headers: {
            Authorization: `Key ${constant_1.KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx }),
    });
    const khaltiData = (await khaltiRes.json());
    return { khaltiRes, khaltiData };
};
class PaymentController {
    /**
     * POST /api/v1/payments/khalti/initiate
     * Initiates a Khalti payment and returns the payment_url to redirect the user to.
     * Body: { amount, purchase_order_id, purchase_order_name, return_url, website_url, customer_info? }
     */
    async initiateKhalti(req, res) {
        try {
            const loggedInUser = req.user;
            if (!loggedInUser?._id && !loggedInUser?.id) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const { amount, purchase_order_id, purchase_order_name, return_url, website_url } = req.body;
            if (!amount || !purchase_order_id || !purchase_order_name || !return_url || !website_url) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Missing required fields", 400);
            }
            const amountInPaisa = Math.round(Number(amount));
            if (!Number.isFinite(amountInPaisa) || amountInPaisa < 1000) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Amount must be at least Rs. 10 (1000 paisa)", 400);
            }
            const payload = {
                return_url,
                website_url,
                amount: amountInPaisa,
                purchase_order_id,
                purchase_order_name,
                customer_info: {
                    name: loggedInUser.fullName || "Passenger",
                    email: loggedInUser.email || "",
                    phone: loggedInUser.contactNumber || "9800000001",
                },
            };
            const khaltiRes = await fetch(constant_1.KHALTI_INITIATE_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Key ${constant_1.KHALTI_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const khaltiData = await khaltiRes.json();
            console.log("Khalti initiate response:", khaltiData);
            if (!khaltiRes.ok || !khaltiData.payment_url) {
                return apihelper_util_1.ApiResponseHelper.error(res, khaltiData?.detail || khaltiData?.error_key || "Failed to initiate Khalti payment", 400);
            }
            return apihelper_util_1.ApiResponseHelper.success(res, {
                pidx: khaltiData.pidx,
                payment_url: khaltiData.payment_url,
                expires_at: khaltiData.expires_at,
            }, "Khalti payment initiated");
        }
        catch (error) {
            console.error("Khalti initiate error:", error);
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Failed to initiate payment", 500);
        }
    }
    /**
     * POST /api/v1/payments/khalti/verify
     * Verifies payment via Khalti lookup API and creates the booking.
     * Body: { pidx, bookingData }
     */
    async verifyKhalti(req, res) {
        try {
            const loggedInUser = req.user;
            if (!loggedInUser?._id && !loggedInUser?.id) {
                return apihelper_util_1.ApiResponseHelper.error(res, "Unauthorized", 401);
            }
            const { pidx, bookingData } = req.body;
            if (!pidx) {
                return apihelper_util_1.ApiResponseHelper.error(res, "pidx is required", 400);
            }
            const parsedBooking = booking_dto_1.CreateBookingDTO.safeParse(bookingData);
            if (!parsedBooking.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, zod_1.z.prettifyError(parsedBooking.error), 400);
            }
            // ── Lookup payment status (retry while Khalti is still Pending) ───
            let khaltiLookupOk = false;
            let khaltiData = null;
            for (let attempt = 0; attempt < 4; attempt++) {
                const lookup = await lookupKhaltiPayment(pidx);
                khaltiLookupOk = lookup.khaltiRes.ok;
                khaltiData = lookup.khaltiData;
                console.log(`Khalti lookup attempt ${attempt + 1}:`, khaltiData);
                if (khaltiLookupOk && khaltiData.status === "Completed")
                    break;
                if (khaltiData.status !== "Pending" && khaltiData.status !== "Initiated")
                    break;
                if (attempt < 3)
                    await sleep(1500);
            }
            if (!khaltiLookupOk || khaltiData?.status !== "Completed") {
                return apihelper_util_1.ApiResponseHelper.error(res, khaltiData?.detail || `Payment not completed. Status: ${khaltiData?.status || "Unknown"}`, 400);
            }
            // ── Create booking as paid ────────────────────────────────────────
            const passengerDetails = {
                fullName: loggedInUser.fullName,
                email: loggedInUser.email,
                contactNumber: loggedInUser.contactNumber,
            };
            const booking = await bookingService.createBooking(loggedInUser._id.toString(), { ...parsedBooking.data, paymentStatus: "paid", paymentMethod: "khalti" }, passengerDetails);
            return apihelper_util_1.ApiResponseHelper.success(res, {
                booking,
                transactionId: khaltiData.transaction_id,
                khaltiAmount: khaltiData.total_amount,
            }, "Payment verified and booking confirmed", 201);
        }
        catch (error) {
            console.error("Khalti verify error:", error);
            return apihelper_util_1.ApiResponseHelper.error(res, error.message || "Payment verification failed", 500);
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map