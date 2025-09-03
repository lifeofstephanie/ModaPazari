import { Request, Response } from "express";
import axios from 'axios'
import crypto from 'crypto'
import Order from "../models/order.model";

const PAYSTACK_API = process.env.PAYSTACK_API

export const initializePayment = async(req:Request, res:Response)=>{
  try{
    const {amount, email} = req.body

    if(!amount || !email){
      return res.status(400).json({message:'Amount and email required'})
    }

    const response = await axios.post(`${PAYSTACK_API}/transaction/initialize`,
      {
        email,
        amount:amount*100
      },
      {
        headers:{
          Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type":"application/json"
        }
      }
    )

    return res.status(200).json(response.data)

  }catch(error:any){
    console.error("Initialize Payment Error: ", error.response?.data||error.message)
    res.status(500).json({message:'Payment initialization failed'})
  }
}

export const verifyPayment = async(req:Request, res:Response)=>{
  try{
    const {reference} = req.params
    const response = await axios.get(`${PAYSTACK_API}/transaction/verify/${reference}`,
      {
        headers:{
          Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    )
    return res.status(200).json(response.data)
  }catch(error:any){
    console.error("Verify Payment Error: ", error.response?.data||error.message)
    res.status(500).json({message:"Error Verifying Payment"})
  }
}

export const paystackWebhook = async (req:Request, res:Response)=>{
  try{
  const secret = process.env.PAYSTACK_SECRET_KEY as string

  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex')
  
    if(hash !== (req.headers['x-paystack-signature'] as string)){
      return res.status(401).json({message:'Invalid signature'})
    }

    const event = req.body.event

    if(event === 'charge.success'){
      const data = req.body.data

      await Order.findOneAndUpdate(
        {reference:data.reference},
        {status:'paid', paymentInfo:data}
      )
      console.log('Payment verified: ', data.reference)

      res.status(200).json({received:true})
    }
  }catch(error:any){
    res.status(500).json({message:'webhook error: ', error})
  }
}