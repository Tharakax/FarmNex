import express from 'express';
import Product from '../models/product.js';
import validator from 'validator';
import UserMe from '../models/usermodel.js';
import JWTauth from '../middleware/auth.js';

// Save a new product

export async function saveProduct(req, res) {
  // Get user ID from authenticated user

   console.log("params "+  req.user.id); 


  

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
    createdBy: req.user.id || null, // Use authenticated user's ID
    shelfLife: req.body.shelfLife,
    storageInstructions: req.body.storageInstructions
  };

  // Create product in database
  const product = await Product.create(productData);
  console.log(productData.images);
    console.log(req.body.images);

  res.status(201).json({
    success: true,
    product
  });
};

export async function getAllProducts(req, res) {
  try {
    const products = await Product.find().populate('createdBy', 'firstName lastName email');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
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
    res.status(500).json({ message: 'Error fetching product', error: error.message });
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