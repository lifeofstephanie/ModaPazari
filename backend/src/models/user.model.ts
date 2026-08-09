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
    creditLimit:number;
    availableBalance:number;
    // Vendor onboarding gate — only "approved" vendors can list/sell.
    vendorStatus:'pending'|'approved'|'rejected';
    emailVerified:boolean;
    // Password reset (hashed token + expiry).
    resetPasswordToken?:string;
    resetPasswordExpires?:Date;
    // Email verification token (hashed).
    emailVerifyToken?:string;
    // Paystack subaccount code for split payouts, plus the bank details used.
    paystackSubaccount?:string;
    bankName?:string;
    bankCode?:string;
    accountNumber?:string;
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
        },
        creditLimit:{
            type:Number,
            default:0
        },
        availableBalance:{
            type:Number,
            default:0
        },
        vendorStatus:{
            type:String,
            enum:['pending','approved','rejected'],
            default:'pending'
        },
        emailVerified:{
            type:Boolean,
            default:false
        },
        resetPasswordToken:{ type:String },
        resetPasswordExpires:{ type:Date },
        emailVerifyToken:{ type:String },
        paystackSubaccount:{ type:String },
        bankName:{ type:String },
        bankCode:{ type:String },
        accountNumber:{ type:String }
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