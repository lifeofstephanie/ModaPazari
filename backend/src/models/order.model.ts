import mongoose, { Document, Schema } from "mongoose";

export interface IShippingAddress {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
}

export interface IOrder extends Document{
    buyer:mongoose.Types.ObjectId;
    cart?:mongoose.Types.ObjectId;
    orderItems:{
        product:mongoose.Types.ObjectId;
        // Snapshot of the product name at purchase time so historical orders
        // don't mutate when the product is later renamed or deleted. Always set
        // by the checkout flow; optional for the legacy credit/promo flows.
        name?:string;
        quantity:number;
        price:number;
    }[];
    shippingAddress?:IShippingAddress;
    totalPrice:number;
    status:"pending"|"paid"|"shipped"|"delivered"|"cancelled";
    paymentReference?:string;
    // Client-supplied key that makes order creation idempotent (a double-click
    // or retried request returns the same order instead of creating a second).
    idempotencyKey?:string;
}

const shippingAddressSchema = new Schema<IShippingAddress>(
    {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        addressLine1: { type: String, required: true, trim: true },
        addressLine2: { type: String, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true, default: "Nigeria" },
        postalCode: { type: String, trim: true },
    },
    { _id: false }
);

const orderSchema = new Schema<IOrder>(
    {
        buyer:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        cart:{
            type:Schema.Types.ObjectId,
            ref:"Cart"
        },
        orderItems:[
            {
                product:{
                    type:Schema.Types.ObjectId,
                    ref:"Product",
                    required:true
                },
                // Enforced by the checkout service; optional here so the legacy
                // credit/promo order flows keep working.
                name:{
                    type:String
                },
                quantity:{
                    type:Number,
                    required:true
                },
                price:{
                    type:Number,
                    required:true
                },
            }
        ],
        // Required for the pay-now checkout flow (validated in order.service);
        // left optional at the schema level for the legacy flows.
        shippingAddress:{
            type:shippingAddressSchema
        },
        totalPrice:{
            type:Number,
            required:true
        },
        status:{
            type:String,
            enum:["pending","paid","shipped","delivered","cancelled"],
            default:"pending"
        },
        // Paystack transaction reference, set at initialise time and used by the
        // Paystack webhook to look up the order idempotently.
        paymentReference:{
            type:String,
            index:true,
            sparse:true
        },
        idempotencyKey:{
            type:String
        }
    },
    {timestamps:true}
)

// Makes checkout idempotent per buyer: the same key can't create two orders.
// Partial index so orders created without a key (e.g. the credit flow) are exempt.
orderSchema.index(
    { buyer: 1, idempotencyKey: 1 },
    {
        unique: true,
        partialFilterExpression: { idempotencyKey: { $type: "string" } },
    }
)

const Order = mongoose.model<IOrder>("Order", orderSchema)
export default Order