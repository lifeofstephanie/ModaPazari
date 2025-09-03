import mongoose, { Document, Schema } from 'mongoose'

export interface ICategory extends Document{
    name:string
}

const categorySchema = new Schema<ICategory>(
    {
        name:{
            type:String,
            required:true,
            unique:true,
            trim:true
        }
    },
    {timestamps:true}
)

export default mongoose.model('Category', categorySchema)