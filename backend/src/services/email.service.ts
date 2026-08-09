import nodemailer, { Transporter } from "nodemailer";

/**
 * Transactional email via SMTP. Configured entirely from env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * If SMTP isn't configured we log and no-op (so local/dev and unconfigured
 * deploys keep working). Every send is best-effort and never throws — a failed
 * email must not break the business action that triggered it.
 */
let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      // Fail fast so a slow/misconfigured SMTP host can never hang a request.
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
    });
  }
  return transporter;
};

export interface EmailInput {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailInput): Promise<void> => {
  const tx = getTransporter();
  if (!tx) {
    console.warn(`[email] SMTP not configured — skipped email to ${to}: "${subject}"`);
    return;
  }
  try {
    await tx.sendMail({
      from: process.env.SMTP_FROM || "Moda Pazari <no-reply@modapazari.com>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] send failed:", err);
  }
};

// ---- Shared layout ----------------------------------------------------------
const shell = (title: string, body: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
    <div style="padding:24px 0;text-align:center;border-bottom:1px solid #eee">
      <span style="font-size:22px;font-weight:700;color:#7a2048">Moda Pazari</span>
    </div>
    <div style="padding:28px 8px">
      <h2 style="margin:0 0 12px;font-size:18px">${title}</h2>
      ${body}
    </div>
    <div style="padding:18px 8px;border-top:1px solid #eee;color:#888;font-size:12px;text-align:center">
      © ${new Date().getFullYear()} Moda Pazari
    </div>
  </div>`;

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;margin:16px 0;padding:12px 22px;background:#7a2048;color:#fff;text-decoration:none;border-radius:6px;font-size:14px">${label}</a>`;

// ---- Templates --------------------------------------------------------------
export const emailTemplates = {
  passwordReset: (name: string, url: string) =>
    shell(
      "Reset your password",
      `<p>Hi ${name || "there"},</p>
       <p>We received a request to reset your password. This link expires in 1 hour.</p>
       ${button(url, "Reset password")}
       <p style="color:#888;font-size:13px">If you didn't request this, you can safely ignore this email.</p>`
    ),

  verifyEmail: (name: string, url: string) =>
    shell(
      "Confirm your email",
      `<p>Hi ${name || "there"},</p>
       <p>Please confirm your email address to activate your account.</p>
       ${button(url, "Verify email")}`
    ),

  orderConfirmed: (name: string, orderId: string, total: string) =>
    shell(
      "Your order is confirmed",
      `<p>Hi ${name || "there"},</p>
       <p>Thanks for shopping with us. Your order <strong>#${orderId}</strong> has been confirmed and is being processed.</p>
       <p>Total: <strong>${total}</strong></p>`
    ),

  orderStatus: (name: string, orderId: string, status: string) =>
    shell(
      `Order ${status}`,
      `<p>Hi ${name || "there"},</p>
       <p>Your order <strong>#${orderId}</strong> has been <strong>${status}</strong>.</p>`
    ),

  vendorApproved: (name: string, url: string) =>
    shell(
      "You're approved to sell",
      `<p>Hi ${name || "there"},</p>
       <p>Your vendor account has been approved. You can now list products on Moda Pazari.</p>
       ${button(url, "Go to your dashboard")}`
    ),
};
