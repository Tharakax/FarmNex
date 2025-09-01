import FarmSupply from '../models/farmSupply.js';

// Get all farm supplies
export const getAllFarmSupplies = async (req, res) => {
  try {
    const supplies = await FarmSupply.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: supplies.length,
      data: supplies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single farm supply by ID
export const getFarmSupplyById = async (req, res) => {
  try {
    const supply = await FarmSupply.findById(req.params.id);
    
    if (!supply) {
      return res.status(404).json({
        success: false,
        message: 'Farm supply not found'
      });
    }

    res.status(200).json({
      success: true,
      data: supply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new farm supply
export const createFarmSupply = async (req, res) => {
  try {
    req.body.createdBy = req.user?.id; // If JWT auth provides user info
    const supply = await FarmSupply.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Farm supply created successfully',
      data: supply
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

// Update farm supply
export const updateFarmSupply = async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    
    const supply = await FarmSupply.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!supply) {
      return res.status(404).json({
        success: false,
        message: 'Farm supply not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Farm supply updated successfully',
      data: supply
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Update Error',
      error: error.message
    });
  }
};

// Delete farm supply
export const deleteFarmSupply = async (req, res) => {
  try {
    const supply = await FarmSupply.findById(req.params.id);

    if (!supply) {
      return res.status(404).json({
        success: false,
        message: 'Farm supply not found'
      });
    }

    // Soft delete - mark as inactive
    supply.isActive = false;
    await supply.save();

    res.status(200).json({
      success: true,
      message: 'Farm supply deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get low stock supplies
export const getLowStockSupplies = async (req, res) => {
  try {
    const lowStockSupplies = await FarmSupply.find({
      $expr: { $lte: ['$quantity', '$minQuantity'] },
      isActive: true
    }).sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      count: lowStockSupplies.length,
      data: lowStockSupplies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get supplies by category
export const getSuppliesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const supplies = await FarmSupply.find({ 
      category: category, 
      isActive: true 
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: supplies.length,
      data: supplies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
