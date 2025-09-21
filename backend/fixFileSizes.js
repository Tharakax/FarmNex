import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simple schema for the query
const trainingSchema = new mongoose.Schema({}, { strict: false });
const TrainingMaterial = mongoose.model('TrainingMaterial', trainingSchema);

async function fixFileSizes() {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/farmnex';
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find materials with zero or missing file sizes
    const materials = await TrainingMaterial.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { fileName: { $exists: true, $ne: null, $ne: '' } },
            { uploadLink: { $exists: true, $ne: null, $ne: '' } }
          ]
        },
        {
          $or: [
            { fileSize: { $exists: false } },
            { fileSize: null },
            { fileSize: 0 },
            { fileSize: { $lte: 0 } }
          ]
        }
      ]
    });

    console.log(`📁 Found ${materials.length} materials with missing file sizes`);

    let updated = 0;
    
    for (const material of materials) {
      // Set estimated file sizes based on content type
      let estimatedSize;
      switch (material.type) {
        case 'Video':
          estimatedSize = 15 * 1024 * 1024; // 15MB for videos
          break;
        case 'PDF':
          estimatedSize = 2 * 1024 * 1024; // 2MB for PDFs
          break;
        case 'Article':
          estimatedSize = 500 * 1024; // 500KB for articles
          break;
        case 'Guide':
          estimatedSize = 3 * 1024 * 1024; // 3MB for guides
          break;
        default:
          estimatedSize = 1 * 1024 * 1024; // 1MB default
      }

      // Update the material
      await TrainingMaterial.findByIdAndUpdate(material._id, {
        fileSize: estimatedSize
      });

      console.log(`✅ Updated "${material.title}" (${material.type}): ${(estimatedSize / 1024 / 1024).toFixed(1)}MB`);
      updated++;
    }

    console.log(`\n🎉 Successfully updated ${updated} materials with estimated file sizes!`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the fix
fixFileSizes();