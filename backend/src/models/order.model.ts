import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document{
    buyer:mongoose.Types.ObjectId;
    orderItems:{
        product:mongoose.Types.ObjectId;
        quantity:number;
        price:number;
    }[];
    totalPrice:number;
    status:"pending"|"paid"|"shipped"|"delivered";
}

const orderSchema = new Schema<IOrder>(
    {
        buyer:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        orderItems:[
            {
                product:{
                    type:Schema.Types.ObjectId,
                    ref:"Product",
                    required:true
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
        totalPrice:{
            type:Number,
            required:true
        },
        status:{
            type:String,
            enum:["pending","paid","shipped","delivered"],
            default:"pending"
        }
    },
    {timestamps:true}
)



const Order = mongoose.model<IOrder>("Order", orderSchema)
export default Order