import mongoose, { Document, Schema } from "mongoose";

export interface IPromoCode extends Document {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    // Global cap on how many times this code may ever be redeemed.
    maxUses: number;
    usedCount: number;
    active: boolean;
    expiresAt?: Date;
}

const promoCodeSchema = new Schema<IPromoCode>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        maxUses: {
            type: Number,
            required: true,
            min: 0,
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        active: {
            type: Boolean,
            default: true,
        },
        expiresAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

const PromoCode = mongoose.model<IPromoCode>("PromoCode", promoCodeSchema);
export default PromoCode;
