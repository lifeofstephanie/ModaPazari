import {  Request, Response } from "express";
import Product from "../models/product.model";
import { AuthRequest } from "../middleware/auth";
import Order from "../models/order.model";

export const createProduct = async (req: AuthRequest, res: Response) =>{
  const product = await Product.create({...req.body, vendor:req.user?._id})
  res.status(201).json(product)
}

export const updateProduct = async(req:AuthRequest, res:Response)=>{
  const product = await Product.findOneAndUpdate({_id:req.params._id, vendor:req.user?._id},
    req.body,
    {new:true}
  )

  if(!product){
    return res.status(404).json({message:'product not found'})
  }
  res.json(product)
}

export const deleteProduct = async(req:AuthRequest, res:Response)=>{
  await Product.findOneAndDelete({_id:req.params._id, vendor:req.user?._id})
  res.json({message:'product deleted'})
}

export const getVendorProducts = async (req: Request, res: Response) => {
  const products = await Product.find({ vendor: (req as any).user._id });
  res.json(products);
};

export const getVendorOrders = async(req:AuthRequest, res:Response)=>{
  const orders = await Order.find({'products.vendor': req.user?._id})
  .populate('user')
  .populate('products.product')
  res.json(orders)
}
