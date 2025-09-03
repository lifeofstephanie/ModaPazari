import { Request, Response } from "express";
import Review from '../models/review.model'

export const createReview = async (req:Request, res:Response)=>{
    const {productId} = req.params
    const {rating, comment} = req.body

    const review = await Review.create({
        user:req.user!.id,
        product:productId,
        rating,
        comment
    })

    res.status(201).json(review)
}

export const getProductReviews = async(req:Request, res:Response)=>{
    const {productId} = req.params
    const reviews = await Review.find({
        product: productId
    }).populate('user', 'firstName lastName')

    res.json(reviews)
}