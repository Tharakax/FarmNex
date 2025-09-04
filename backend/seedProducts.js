import mongoose from 'mongoose';
import Product from './models/product.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample products data
const sampleProducts = [
  {
    name: "Fresh Organic Tomatoes",
    description: "Premium quality organic tomatoes grown without pesticides. Perfect for salads, cooking, and sauces.",
    price: 120,
    displayprice: 150,
    category: "vegetables",
    stock: {
      current: 45,
      maximum: 100,
      minimum: 10,
      lastRestocked: new Date(),
      reservedStock: 0
    },
    unit: "kg",
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1546470427-e75e65e7a3c8?w=400",
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400"
    ],
    isFeatured: true,
    tags: ["organic", "fresh", "local", "pesticide-free"],
    shelfLife: 7,
    storageInstructions: "Store in a cool, dry place. Refrigerate after opening."
  },
  {
    name: "Fresh Bananas",
    description: "Sweet and ripe bananas, perfect for breakfast, smoothies, or healthy snacking.",
    price: 80,
    displayprice: 90,
    category: "fruits",
    stock: {
      current: 30,
      maximum: 80,
      minimum: 5,
      lastRestocked: new Date(),
      reservedStock: 0
    },
    unit: "kg",
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
      "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400"
    ],
    isFeatured: true,
    tags: ["fresh", "sweet", "healthy", "potassium"],
    shelfLife: 5,
    storageInstructions: "Store at room temperature. Keep away from direct sunlight."
  },
  {
    name: "Organic Spinach",
    description: "Fresh organic spinach leaves, rich in iron and vitamins. Great for salads and cooking.",
    price: 60,
    displayprice: 70,
    category: "leafy-greens",
    stock: {
      current: 25,
      maximum: 60,
      minimum: 8,
      lastRestocked: new Date(),
      reservedStock: 0
    },
    unit: "bunch",
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
      "https://images.unsplash.com/photo-1594282486618-80d8bffd6925?w=400"
    ],
    isFeatured: false,
    tags: ["organic", "iron-rich", "healthy", "fresh"],
    shelfLife: 3,
    storageInstructions: "Refrigerate immediately. Wash before use."
  },
  {
    name: "Fresh Carrots",
    description: "Crunchy and sweet organic carrots, perfect for cooking, juicing, or raw snacking.",
    price: 40,
    displayprice: 50,
    category: "root-vegetables",
    stock: {
      current: 35,
      maximum: 70,
      minimum: 10,
      lastRestocked: new Date(),
      reservedStock: 0
    },
    unit: "kg",
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400",
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400"
    ],
    isFeatured: false,
    tags: ["organic", "beta-carotene", "crunchy", "fresh"],
    shelfLife: 14,
    storageInstructions: "Store in refrigerator. Keep in plastic bag to maintain moisture."
  },
  {
    name: "Fresh Strawberries",
    description: "Juicy and sweet strawberries, handpicked at peak ripeness. Perfect for desserts and smoothies.",
    price: 200,
    displayprice: 220,
    category: "berries",
    stock: {
      current: 20,
      maximum: 50,
      minimum: 5,
      lastRestocked: new Date(),
      reservedStock: 0
    },
    unit: "pack",
    discount: 5,
    images: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
      "https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=400"
    ],
    isFeatured: true,
    tags: ["sweet", "juicy", "vitamin-c", "fresh"],
    shelfLife: 4,
    storageInstructions: "Refrigerate immediately. Do not wash until ready to eat."
  },
  {
    name: "Farm Fresh Eggs",
    description: "Free-range eggs from happy hens. Rich in protein and perfect for any meal.",
    price: 120,
    displayprice: 140,
    category: "animal-products",
    stock: {
      current: 40,
      maximum: 80,
      minimum: 10,
      lastRestocked: new Date(),
      reservedStock: 0
    },
    unit: "pack",
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=400",
      "https://images.unsplash.com/photo-1569288052389-dac4e37c7b7c?w=400"
    ],
    isFeatured: false,
    tags: ["free-range", "protein", "fresh", "nutritious"],
    shelfLife: 21,
    storageInstructions: "Store in refrigerator. Keep in original carton."
  },
  {
    name: "Organic Milk",
    description: "Fresh organic milk from grass-fed cows. Rich in calcium and essential nutrients.",
    price: 80,
    displayprice: 90,
    category: "dairy-products",
    stock: {
      current: 15,
      maximum: 40,
      minimum: 5,
      lastRestocked: new Date(),
      reservedStock: 0
    },
    unit: "piece",
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400"
    ],
    isFeatured: false,
    tags: ["organic", "calcium", "fresh", "grass-fed"],
    shelfLife: 7,
    storageInstructions: "Keep refrigerated at all times. Shake well before use."
  },
  {
    name: "Premium Chicken Breast",
    description: "Fresh, tender chicken breast from free-range chickens. High in protein and perfect for healthy meals.",
    price: 250,
    displayprice: 280,
    category: "meats",
    stock: {
      current: 12,
      maximum: 30,
      minimum: 3,
      lastRestocked: new Date(),
      reservedStock: 0
    },
    unit: "kg",
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400",
      "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400"
    ],
    isFeatured: false,
    tags: ["free-range", "protein", "fresh", "lean"],
    shelfLife: 3,
    storageInstructions: "Keep frozen until ready to use. Thaw in refrigerator before cooking."
  }
];

// Connect to database and insert products
async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to database successfully!');
    
    // Clear existing products (optional)
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Existing products cleared.');
    
    // Insert sample products
    console.log('Inserting sample products...');
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`${insertedProducts.length} products inserted successfully!`);
    
    console.log('Sample products:');
    insertedProducts.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - LKR ${product.price}/${product.unit}`);
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

// Run the seeding function
seedDatabase();
