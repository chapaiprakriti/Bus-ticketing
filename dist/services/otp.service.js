"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const constant_1 = require("../configs/constant");
const otpStore = new Map();
// Auto-clean expired entries every 5 minutes
setInterval(() => {
    const now = new Date();
    for (const [email, entry] of otpStore.entries()) {
        if (entry.expiresAt <= now)
            otpStore.delete(email);
    }
}, 5 * 60 * 1000);
// ─── Nodemailer transporter ─────────────────────────────────────────────────
const transporter = nodemailer_1.default.createTransport({
    host: constant_1.SMTP_HOST,
    port: constant_1.SMTP_PORT,
    secure: constant_1.SMTP_PORT === 465,
    auth: {
        user: constant_1.SMTP_USER,
        pass: constant_1.SMTP_PASS,
    },
});
// ─── OTP Service ────────────────────────────────────────────────────────────
class OtpService {
    /** Generate a 6-digit OTP, store it for 5 minutes, send to email. */
    async sendOtp(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        otpStore.set(email.toLowerCase(), { otp, expiresAt });
        const mailOptions = {
            from: constant_1.SMTP_FROM,
            to: email,
            subject: "SeatSathi — Password Reset OTP",
            html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;
                    background:#0f1b3e;color:#fff;border-radius:12px;padding:32px;">
          <h2 style="color:#ffa726;margin-bottom:8px;">SeatSathi</h2>
          <h3 style="margin-bottom:24px;">Password Reset OTP</h3>
          <p style="color:#ccc;margin-bottom:24px;">
            Use the OTP below to reset your password. It is valid for
            <strong style="color:#ffa726;">5 minutes</strong>.
          </p>
          <div style="background:#1b2544;border-radius:10px;padding:24px;
                      text-align:center;letter-spacing:10px;
                      font-size:36px;font-weight:bold;color:#ffa726;">
            ${otp}
          </div>
          <p style="color:#888;margin-top:24px;font-size:13px;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
        };
        await transporter.sendMail(mailOptions);
    }
    /** Verify OTP. Returns true if valid and not expired. Deletes it on success. */
    verifyOtp(email, otp) {
        const entry = otpStore.get(email.toLowerCase());
        if (!entry)
            return false;
        if (new Date() > entry.expiresAt) {
            otpStore.delete(email.toLowerCase());
            return false;
        }
        if (entry.otp !== otp)
            return false;
        otpStore.delete(email.toLowerCase()); // one-time use
        return true;
    }
}
exports.OtpService = OtpService;
//# sourceMappingURL=otp.service.js.map