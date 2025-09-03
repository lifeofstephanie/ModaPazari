import { Request, Response } from "express";
import User from "../models/user.model";
import Order from "../models/order.model";
import Product from "../models/product.model";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
};

export const deleteUsers = async(req:Request, res:Response)=>{
  await User.findByIdAndDelete(req.params.id)
  res.json({message:'User Deleted'})
}

export const getAllOrders = async(req:Request, res:Response)=>{
  const orders = await Order.find({}).populate("user products.product")
  res.json(orders)
}

export const manageProducts = async(req:Request, res:Response)=>{

  const{productId}=req.body

  const product = await Product.findById(productId)
  if(!product){
    return res.status(404).json({message:"Product not found"})
  }

  await product.save()
  res.json(product)
}