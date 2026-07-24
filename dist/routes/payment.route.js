"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const authorized_middleware_1 = require("../middlewares/authorized.middleware");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.PaymentController();
// POST /api/v1/payments/khalti/initiate  — server-side initiation, returns payment_url
router.post("/khalti/initiate", authorized_middleware_1.authorizedMiddleware, paymentController.initiateKhalti.bind(paymentController));
// POST /api/v1/payments/khalti/verify  — lookup + create booking
router.post("/khalti/verify", authorized_middleware_1.authorizedMiddleware, paymentController.verifyKhalti.bind(paymentController));
exports.default = router;
//# sourceMappingURL=payment.route.js.map