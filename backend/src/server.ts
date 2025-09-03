import mongoose from 'mongoose'
import app from './app'

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI||"mongodb://localhost:27017/modapazari"

mongoose.connect(MONGO_URI)
.then(()=>{
    console.log(`connected`)

    app.listen(PORT, ()=>{
        console.log(`connected to ${PORT}`)
    })
})
.catch((err)=>console.error('error: ', err))
