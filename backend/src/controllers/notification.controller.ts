import { Request, Response } from "express";
import Notification from '../models/notifications.model'
import { AuthRequest } from "../middleware/auth";

export const createNotification = async (req:Request, res:Response)=>{
    const {userId, message, type}= req.body
    const notification = await Notification.create({user:userId, message, type})
    res.status(201).json(notification)
}


export const getUserNotification = async(req:AuthRequest, res:Response) =>{
    const notifications = await Notification.find({user:req.user!.id}).sort({createdAt:-1})

    res.json(notifications)
}


export const markAsRead = async(req:Request, res:Response)=>{
    const {id} = req.params
    const notification = await Notification.findByIdAndUpdate(id, {read:true},{new:true})
    res.json(notification)
}