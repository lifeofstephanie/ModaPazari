import express from "express";
import cors from "cors";
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

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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
