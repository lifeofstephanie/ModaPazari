import mongoose, { Document, Schema } from "mongoose"
import bcrypt from 'bcryptjs'

export interface IUser extends Document{
    firstName:string;
    lastName:string;
    email:string;
    password:string;
    role:'admin'|'vendor'|'buyer';
    storeName:string;
    storeDescription:string;
    matchPassword(enteredPassword:string):Promise<boolean>
}

const userSchema = new Schema<IUser>(
    {
        firstName:{
            type:String,
            required:true,
            trim:true
        },
        lastName:{
            type:String,
            required:true,
            trim:true
        },
        password:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            unique:true
        },
        role:{
            type:String,
            enum:['buyer', 'vendor', 'admin'],
            default:'buyer'
        },
        storeName:{
            type:String
        }, 
        storeDescription:{
            type:String
        }
    },
    {timestamps:true}
)

userSchema.pre<IUser>("save", async function(next){
    if(!this.isModified("password"))
        return next()
    try{
        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(this.password, salt)
        this.password= hashed
        next()
    }catch(error){
        next(error as Error)
    }
}
)

userSchema.methods.matchPassword = async function (enteredPassword:string) {
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model<IUser>("User", userSchema)
export default User