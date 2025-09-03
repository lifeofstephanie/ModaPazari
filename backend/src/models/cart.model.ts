import { Document, model, Schema } from "mongoose";

interface ICartItem { 
    product:Schema.Types.ObjectId,
    quantity:number
}

export interface ICart extends Document{
    user:Schema.Types.ObjectId,
    items:ICartItem[]
}

const cartSchema = new Schema<ICart>(
    {
        user:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        items:[
            {
                product:{
                    type:Schema.Types.ObjectId,
                    ref:"Product",
                    required:true
                },
                quantity:{
                    type:Number,
                    default:1
                }
            }
        ]
    },
    {timestamps:true}
)

export default model<ICart>("Cart", cartSchema)