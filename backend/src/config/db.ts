import mongoose from "mongoose"

const connectDB = async():Promise<void>=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI as string)
        console.log(`MONGODB connected: ${conn.connection.host}`)
    }catch(error){
        console.error(`Error : ${(error as Error).message}`)
        process.exit(1)
    }
}