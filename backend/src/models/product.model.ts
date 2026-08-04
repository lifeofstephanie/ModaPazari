import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
    name:string;
    description:string;
    price:number;
    brand:mongoose.Types.ObjectId;
    category:mongoose.Types.ObjectId;
    stock:number;
    vendor:mongoose.Types.ObjectId;
    images:string[];
    status:'pending'|'approved'|'rejected'
}

const productSchema = new Schema<IProduct>(
    {
        name:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true,
            min:0
        },
        stock:{
            type:Number,
            required:true,
            min:0
        },
        images:[{type:String}],
        category:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Category'
        },
        brand:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Brand'
        },
        vendor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        status:{
            type:String,
            enum:['pending', 'approved','rejected'],
            default:'pending'
        }
    },
    {timestamps:true}
)

// Feed indexes: the compound (createdAt, _id) suffix serves both the DESC sort
// and the keyset predicate for GET /products/feed. The leading field matches the
// common filter so each is a single index scan.
productSchema.index({ status: 1, createdAt: -1, _id: -1 })
productSchema.index({ category: 1, createdAt: -1, _id: -1 })
// Vendor catalogue lookups (getVendorProducts / distinct vendor product ids).
productSchema.index({ vendor: 1 })

export default mongoose.model('Product', productSchema)