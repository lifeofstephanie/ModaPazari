import mongoose, { Document, Schema } from  'mongoose'

export interface IBrand extends Document{
    brandName:string
}

const brandSchema = new Schema<IBrand>(
    {
        brandName:{
            type:String,
            required:true,
            trim:true
        }
    },
    {timestamps:true}
)

export default mongoose.model('Brand', brandSchema)