import {Router} from 'express'
import { protect } from '../middleware/auth'
import { initializePayment, paystackWebhook, verifyPayment } from '../controllers/payment.controller'

const router = Router()

router.post('/initiate', protect, initializePayment)
router.get('/verify/:transaction_id', verifyPayment)
router.post('/webhook', paystackWebhook)

export default router