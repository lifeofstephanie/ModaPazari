import {Router} from 'express'
import { protect } from '../middleware/auth'
import { initializePayment, verifyPayment } from '../controllers/payment.controller'

const router = Router()

router.post('/initiate', protect, initializePayment)
router.get('/verify/:transaction_id', verifyPayment)
// NOTE: the Paystack webhook is mounted in app.ts with express.raw() (before the
// global JSON parser) because signature verification needs the raw request body.

export default router