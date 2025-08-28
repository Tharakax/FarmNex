import express from 'express';
import bodyParser from 'body-parser';
import nodemon from 'nodemon';
import mongoose from 'mongoose';
import JWTauth from './middleware/auth.js';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';
import orderRouter from './routers/orderRouter.js';
import trainingRouter from './routers/trainingRoutes.js';
<<<<<<< HEAD
import farmSupplyRouter from './routers/farmSupplyRouter.js';
import reportRouter from './routers/reportRoutes.js';
=======
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5
const app = express();

mongoose.connect(process.env.MONGO_URL).then(
    ()=>{
        console.log("Database connected")
    }
).catch(
    ()=>{
        console.log("connection failed")
      
    }
)
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use(JWTauth)

app.use("/api/user", userRouter);
app.use("/api/product", productRouter)
app.use("/api/order", orderRouter)
app.use("/api/training", trainingRouter)
<<<<<<< HEAD
app.use("/api/farmsupplies", farmSupplyRouter)
app.use("/api/reports", reportRouter)
=======
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5


app.listen(3000,()=>{
    console.log("Server has started , running on port 3000");
})