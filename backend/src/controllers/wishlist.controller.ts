import { Request, Response } from "express";
import Wishlist from "../models/wishlist.model";

export const addToWishList = async (req:Request, res:Response)=>{
    const{productId, quantity} = req.body

    let wishlist = await Wishlist.findOne({user: req.user!.id})
    if(!wishlist){
        wishlist = await Wishlist.create(
            {
                user:req.user!.id,
                products:[productId]
            }
        )
    }else{
        // Add only if not already present (fixes a dedup bug where `.some()`
        // returned truthy for any product and blocked further additions).
        const exists = wishlist.products.some((p)=>p.toString() === productId)
        if(!exists){
            wishlist.products.push(productId as any)
            await wishlist.save()
        }
    }
    await wishlist.populate('products')
    res.json(wishlist)
}

export const getWishlist = async( req:Request, res:Response)=>{
    const wishlist = await Wishlist.findOne({user:req.user!.id}).populate('products')
    res.json(wishlist)    
}

export const removeFromWishList = async (req:Request, res:Response)=> {
    const {productId} = req.params
    const wishlist = await Wishlist.findOne({user:req.user!.id})

    if(!wishlist){
        return res.status(404).json({message:"wishlist not found"})
    }

    wishlist.products = wishlist.products.filter((p)=>p.toString() !== productId)
    await wishlist.save()

    res.json(wishlist)
}