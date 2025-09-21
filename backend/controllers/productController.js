import express from 'express';
import Product from '../models/product.js';
import validator from 'validator';
import User from '../models/user.js';
import JWTauth from '../middleware/auth.js';

// Save a new product

export async function saveProduct(req, res) {
  try {
    // Get user ID from authenticated user
    console.log("User ID: " + req.user?.id); 

    // Log the received data for debugging
    console.log('Received form data:', req.body);
    console.log('Received file:', req.file);

    // Validate required fields
    const { name, description, price, category, unit } = req.body;
    
    if (!name || !description || !price || !category || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, price, category, and unit are required'
      });
    }

    // Parse and structure stock data properly
    let stockData;
    
    // Check for individual stock fields in form data
    if (req.body['stock.current'] !== undefined) {
      // Handle individual stock fields from form data
      stockData = {
        current: parseFloat(req.body['stock.current']) || 0,
        maximum: parseFloat(req.body['stock.maximum']) || 100,
        minimum: parseFloat(req.body['stock.minimum']) || 5,
      };
      console.log('Using individual stock fields:', stockData);
    } else if (req.body.stock) {
      try {
        // Form data comes as strings, so we need to parse numbers
        if (typeof req.body.stock === 'string') {
          try {
            // Try to parse as JSON object
            const parsedStock = JSON.parse(req.body.stock);
            stockData = parsedStock;
            console.log('Parsed stock JSON:', stockData);
          } catch (jsonError) {
            // If not valid JSON, try as a number
            const stockValue = parseFloat(req.body.stock);
            if (!isNaN(stockValue)) {
              stockData = {
                current: stockValue,
                maximum: req.body.maxStock ? parseFloat(req.body.maxStock) : 100,
                minimum: req.body.minStock ? parseFloat(req.body.minStock) : 5,
              };
              console.log('Using stock as number:', stockData);
            } else {
              throw new Error('Stock is not valid JSON or number');
            }
          }
        } else if (typeof req.body.stock === 'object') {
          // If it's already an object, use it directly
          stockData = req.body.stock;
          console.log('Using stock as object:', stockData);
        } else {
          throw new Error('Unsupported stock data type');
        }
      } catch (error) {
        console.error('Error parsing stock data:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid stock data format'
        });
      }
    } else {
      // Default stock structure
      stockData = {
        current: 0,
        maximum: 100,
        minimum: 5
      };
    }

    // Parse tags if they come as JSON string
    let parsedTags = [];
    if (req.body.tags) {
      try {
        parsedTags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
      } catch (error) {
        console.warn('Failed to parse tags, using empty array:', error);
        parsedTags = [];
      }
    }

    // Parse images if they come as JSON string
    let parsedImages = [];
    if (req.body.images) {
      try {
        parsedImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
      } catch (error) {
        console.warn('Failed to parse images, using empty array:', error);
        parsedImages = [];
      }
    }

    // Create product data object
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      displayprice: req.body.displayprice ? parseFloat(req.body.displayprice) : parseFloat(price),
      category: category,
      stock: stockData,
      unit: unit,
      images: parsedImages,
      isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
      discount: req.body.discount ? parseFloat(req.body.discount) : 0,
      tags: parsedTags,
      createdBy: req.user?.id || null,
      shelfLife: req.body.shelfLife ? parseInt(req.body.shelfLife) : undefined,
      storageInstructions: req.body.storageInstructions || undefined
    };

    console.log('Creating product with data:', JSON.stringify(productData, null, 2));

    // Create product in database
    const product = await Product.create(productData);
    
    console.log('Product created successfully:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }

    // Handle other errors
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