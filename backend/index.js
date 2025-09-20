import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import JWTauth from './middleware/auth.js';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';
import orderRouter from './routers/orderRouter.js';
import trainingRouter from './routers/trainingRoutes.js';
import farmSupplyRouter from './routers/farmSupplyRouter.js';
import reportRouter from './routers/reportRoutes.js';
import paymentRouter from './routers/paymentRouter.js';
import recipeRouter from './routers/RecipeRoute.js';
import notificationRouter from "./routers/NotificationRoute.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use(JWTauth);

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);
app.use("/api/training", trainingRouter);
app.use("/api/farmsupplies", farmSupplyRouter);
app.use("/api/reports", reportRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/recipes", recipeRouter);
app.use("/api/notifications", notificationRouter);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => console.log(err));

 