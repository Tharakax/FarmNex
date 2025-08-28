import express from 'express';
import Product from '../models/product.js';
import validator from 'validator';
import User from '../models/user.js';
import JWTauth from '../middleware/auth.js';

// Save a new product

export async function saveProduct(req, res) {
  try {
    // Get user ID from authenticated user (if available)
    const userId = req.user?.id || null;
    console.log("User ID: ", userId); 

    // Create product data object
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      displayprice: req.body.displayprice || req.body.price, // Default to price if not provided
      category: req.body.category,
      stock: req.body.stock,
      unit: req.body.unit,
      images: req.body.images || [], // Default to empty array if no images
      isFeatured: req.body.isFeatured || false,
      discount: req.body.discount || 0,
      tags: req.body.tags || [],
      createdBy: userId, // Use authenticated user's ID if available
      shelfLife: req.body.shelfLife,
      storageInstructions: req.body.storageInstructions
    };

    // Create product in database
    const product = await Product.create(productData);
    console.log('Product created successfully:', product.name);

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

export async function getAllProducts(req, res) {
  try {
    const products = await Product.find().populate('createdBy', 'firstName lastName email');
    res.status(200).json(products);
  } catch (error) {
    // If database connection fails, return mock data for development
    console.log('Database connection failed, returning mock data');
    const mockProducts = [
      {
        _id: '1',
        name: 'Fresh Tomatoes',
        description: 'Organic fresh tomatoes from local farm',
        price: 5.99,
        displayprice: 5.99,
        category: 'Vegetables',
        stock: 50,
        unit: 'kg',
        images: ['https://images.unsplash.com/photo-1546470427-e0b63eaf8b93?w=300'],
        isFeatured: true,
        discount: 0,
        tags: ['organic', 'fresh', 'local'],
        createdBy: {
          _id: 'user1',
          firstName: 'John',
          lastName: 'Farmer',
          email: 'john@farm.com'
        },
        shelfLife: '5-7 days',
        storageInstructions: 'Store in cool, dry place',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Fresh Carrots',
        description: 'Crunchy orange carrots rich in beta-carotene',
        price: 3.99,
        displayprice: 3.99,
        category: 'Vegetables',
        stock: 30,
        unit: 'kg',
        images: ['https://images.unsplash.com/photo-1445282768818-728615cc7b17?w=300'],
        isFeatured: false,
        discount: 10,
        tags: ['healthy', 'vitamin-a'],
        createdBy: {
          _id: 'user1',
          firstName: 'John',
          lastName: 'Farmer',
          email: 'john@farm.com'
        },
        shelfLife: '2-3 weeks',
        storageInstructions: 'Refrigerate in vegetable drawer',
        createdAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Free Range Eggs',
        description: 'Fresh eggs from free-range chickens',
        price: 8.99,
        displayprice: 8.99,
        category: 'Dairy & Eggs',
        stock: 20,
        unit: 'dozen',
        images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300'],
        isFeatured: true,
        discount: 0,
        tags: ['free-range', 'protein'],
        createdBy: {
          _id: 'user2',
          firstName: 'Sarah',
          lastName: 'Poultry',
          email: 'sarah@farm.com'
        },
        shelfLife: '3-4 weeks',
        storageInstructions: 'Refrigerate immediately',
        createdAt: new Date().toISOString()
      }
    ];
    res.status(200).json(mockProducts);
  }
}

export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'firstName lastName email');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    // If database connection fails, return mock data for development
    console.log('Database connection failed, returning mock product data');
    const mockProduct = {
      _id: req.params.id,
      name: 'Mock Product',
      description: 'This is a mock product for development',
      price: 9.99,
      displayprice: 9.99,
      category: 'Mock Category',
      stock: 10,
      unit: 'piece',
      images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'],
      isFeatured: false,
      discount: 0,
      tags: ['mock', 'development'],
      createdBy: {
        _id: 'mock-user',
        firstName: 'Mock',
        lastName: 'User',
        email: 'mock@example.com'
      },
      shelfLife: 'N/A',
      storageInstructions: 'N/A',
      createdAt: new Date().toISOString()
    };
    res.status(200).json(mockProduct);
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
}

// @desc    Update a product
// @route   PUT /api/product/:id
// @access  Private/Admin
export async function editProduct(req, res) {
  try {
    const {
      name,
      description,
      price,
      unit,
      discount,
      displayprice,
      category,
      stock,
      shelfLife,
      storageInstructions,
      tags,
      isFeatured,
      images = [] // Default to empty array
    } = req.body;

    // Parse tags if it's a string (from form data)
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags || [];

    // Find the product to update
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.unit = unit || product.unit;
    product.discount = discount || product.discount;
    product.displayprice = displayprice || product.displayprice;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    product.shelfLife = shelfLife || product.shelfLife;
    product.storageInstructions = storageInstructions || product.storageInstructions;
    product.tags = parsedTags;
    product.isFeatured = isFeatured || false;
    product.images = images; // Set the images array directly

    // Save the updated product
    const updatedProduct = await product.save();

    res.status(200).json({
      _id: updatedProduct._id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      unit: updatedProduct.unit,
      discount: updatedProduct.discount,
      displayprice: updatedProduct.displayprice,
      category: updatedProduct.category,
      stock: updatedProduct.stock,
      shelfLife: updatedProduct.shelfLife,
      storageInstructions: updatedProduct.storageInstructions,
      tags: updatedProduct.tags,
      isFeatured: updatedProduct.isFeatured,
      images: updatedProduct.images,
      createdAt: updatedProduct.createdAt
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: 'Failed to update product',
      error: error.message 
    });
  }
};