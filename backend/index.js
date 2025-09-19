import express from 'express';
import bodyParser from 'body-parser';

import mongoose from 'mongoose';
import JWTauth from './middleware/auth.js';
import dotenv from 'dotenv';
import cors from 'cors';

import path from "path";
import { fileURLToPath } from "url";
dotenv.config();



//import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';
import orderRouter from './routers/orderRouter.js';
import trainingRouter from './routers/trainingRoutes.js';
import farmSupplyRouter from './routers/farmSupplyRouter.js';
import reportRouter from './routers/reportRoutes.js';
import paymentRouter from './routers/paymentRouter.js';
import questionRoute from "./routers/questionRoute.js"; //umar
import userroute from "./routers/userroute.js";//umar
//umar
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//umar
// Middleware
app.use(express.json());
app.use(cors());
// Routes
app.use("/users", userroute);
app.use("/api/questions", questionRoute);
// Static folder for image uploads
app.use("/imageupload", express.static(path.join(__dirname, "imageupload")));



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

app.use("/api/product", productRouter)
app.use("/api/order", orderRouter)
app.use("/api/training", trainingRouter)
app.use("/api/farmsupplies", farmSupplyRouter)
app.use("/api/reports", reportRouter)
app.use("/api/payment", paymentRouter)



app.listen(3000,()=>{
    console.log("Server has started , running on port 3000");

})