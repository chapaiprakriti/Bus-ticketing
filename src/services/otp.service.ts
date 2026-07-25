import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } from "../configs/constant";

// ─── In-memory OTP store ────────────────────────────────────────────────────
// key: email (lowercase)  value: { otp, expiresAt }
interface OtpEntry {
  otp: string;
  expiresAt: Date;
}

const otpStore = new Map<string, OtpEntry>();

// Auto-clean expired entries every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [email, entry] of otpStore.entries()) {
    if (entry.expiresAt <= now) otpStore.delete(email);
  }
}, 5 * 60 * 1000);

// ─── Nodemailer transporter ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   SMTP_HOST,
  port:   SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 10000,   // 10 seconds
  greetingTimeout:   10000,
  socketTimeout:     15000,
  tls: {
    rejectUnauthorized: false,
  },
});

// ─── OTP Service ────────────────────────────────────────────────────────────
export class OtpService {

  /** Generate a 6-digit OTP, store it for 5 minutes, send to email. */
  async sendOtp(email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP immediately — don't wait for email
    otpStore.set(email.toLowerCase(), { otp, expiresAt });

    console.log(`OTP for ${email}: ${otp}`); // visible in Render logs for debugging

    const mailOptions = {
      from:    SMTP_FROM,
      to:      email,
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

    // Send email in background — don't block the API response
    transporter.sendMail(mailOptions).catch((err) => {
      console.error("Failed to send OTP email:", err.message);
    });
  }

  /** Verify OTP. Returns true if valid and not expired. Deletes it on success. */
  verifyOtp(email: string, otp: string): boolean {
    const entry = otpStore.get(email.toLowerCase());
    if (!entry) return false;
    if (new Date() > entry.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return false;
    }
    if (entry.otp !== otp) return false;
    otpStore.delete(email.toLowerCase()); // one-time use
    return true;
  }
}
