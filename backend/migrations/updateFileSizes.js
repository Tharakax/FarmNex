import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import TrainingMaterial from '../models/TrainingMaterial.js';

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/farmnex', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Update file sizes for existing materials
const updateFileSizes = async () => {
  try {
    console.log('🔍 Finding materials with missing or zero file sizes...');
    
    // Find materials that have files but missing or zero file sizes
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
            { fileSize: 0 }
          ]
        }
      ]
    });

    console.log(`📁 Found ${materials.length} materials that need file size updates`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const material of materials) {
      try {
        let filePath = null;
        let fileExists = false;
        let fileSize = 0;

        // Try to find the actual file
        if (material.fileName) {
          filePath = path.join('uploads', material.fileName);
        } else if (material.uploadLink) {
          // Remove leading slash and 'uploads/' if present
          const cleanPath = material.uploadLink.replace(/^\/+/, '').replace(/^uploads\//, '');
          filePath = path.join('uploads', cleanPath);
        }

        if (filePath && fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          fileSize = stats.size;
          fileExists = true;
          console.log(`📄 Found file: ${filePath} (${(fileSize / 1024 / 1024).toFixed(2)}MB)`);
        } else {
          // File doesn't exist, set a reasonable default size based on type
          const defaultSizes = {
            'Video': 5 * 1024 * 1024,    // 5MB default
            'PDF': 2 * 1024 * 1024,      // 2MB default
            'Article': 1 * 1024 * 1024,  // 1MB default
            'Guide': 3 * 1024 * 1024,    // 3MB default
            'FAQ': 0.5 * 1024 * 1024     // 0.5MB default
          };
          fileSize = defaultSizes[material.type] || 1024 * 1024; // 1MB fallback
          console.log(`⚠️ File not found for ${material.title}, using estimated size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
        }

        // Update the material
        await TrainingMaterial.findByIdAndUpdate(material._id, {
          fileSize: fileSize,
          // Also ensure uploadLink is set properly if missing
          ...(material.fileName && !material.uploadLink && {
            uploadLink: `/uploads/${material.fileName}`
          })
        });

        console.log(`✅ Updated: ${material.title} (${fileExists ? 'actual' : 'estimated'} size: ${(fileSize / 1024 / 1024).toFixed(2)}MB)`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ Error updating ${material.title}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successfully updated: ${updatedCount} materials`);
    console.log(`❌ Errors: ${errorCount} materials`);
    console.log(`📁 Total processed: ${materials.length} materials`);

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
};

// Run the migration
const runMigration = async () => {
  console.log('🚀 Starting file size migration...');
  await connectDB();
  await updateFileSizes();
  
  console.log('✅ Migration completed!');
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error.message);
  process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;