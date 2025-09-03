import { Document, model, Schema } from "mongoose";

export interface IReview extends Document{
    user:Schema.Types.ObjectId,
    product:Schema.Types.ObjectId,
    rating:number,
    comment:string
}

const reviewSchema = new Schema<IReview>(
    {
        user:{
            type:Schema.Types.ObjectId, 
            ref:"User",
            required:true
        },
        rating:{
            type:Number,
            required:true,
            min:1,
            max:5
        },
        comment:{
            type:String
        }
    },
    {timestamps:true}
)

export default model<IReview>("Review", reviewSchema)