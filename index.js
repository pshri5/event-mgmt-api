import app from "./app";
import dotenv from "dotenv"
import connectDB from "./src/db";

dotenv.config({
    path: "./env"
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running at port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("Mongodb connection error!",error)
})