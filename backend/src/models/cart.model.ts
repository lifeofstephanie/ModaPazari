import { Document, model, Schema } from "mongoose";

interface ICartItem {
    product: Schema.Types.ObjectId;
    quantity: number;
    color?: string;
    size?: string;
}

export interface ICart extends Document {
    user: Schema.Types.ObjectId;
    items: ICartItem[];
}

const cartSchema = new Schema<ICart>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
                // Variant selectors — a product+colour+size is a distinct line.
                color: { type: String, default: "" },
                size: { type: String, default: "" },
            },
        ],
    },
    { timestamps: true }
);

export default model<ICart>("Cart", cartSchema);
