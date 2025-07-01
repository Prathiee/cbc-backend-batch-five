import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routs/productRouter.js';
import userRouter from './routs/userRouter.js';
import jwt from "jsonwebtoken";

const app = express();

app.use(bodyParser.json())

app.use((req,res,next)=>{
       const tokenString = req.header("Authorization")
       if(tokenString != null){
           const token = tokenString.replace("Bearer ", "")
           console.log(token)

           jwt.verify(token, "cbc-batch-five#@2025" ,
            (err,decoded)=>{
                if(decoded != null){
                   req.user = decoded
                   next()
                }else{
                    console.log("Invalid Token")
                    res.status(403).json({
                        message : "Invalid Token"
                    })
                }
            }
           )
       }else{
        next()
       }
       
       //next()
})

mongoose.connect("mongodb+srv://Admin:123@cluster0.wxlx2pv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(()=>{
    console.log("Connected to the Database")
}).catch((e)=>{
   console.log(e)
    console.log("Database connection failed")
})


app.use("/products", productRouter)
app.use("/users", userRouter)

//mongodb+srv://Admin:123@cluster0.sijs1es.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
app.listen(3000, () => {
    console.log('Server is running on port 3000');
    }
);