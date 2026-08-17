import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routs/productRouter.js';
import userRouter from './routs/userRouter.js';
import jwt from "jsonwebtoken";
import orderRouter from './routs/orderRouter.js';
import recommendationRouter from "./routs/recommendationRouter.js";
import reviewRouter from "./routs/reviewRouter.js";
import contactRouter from "./routs/contactRouter.js";
import chatbotRouter from "./routs/chatbotRouter.js";
import ingredientRouter from "./routs/ingredientRouter.js";
import ollamaRouter from "./routs/ollamaRouter.js";
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors())
app.use(bodyParser.json())


app.use((req,res,next)=>{
       const tokenString = req.header("Authorization")
       if(tokenString != null){
           const token = tokenString.replace("Bearer ", "")
           console.log(token)

           jwt.verify(token, process.env.JWT_KEY ,
            (err,decoded)=>{
                if(decoded != null){

    console.log("Decoded JWT user:", decoded);

    req.user = decoded;
    next();

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

mongoose.connect(process.env.MONGODB_URL).then(()=>{
    console.log("Connected to the Database")
}).catch((e)=>{
   console.log(e)
    console.log("Database connection failed")
})


app.use("/products", productRouter)
app.use("/users", userRouter)
app.use("/orders", orderRouter)
app.use("/recommendation", recommendationRouter);
app.use("/reviews", reviewRouter);
app.use("/contacts", contactRouter);
app.use("/chatbot", chatbotRouter);
app.use("/ingredients", ingredientRouter);
app.use("/ollama", ollamaRouter);

//mongodb+srv://Admin:123@cluster0.sijs1es.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
app.listen(3000, () => {
    console.log('Server is running on port 3000');
    }
);