import mongoose, { Document, Schema } from "mongoose";

export interface IFulfillment extends Document {
    order: mongoose.Types.ObjectId;
    items: {
        product: mongoose.Types.ObjectId;
        quantity: number;
        price: number;
    }[];
    // Items whose stock could not fully cover the paid quantity at fulfilment
    // time — the payment already succeeded, so these are flagged for ops to
    // backorder rather than silently dropped.
    backorderedItems: {
        product: mongoose.Types.ObjectId;
        quantity: number;
    }[];
    status: "pending" | "processing" | "shipped" | "delivered";
}

const fulfillmentSchema = new Schema<IFulfillment>(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            // One fulfilment per order — a redundant guard on top of the
            // idempotency ledger and the order status transition.
            unique: true,
        },
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        backorderedItems: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: { type: Number, required: true },
            },
        ],
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const Fulfillment = mongoose.model<IFulfillment>(
    "Fulfillment",
    fulfillmentSchema
);
export default Fulfillment;
