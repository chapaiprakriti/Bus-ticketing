import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const paymentController = new PaymentController();

// POST /api/v1/payments/khalti/initiate  — server-side initiation, returns payment_url
router.post(
  "/khalti/initiate",
  authorizedMiddleware,
  paymentController.initiateKhalti.bind(paymentController)
);

// POST /api/v1/payments/khalti/verify  — lookup + create booking
router.post(
  "/khalti/verify",
  authorizedMiddleware,
  paymentController.verifyKhalti.bind(paymentController)
);

export default router;
