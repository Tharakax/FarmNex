import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import JWTauth from './middleware/auth.js';

dotenv.config();

import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';
import orderRouter from './routers/orderRouter.js';
import trainingRouter from './routers/trainingRoutes.js';
import farmSupplyRouter from './routers/farmSupplyRouter.js';
import reportRouter from './routers/reportRoutes.js';
import paymentRouter from './routers/paymentRouter.js';
import cropRoutes from './routers/cropRoutes.js';
import livestockRoutes from './routers/livestockRoutes.js';

const app = express();

// Database
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected"))
  .catch(() => console.log("Database connection failed"));

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use(JWTauth);

// Routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);
app.use("/api/training", trainingRouter);
app.use("/api/farmsupplies", farmSupplyRouter);
app.use("/api/reports", reportRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/crop", cropRoutes);
app.use("/api/livestock", livestockRoutes);

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
