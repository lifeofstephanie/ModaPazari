import { Document, model, Schema } from "mongoose";

export interface INotification extends Document{
    user:Schema.Types.ObjectId,
    message:string,
    type:"order"|"promo"|"system",
    read:boolean,
}

const notificationSchema = new Schema<INotification>({
        user:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        message:{
            type:String,
            require:true
        },
        type:{
            type:String,
            enum:["order", "promo", "system"],
            default:"system"
        },
        read:{
            type:Boolean,
            default:false
        },
    },
    {timestamps:true}
)

export default model<INotification>("Notification", notificationSchema)