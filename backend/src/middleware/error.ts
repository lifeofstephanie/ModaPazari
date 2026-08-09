import { NextFunction, Request, Response } from "express"

export const notFound = (req:Request, res:Response, next:NextFunction)=>{
    const error = new Error(`Not Found  - ${req.originalUrl}`)
    res.status(404)
    next(error)
}
export const errorHandler = (err:any, req:Request , res:Response, next:NextFunction)=>{
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode
    let message = err.message

    // Malformed ObjectId (e.g. /products/not-an-id) — a client error, not a 500.
    if (err?.name === "CastError") {
        statusCode = 400
        message = `Invalid ${err.path}`
    }
    // Mongoose schema validation failure.
    if (err?.name === "ValidationError") {
        statusCode = 400
    }

    res.status(statusCode).json({
        message,
        stack:process.env.NODE_ENV === 'production'?null:err.stack
    })
}