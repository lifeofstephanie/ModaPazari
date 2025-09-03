import { Request, Response } from "express";
import Cart from "../models/cart.model";

export const addToCart = async (req:Request, res:Response)=>{
    const{productId, quantity} = req.body

    const cart = await Cart.findOne({user: req.user!.id})

    if(cart){
        const item = cart.items.find((i)=>i.product.toString() === productId)
        if(item){
            item.quantity += quantity
        }else{
            cart.items.push({product:productId, quantity})
        }
        await cart.save()
        return res.json(cart)
    }else{
        const newCart = await Cart.create({
            user:req.user!.id,
            items:[{product:productId, quantity}],
        })
        return res.status(201).json(newCart)
    }
}

export const getCart = async(req:Request, res:Response)=>{
    const cart = await Cart.findOne({user:req.user!.id})

    if(!cart){
        return res.status(404).json({message:"Cart not found"})
    }
}

export const removeFromCart = async(req:Request, res:Response)=>{
    const{productId} = req.params
    const cart = await Cart.findOneAndUpdate(
        {user:req.user!.id},
        {items:[]}
    )
    res.json({message:"Cart Cleared"})
}