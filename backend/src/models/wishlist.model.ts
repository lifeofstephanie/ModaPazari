import { Document, model, Schema } from "mongoose";

export interface IWishlist extends Document{
    user:Schema.Types.ObjectId,
    products:Schema.Types.ObjectId[]
}

const WishlistSchema = new Schema<IWishlist>(
    {
        user:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        products:[{
            type:Schema.Types.ObjectId,
            ref:"Product"
        }]
    },
    {timestamps:true}
)

export default model<IWishlist>("Wishlist", WishlistSchema)