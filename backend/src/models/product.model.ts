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

export default mongoose.model('Product', productSchema)