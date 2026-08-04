import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middleware/error";
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";
import brandRoutes from "./routes/brand.route";
import categoryRoutes from "./routes/category.route";
import orderRoutes from "./routes/order.route";
import adminRoutes from "./routes/admin.route";
import vendorRoutes from "./routes/vendor.route";
import reviewRoutes from "./routes/review.route";
import paymentRoutes from "./routes/payment.route";
import cartRoutes from "./routes/cart.route";
import wishlistRoutes from "./routes/wishlist.route";
import notificationRoutes from "./routes/notifications.route";
import { paystackWebhook } from "./controllers/payment.controller";

dotenv.config();

const app = express();

// Render (and most PaaS) put a proxy in front of us, so the real client IP is in
// X-Forwarded-For. Trust exactly one proxy hop so req.ip is correct for rate
// limiting. NOT `true` — that would let clients spoof the header.
app.set("trust proxy", 1);

app.use(helmet());

// Restrict CORS to the configured origin(s). CORS_ORIGIN is a comma-separated
// list; if unset we fall back to allowing all origins (dev convenience) but
// this should always be set in production.
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);

// The Paystack webhook is registered FIRST — before the global rate limiter and
// before express.json():
//   - raw body: signature verification needs the exact bytes Paystack signed.
//   - no rate limiting: Paystack may burst legitimate retries; throttling the
//     webhook would drop payment confirmations.
app.post(
    "/api/payment/paystack/webhook",
    express.raw({ type: "application/json" }),
    paystackWebhook
);

app.use(express.json());

// Global request throttle across all NON-webhook routes (auth routes add a
// stricter limiter of their own).
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notification", notificationRoutes);
app.get("/ping", (req, res) => res.send("pong"));

// ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

export { app };
