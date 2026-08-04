import { Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model";
import { AuthRequest } from "../middleware/auth";
import {
  processPaystackCharge,
  DuplicateWebhookEventError,
  OrderNotReadyError,
  PaymentDataError,
} from "../services/paystackFulfillment.service";

const PAYSTACK_API = process.env.PAYSTACK_API || "https://api.paystack.co";

/**
 * Initialises a Paystack transaction for an existing pending order.
 *
 * The amount is taken from the order (never the client) and the buyer email from
 * the authenticated user, so neither can be tampered with. We store the returned
 * reference on the order so the webhook can match it idempotently.
 */
export const initializePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: "Valid orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (String(order.buyer) !== String(req.user?._id)) {
      return res.status(403).json({ message: "Not your order" });
    }
    if (order.status !== "pending") {
      return res.status(400).json({ message: "Order is not payable" });
    }

    const response = await axios.post(
      `${PAYSTACK_API}/transaction/initialize`,
      {
        email: req.user?.email,
        amount: Math.round(order.totalPrice * 100), // kobo
        metadata: { orderId: String(order._id) },
        // Where Paystack redirects the buyer after payment. Supplied by the
        // client so it can point at the right frontend origin.
        ...(req.body.callbackUrl
          ? { callback_url: req.body.callbackUrl }
          : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    order.paymentReference = response.data?.data?.reference;
    await order.save();

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error(
      "Initialize Payment Error: ",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { transaction_id } = req.params;
    const response = await axios.get(
      `${PAYSTACK_API}/transaction/verify/${transaction_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error(
      "Verify Payment Error: ",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "Error Verifying Payment" });
  }
};

/**
 * Paystack webhook receiver.
 *
 * MUST be mounted with express.raw() (see app.ts): the signature is an HMAC over
 * the exact bytes Paystack sent, which express.json() would consume and
 * re-serialise differently. Fulfilment is delegated to a transactional,
 * idempotent service so duplicate/concurrent deliveries are safe.
 */
export const paystackWebhook = async (req: Request, res: Response) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("[paystack] PAYSTACK_SECRET_KEY is not set");
    return res.status(500).json({ message: "Webhook not configured" });
  }

  // req.body is a Buffer thanks to express.raw().
  const raw = req.body as Buffer;
  const signature = req.headers["x-paystack-signature"] as string | undefined;
  const hash = crypto.createHmac("sha512", secret).update(raw).digest("hex");

  if (!signature || hash !== signature) {
    return res.status(401).json({ message: "Invalid signature" });
  }

  let event: any;
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(400).json({ message: "Malformed payload" });
  }

  // Acknowledge everything we don't act on so Paystack stops retrying it.
  if (event?.event !== "charge.success") {
    return res.status(200).json({ received: true, ignored: event?.event });
  }

  try {
    const result = await processPaystackCharge({ data: event.data });
    return res.status(200).json({ received: true, ...result });
  } catch (err) {
    if (err instanceof DuplicateWebhookEventError) {
      return res.status(200).json({ received: true, duplicate: true });
    }
    if (err instanceof OrderNotReadyError) {
      return res.status(409).json({ message: err.message });
    }
    if (err instanceof PaymentDataError) {
      return res.status(400).json({ message: err.message });
    }
    console.error("[paystack] webhook processing failed:", err);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};
