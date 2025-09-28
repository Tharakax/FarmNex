/**
 * Sales Data Generator Utility
 * Generates realistic, time-based sales data that changes dynamically
 * Based on current date, seasonality, and business patterns
 */

export const PRODUCT_CATEGORIES = {
  vegetables: {
    name: 'Vegetables',
    seasonality: {
      spring: 1.2,
      summer: 1.4,
      autumn: 1.1,
      winter: 0.8
    },
    products: [
      'Organic Tomatoes',
      'Bell Peppers', 
      'Cucumbers',
      'Zucchini',
      'Broccoli',
      'Cauliflower',
      'Eggplant',
      'Onions',
      'Garlic'
    ]
  },
  fruits: {
    name: 'Fruits',
    seasonality: {
      spring: 0.9,
      summer: 1.6,
      autumn: 1.3,
      winter: 0.7
    },
    products: [
      'Fresh Strawberries',
      'Blueberries',
      'Apples',
      'Oranges',
      'Bananas',
      'Grapes',
      'Peaches',
      'Watermelon',
      'Pineapple'
    ]
  },
  'leafy-greens': {
    name: 'Leafy Greens',
    seasonality: {
      spring: 1.3,
      summer: 1.1,
      autumn: 1.2,
      winter: 1.0
    },
    products: [
      'Fresh Spinach',
      'Mixed Salad Greens',
      'Kale',
      'Lettuce',
      'Arugula',
      'Swiss Chard',
      'Bok Choy',
      'Collard Greens'
    ]
  },
  'root-vegetables': {
    name: 'Root Vegetables', 
    seasonality: {
      spring: 0.8,
      summer: 0.7,
      autumn: 1.4,
      winter: 1.3
    },
    products: [
      'Organic Carrots',
      'Potatoes',
      'Sweet Potatoes',
      'Beets',
      'Turnips',
      'Radishes',
      'Parsnips'
    ]
  },
  'dairy-products': {
    name: 'Dairy Products',
    seasonality: {
      spring: 1.0,
      summer: 0.9,
      autumn: 1.1,
      winter: 1.2
    },
    products: [
      'Fresh Goat Milk',
      'Farm Cheese',
      'Organic Butter',
      'Fresh Yogurt',
      'Cream',
      'Farm Eggs'
    ]
  },
  'animal-products': {
    name: 'Animal Products',
    seasonality: {
      spring: 1.0,
      summer: 0.8,
      autumn: 1.1,
      winter: 1.3
    },
    products: [
      'Free-Range Chicken',
      'Grass-Fed Beef',
      'Farm Pork',
      'Lamb',
      'Duck',
      'Turkey'
    ]
  }
};

/**
 * Get current season based on month
 */
export const getCurrentSeason = (date = new Date()) => {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

/**
 * Generate realistic price for product category
 */
const generatePrice = (category, productName) => {
  const basePrices = {
    vegetables: { min: 150, max: 450 },
    fruits: { min: 200, max: 800 },
    'leafy-greens': { min: 120, max: 350 },
    'root-vegetables': { min: 100, max: 300 },
    'dairy-products': { min: 300, max: 1200 },
    'animal-products': { min: 800, max: 2500 }
  };
  
  const range = basePrices[category] || { min: 150, max: 500 };
  return Math.floor(Math.random() * (range.max - range.min) + range.min);
};

/**
 * Generate sales data for a specific date range
 */
export const generateSalesData = (dateRange = 30, category = 'all', currentProducts = []) => {
  const now = new Date();
  const currentSeason = getCurrentSeason(now);
  const baseDate = new Date(now.getTime() - (dateRange * 24 * 60 * 60 * 1000));
  
  // Generate realistic base metrics with seasonal adjustments
  const seasonalMultiplier = category !== 'all' && PRODUCT_CATEGORIES[category] 
    ? PRODUCT_CATEGORIES[category].seasonality[currentSeason] 
    : 1.1;
  
  // Base revenue calculation with seasonal and weekly variations
  const baseRevenue = Math.floor((15000 + Math.random() * 25000) * dateRange / 30 * seasonalMultiplier);
  const weekendBoost = 1.3; // Weekends typically have higher sales
  const mondaySlump = 0.7;  // Mondays typically slower
  
  // Calculate growth rates based on season and market trends
  const getGrowthRate = () => {
    const baseGrowth = Math.random() * 25 - 5; // -5% to +20% base
    const seasonalBonus = currentSeason === 'summer' ? 5 : currentSeason === 'winter' ? -3 : 0;
    return Math.round((baseGrowth + seasonalBonus) * 10) / 10;
  };

  const totalRevenue = baseRevenue;
  const averageOrderValue = 285 + Math.floor(Math.random() * 200);
  const totalOrders = Math.floor(totalRevenue / averageOrderValue);
  
  // Generate top products based on current season and real products if available
  const topProducts = [];
  const categoriesToUse = category === 'all' 
    ? Object.keys(PRODUCT_CATEGORIES) 
    : [category];
  
  let productIndex = 0;
  for (const cat of categoriesToUse) {
    const catData = PRODUCT_CATEGORIES[cat];
    const productsInCategory = currentProducts.length > 0 
      ? currentProducts.filter(p => p.category === cat).slice(0, 2)
      : [];
    
    // Use real products if available, otherwise use mock products
    const productsToUse = productsInCategory.length > 0 
      ? productsInCategory.map(p => p.name)
      : catData.products.slice(0, Math.min(3, 5 - productIndex));
    
    for (const productName of productsToUse) {
      if (productIndex >= 5) break;
      
      const seasonalSaleMultiplier = catData.seasonality[currentSeason];
      const baseProductRevenue = Math.floor(
        (2000 + Math.random() * 8000) * seasonalSaleMultiplier * (dateRange / 30)
      );
      
      topProducts.push({
        name: productName,
        revenue: baseProductRevenue,
        orders: Math.floor(baseProductRevenue / (averageOrderValue * 0.7)),
        growth: getGrowthRate(),
        category: cat
      });
      
      productIndex++;
    }
  }
  
  // Sort by revenue and take top 5
  topProducts.sort((a, b) => b.revenue - a.revenue);
  topProducts.splice(5);

  // Generate daily sales data
  const dailySales = [];
  for (let i = 0; i < Math.min(dateRange, 7); i++) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    let dayMultiplier = 1;
    if (dayOfWeek === 0 || dayOfWeek === 6) dayMultiplier = weekendBoost; // Weekend
    if (dayOfWeek === 1) dayMultiplier = mondaySlump; // Monday
    
    const dailyRevenue = Math.floor(
      (totalRevenue / dateRange) * dayMultiplier * (0.8 + Math.random() * 0.4)
    );
    const dailyOrders = Math.floor(dailyRevenue / averageOrderValue);
    
    dailySales.unshift({
      date: date.toISOString().split('T')[0],
      revenue: dailyRevenue,
      orders: dailyOrders
    });
  }

  // Generate category sales data
  const categorySales = [];
  let totalCategoryRevenue = 0;
  
  for (const [catKey, catData] of Object.entries(PRODUCT_CATEGORIES)) {
    if (category !== 'all' && category !== catKey) continue;
    
    const categoryRevenue = Math.floor(
      totalRevenue * (0.1 + Math.random() * 0.4) * catData.seasonality[currentSeason]
    );
    totalCategoryRevenue += categoryRevenue;
    
    categorySales.push({
      category: catData.name,
      revenue: categoryRevenue
    });
  }
  
  // Normalize percentages
  categorySales.forEach(cat => {
    cat.percentage = totalCategoryRevenue > 0 
      ? Math.round((cat.revenue / totalCategoryRevenue) * 100 * 10) / 10
      : 0;
  });
  
  // Sort by revenue
  categorySales.sort((a, b) => b.revenue - a.revenue);

  // Generate customer metrics with realistic patterns
  const customerRetentionRate = 75 + Math.random() * 15; // 75-90%
  const newCustomerRate = Math.max(10, 25 - (customerRetentionRate - 75)); // Inverse relationship
  const totalCustomerBase = Math.floor(totalOrders * 0.7); // Some customers have multiple orders
  
  const customerMetrics = {
    newCustomers: Math.floor(totalCustomerBase * (newCustomerRate / 100)),
    returningCustomers: Math.floor(totalCustomerBase * (customerRetentionRate / 100)),
    customerRetentionRate: Math.round(customerRetentionRate * 10) / 10,
    averageCustomerValue: Math.floor(totalRevenue / totalCustomerBase)
  };

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    revenueChange: getGrowthRate(),
    ordersChange: getGrowthRate(),
    topProducts,
    dailySales,
    categorySales,
    customerMetrics,
    lastUpdated: now.toISOString(),
    dataGenerated: true,
    seasonalContext: {
      currentSeason,
      seasonalMultiplier,
      dateRange,
      category
    }
  };
};

/**
 * Generate historical sales trend data
 */
export const generateSalesTrend = (days = 30) => {
  const trend = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const dayOfWeek = date.getDay();
    const season = getCurrentSeason(date);
    
    // Weekend boost
    let dailyMultiplier = 1;
    if (dayOfWeek === 0 || dayOfWeek === 6) dailyMultiplier = 1.3;
    if (dayOfWeek === 1) dailyMultiplier = 0.7;
    
    // Seasonal adjustment
    const seasonalMultipliers = {
      spring: 1.1,
      summer: 1.3,
      autumn: 1.0,
      winter: 0.8
    };
    
    dailyMultiplier *= seasonalMultipliers[season];
    
    // Add some randomness and trend
    const trendFactor = 1 + ((days - i) / days) * 0.1; // Slight upward trend
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    const revenue = Math.floor(
      2500 * dailyMultiplier * trendFactor * randomFactor
    );
    const orders = Math.floor(revenue / (280 + Math.random() * 100));
    
    trend.push({
      date: date.toISOString().split('T')[0],
      revenue,
      orders,
      dayOfWeek,
      season
    });
  }
  
  return trend;
};

/**
 * Get realistic product performance data
 */
export const generateProductPerformance = (currentProducts = []) => {
  const currentSeason = getCurrentSeason();
  const performance = [];
  
  // Use real products if available
  const productsToAnalyze = currentProducts.length > 0 
    ? currentProducts.slice(0, 15) 
    : [];
  
  // Add mock products if we don't have enough real ones
  if (productsToAnalyze.length < 10) {
    const allMockProducts = Object.values(PRODUCT_CATEGORIES)
      .flatMap(cat => cat.products.map(name => ({ name, category: Object.keys(PRODUCT_CATEGORIES).find(key => PRODUCT_CATEGORIES[key] === cat) })));
    
    const additionalProducts = allMockProducts
      .slice(0, 10 - productsToAnalyze.length)
      .map(p => ({ name: p.name, category: p.category, price: generatePrice(p.category, p.name) }));
    
    productsToAnalyze.push(...additionalProducts);
  }
  
  productsToAnalyze.forEach(product => {
    const category = product.category || 'vegetables';
    const seasonalMultiplier = PRODUCT_CATEGORIES[category]?.seasonality[currentSeason] || 1;
    
    const revenue = Math.floor((1000 + Math.random() * 12000) * seasonalMultiplier);
    const unitsSold = Math.floor(revenue / (product.price || generatePrice(category, product.name)));
    
    performance.push({
      name: product.name,
      revenue,
      unitsSold,
      profitMargin: Math.round((20 + Math.random() * 30) * 10) / 10,
      rating: Math.round((3.5 + Math.random() * 1.3) * 10) / 10,
      reviews: Math.floor(Math.random() * 150) + 10,
      growth: Math.round((Math.random() * 40 - 10) * 10) / 10,
      category,
      seasonalPerformance: seasonalMultiplier
    });
  });
  
  return performance.sort((a, b) => b.revenue - a.revenue);
};

export default {
  generateSalesData,
  generateSalesTrend,
  generateProductPerformance,
  getCurrentSeason,
  PRODUCT_CATEGORIES
};
