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
import farmSupplyRouter from './routers/farmSupplyRouter.js';
import reportRouter from './routers/reportRoutes.js';
import paymentRouter from './routers/paymentRouter.js';
import soilRouter from './routers/soilRouter.js';

const app = express();

// Try connecting to MongoDB with fallback
const connectDB = async () => {
  const mongoUrls = [
    process.env.MONGO_URL,
    process.env.MONGODB_URI,
    'mongodb://localhost:27017/farmnex',
    'mongodb://127.0.0.1:27017/farmnex'
  ].filter(Boolean);

  for (const url of mongoUrls) {
    try {
      console.log(`Attempting to connect to: ${url.replace(/\/\/.*@/, '//**:**@')}`);
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000 // 5 second timeout
      });
      console.log(`✅ Database connected successfully to: ${url.split('@')[1] || url}`);
      return;
    } catch (error) {
      console.log(`❌ Failed to connect to: ${url.split('@')[1] || url}`);
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.error('❌ Could not connect to any MongoDB instance');
  console.log('💡 Tip: Install MongoDB locally or use MongoDB Atlas (cloud)');
  process.exit(1);
};

connectDB();
app.use(cors());
// Increased limits for large file uploads (videos, etc.)
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
// Serve static files before JWT auth to allow public access to uploads
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path, stat) => {
    // Set proper headers for video files
    if (path.endsWith('.mp4') || path.endsWith('.avi') || path.endsWith('.mov')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=0');
    }
  }
}));

// Public training routes (no authentication required)
import { getPublishedMaterials, getMaterialById } from './controllers/trainingController.js';
app.get('/api/training/published', getPublishedMaterials);
app.get('/api/training/published/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const material = await (await import('./models/TrainingMaterial.js')).default
      .findOne({ _id: id, status: 'published', isActive: true })
      .exec();
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Training material not found or not published'
      });
    }
    
    // Increment view count
    await (await import('./models/TrainingMaterial.js')).default
      .findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    res.json({
      success: true,
      material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Apply JWT auth for all other routes
app.use(JWTauth)

// Test route for video files
app.get('/test-video/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = `uploads/${filename}`;
  console.log('Testing video access:', filePath);
  
  // Check if file exists
  import('fs').then(fs => {
    if (fs.existsSync(filePath)) {
      res.json({ 
        success: true, 
        message: 'Video file exists',
        filename,
        url: `http://localhost:3000/uploads/${filename}`
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Video file not found',
        filename 
      });
    }
  });
});

app.use("/api/user", userRouter);
app.use("/api/product", productRouter)
app.use("/api/order", orderRouter)
app.use("/api/training", trainingRouter)
app.use("/api/farmsupplies", farmSupplyRouter)
app.use("/api/reports", reportRouter)
app.use("/api/payment", paymentRouter)
app.use("/api", soilRouter)



app.listen(3000,()=>{
    console.log("Server has started , running on port 3000");
})