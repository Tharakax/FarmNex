/**
 * Transaction Simulation Utility
 * Creates realistic order/transaction data that represents actual sales patterns,
 * seasonal trends, and customer behavior patterns
 */

import { getCurrentSeason, PRODUCT_CATEGORIES } from './salesDataGenerator.js';

// Customer behavior patterns
const CUSTOMER_TYPES = {
  regular: {
    name: 'Regular Customer',
    frequency: 'weekly',
    averageOrderValue: 350,
    seasonalPreference: 1.0,
    loyaltyBonus: 1.1,
    probability: 0.6
  },
  premium: {
    name: 'Premium Customer',
    frequency: 'bi-weekly',
    averageOrderValue: 750,
    seasonalPreference: 1.2,
    loyaltyBonus: 1.3,
    probability: 0.2
  },
  occasional: {
    name: 'Occasional Customer',
    frequency: 'monthly',
    averageOrderValue: 180,
    seasonalPreference: 0.8,
    loyaltyBonus: 1.0,
    probability: 0.15
  },
  bulk: {
    name: 'Bulk Buyer',
    frequency: 'monthly',
    averageOrderValue: 1200,
    seasonalPreference: 0.9,
    loyaltyBonus: 1.2,
    probability: 0.05
  }
};

// Order timing patterns
const ORDER_PATTERNS = {
  hourly: {
    0: 0.1, 1: 0.05, 2: 0.02, 3: 0.02, 4: 0.02, 5: 0.03,
    6: 0.15, 7: 0.25, 8: 0.35, 9: 0.4, 10: 0.45, 11: 0.5,
    12: 0.6, 13: 0.55, 14: 0.45, 15: 0.4, 16: 0.45, 17: 0.6,
    18: 0.75, 19: 0.8, 20: 0.7, 21: 0.5, 22: 0.3, 23: 0.2
  },
  weekly: {
    0: 0.8,  // Sunday
    1: 0.6,  // Monday  
    2: 0.7,  // Tuesday
    3: 0.8,  // Wednesday
    4: 0.9,  // Thursday
    5: 1.2,  // Friday
    6: 1.4   // Saturday
  },
  monthly: {
    1: 1.1, 15: 1.3, 30: 0.9 // Beginning, middle, end of month
  }
};

// Payment methods with realistic distribution
const PAYMENT_METHODS = [
  { type: 'card', probability: 0.65, name: 'Credit/Debit Card' },
  { type: 'cash', probability: 0.25, name: 'Cash' },
  { type: 'digital', probability: 0.08, name: 'Digital Wallet' },
  { type: 'bank_transfer', probability: 0.02, name: 'Bank Transfer' }
];

// Order status flow
const ORDER_STATUSES = [
  { status: 'pending', probability: 0.1, duration: 2 },
  { status: 'confirmed', probability: 0.05, duration: 1 },
  { status: 'preparing', probability: 0.1, duration: 3 },
  { status: 'shipped', probability: 0.08, duration: 2 },
  { status: 'delivered', probability: 0.62, duration: 0 },
  { status: 'cancelled', probability: 0.03, duration: 0 },
  { status: 'returned', probability: 0.02, duration: 0 }
];

/**
 * Generate a realistic customer profile
 */
const generateCustomer = () => {
  const customerTypes = Object.entries(CUSTOMER_TYPES);
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const [type, config] of customerTypes) {
    cumulativeProbability += config.probability;
    if (random <= cumulativeProbability) {
      return {
        id: Math.floor(Math.random() * 10000) + 1000,
        type,
        name: generateCustomerName(),
        email: generateEmail(),
        phone: generatePhone(),
        address: generateAddress(),
        joinDate: generateJoinDate(),
        config
      };
    }
  }
  
  return {
    id: Math.floor(Math.random() * 10000) + 1000,
    type: 'regular',
    name: generateCustomerName(),
    config: CUSTOMER_TYPES.regular
  };
};

/**
 * Generate realistic customer names
 */
const generateCustomerName = () => {
  const firstNames = [
    'Amal', 'Kasun', 'Nimal', 'Saman', 'Ruwan', 'Chaminda', 'Dilshan', 'Mahinda',
    'Priyanka', 'Sanduni', 'Malika', 'Champika', 'Kumari', 'Anoma', 'Lakshika',
    'Tharindu', 'Asanka', 'Buddhika', 'Chathura', 'Dinesh', 'Gayan', 'Harsha'
  ];
  
  const lastNames = [
    'Silva', 'Perera', 'Fernando', 'Jayawardena', 'Rathnayake', 'Wijesinghe',
    'Bandara', 'Gunawardena', 'Rajapaksha', 'Wickramasinghe', 'Mendis', 'Cooray'
  ];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

/**
 * Generate email addresses
 */
const generateEmail = () => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'slt.lk', 'dialog.lk'];
  const customer = generateCustomerName().toLowerCase().replace(' ', '.');
  return `${customer}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

/**
 * Generate phone numbers (Sri Lankan format)
 */
const generatePhone = () => {
  const prefixes = ['071', '077', '076', '075', '078', '011'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}${number}`;
};

/**
 * Generate addresses
 */
const generateAddress = () => {
  const streets = ['Galle Road', 'Kandy Road', 'Colombo Road', 'Main Street', 'Temple Road'];
  const cities = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Matara', 'Kurunegala', 'Anuradhapura'];
  
  return {
    street: `${Math.floor(Math.random() * 999) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`,
    city: cities[Math.floor(Math.random() * cities.length)],
    district: cities[Math.floor(Math.random() * cities.length)] + ' District',
    postalCode: `${Math.floor(Math.random() * 90000) + 10000}`
  };
};

/**
 * Generate customer join dates
 */
const generateJoinDate = () => {
  const monthsAgo = Math.floor(Math.random() * 24); // 0-24 months ago
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return date.toISOString().split('T')[0];
};

/**
 * Generate realistic transaction data for a given time period
 */
export const generateTransactions = (days = 30, currentProducts = []) => {
  const transactions = [];
  const currentDate = new Date();
  const currentSeason = getCurrentSeason();
  
  // Calculate daily transaction volume based on seasonality
  const baseTransactionsPerDay = 15;
  const seasonalMultipliers = {
    spring: 1.1,
    summer: 1.4,
    autumn: 1.0,
    winter: 0.7
  };
  
  const dailyTransactionTarget = Math.floor(
    baseTransactionsPerDay * seasonalMultipliers[currentSeason]
  );
  
  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const transactionDate = new Date(currentDate);
    transactionDate.setDate(currentDate.getDate() - dayOffset);
    
    const dayOfWeek = transactionDate.getDay();
    const weeklyMultiplier = ORDER_PATTERNS.weekly[dayOfWeek];
    
    const dailyTransactions = Math.floor(
      dailyTransactionTarget * weeklyMultiplier * (0.7 + Math.random() * 0.6)
    );
    
    for (let i = 0; i < dailyTransactions; i++) {
      const customer = generateCustomer();
      const transaction = generateSingleTransaction(transactionDate, customer, currentProducts);
      transactions.push(transaction);
    }
  }
  
  return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Generate a single transaction
 */
const generateSingleTransaction = (date, customer, currentProducts) => {
  const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  // Generate realistic transaction time
  const hour = generateTransactionHour();
  const minute = Math.floor(Math.random() * 60);
  const transactionTime = new Date(date);
  transactionTime.setHours(hour, minute, 0, 0);
  
  // Generate order items based on customer type and seasonality
  const items = generateOrderItems(customer, currentProducts);
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15; // 15% tax
  const discount = calculateDiscount(subtotal, customer);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax - discount + shipping;
  
  // Generate payment method
  const paymentMethod = generatePaymentMethod();
  
  // Generate order status
  const status = generateOrderStatus();
  
  return {
    id: transactionId,
    timestamp: transactionTime.toISOString(),
    date: date.toISOString().split('T')[0],
    customer: {
      id: customer.id,
      name: customer.name,
      type: customer.type,
      email: customer.email,
      phone: customer.phone
    },
    items,
    pricing: {
      subtotal: Math.round(subtotal),
      tax: Math.round(tax),
      discount: Math.round(discount),
      shipping: Math.round(shipping),
      total: Math.round(total)
    },
    payment: paymentMethod,
    status: status.status,
    notes: generateOrderNotes(customer, items),
    delivery: {
      address: customer.address,
      estimatedDate: calculateDeliveryDate(transactionTime, status),
      method: generateDeliveryMethod()
    }
  };
};

/**
 * Generate transaction hour based on realistic patterns
 */
const generateTransactionHour = () => {
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const [hour, probability] of Object.entries(ORDER_PATTERNS.hourly)) {
    cumulativeProbability += probability / 10; // Normalize
    if (random <= cumulativeProbability) {
      return parseInt(hour);
    }
  }
  
  return Math.floor(Math.random() * 24); // Fallback
};

/**
 * Generate order items for a transaction
 */
const generateOrderItems = (customer, currentProducts) => {
  const items = [];
  const itemCount = Math.floor(Math.random() * 5) + 1; // 1-5 items per order
  
  const availableProducts = currentProducts.length > 0 
    ? currentProducts 
    : generateMockProducts();
  
  const selectedProducts = [];
  for (let i = 0; i < Math.min(itemCount, availableProducts.length); i++) {
    let product;
    do {
      product = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    } while (selectedProducts.find(p => p.id === product.id));
    
    selectedProducts.push(product);
    
    const baseQuantity = Math.floor(Math.random() * 3) + 1; // 1-3 base quantity
    const customerMultiplier = customer.config.averageOrderValue > 500 ? 2 : 1;
    const quantity = baseQuantity * customerMultiplier;
    
    items.push({
      productId: product.id || `PROD${Math.floor(Math.random() * 1000)}`,
      name: product.name,
      category: product.category || 'vegetables',
      price: product.price || Math.floor(Math.random() * 500) + 100,
      quantity,
      unit: product.unit || 'kg',
      organic: product.organic || Math.random() > 0.6,
      farmSource: generateFarmSource()
    });
  }
  
  return items;
};

/**
 * Generate mock products if real products not available
 */
const generateMockProducts = () => {
  const mockProducts = [];
  
  Object.entries(PRODUCT_CATEGORIES).forEach(([category, categoryData]) => {
    categoryData.products.forEach((productName, index) => {
      mockProducts.push({
        id: `${category}_${index}`,
        name: productName,
        category,
        price: Math.floor(Math.random() * 400) + 100,
        unit: category === 'dairy-products' || category === 'animal-products' ? 'piece' : 'kg',
        organic: Math.random() > 0.4
      });
    });
  });
  
  return mockProducts;
};

/**
 * Calculate discount based on customer type and order value
 */
const calculateDiscount = (subtotal, customer) => {
  let discount = 0;
  
  // Customer type discount
  if (customer.type === 'premium') {
    discount += subtotal * 0.1; // 10% premium customer discount
  } else if (customer.type === 'bulk') {
    discount += subtotal * 0.15; // 15% bulk buyer discount
  }
  
  // Volume discount
  if (subtotal > 2000) {
    discount += subtotal * 0.05; // 5% discount for orders over LKR 2000
  }
  
  return Math.min(discount, subtotal * 0.25); // Maximum 25% discount
};

/**
 * Calculate shipping cost
 */
const calculateShipping = (subtotal) => {
  if (subtotal > 1500) return 0; // Free shipping over LKR 1500
  if (subtotal > 750) return 150; // Reduced shipping
  return 300; // Standard shipping
};

/**
 * Generate payment method
 */
const generatePaymentMethod = () => {
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const method of PAYMENT_METHODS) {
    cumulativeProbability += method.probability;
    if (random <= cumulativeProbability) {
      return {
        type: method.type,
        name: method.name,
        transactionId: `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: 'completed'
      };
    }
  }
  
  return PAYMENT_METHODS[0];
};

/**
 * Generate order status
 */
const generateOrderStatus = () => {
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const status of ORDER_STATUSES) {
    cumulativeProbability += status.probability;
    if (random <= cumulativeProbability) {
      return status;
    }
  }
  
  return ORDER_STATUSES[4]; // Default to delivered
};

/**
 * Generate order notes
 */
const generateOrderNotes = (customer, items) => {
  const notes = [];
  
  if (customer.type === 'premium') {
    notes.push('Premium customer - priority handling');
  }
  
  if (items.some(item => item.organic)) {
    notes.push('Contains organic products');
  }
  
  if (items.length > 3) {
    notes.push('Large order - handle with care');
  }
  
  const randomNotes = [
    'Customer requested fresh selection',
    'Delivery between 9 AM - 12 PM preferred',
    'Leave at gate if no answer',
    'Regular customer',
    'First time buyer'
  ];
  
  if (Math.random() > 0.7) {
    notes.push(randomNotes[Math.floor(Math.random() * randomNotes.length)]);
  }
  
  return notes;
};

/**
 * Calculate delivery date
 */
const calculateDeliveryDate = (orderDate, status) => {
  const deliveryDate = new Date(orderDate);
  const daysToAdd = status.duration + Math.floor(Math.random() * 2); // Add some variation
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  return deliveryDate.toISOString().split('T')[0];
};

/**
 * Generate delivery method
 */
const generateDeliveryMethod = () => {
  const methods = [
    { name: 'Standard Delivery', code: 'STD', duration: '2-3 days', cost: 300 },
    { name: 'Express Delivery', code: 'EXP', duration: '1 day', cost: 600 },
    { name: 'Pickup', code: 'PU', duration: 'Same day', cost: 0 },
    { name: 'Scheduled Delivery', code: 'SCH', duration: 'Customer choice', cost: 200 }
  ];
  
  return methods[Math.floor(Math.random() * methods.length)];
};

/**
 * Generate farm source information
 */
const generateFarmSource = () => {
  const farms = [
    'Green Valley Organic Farm',
    'Sunshine Agriculture',
    'Fresh Fields Farm', 
    'Eco Paradise Gardens',
    'Natural Harvest Co.',
    'Pure Earth Organics',
    'Golden Fields Farm'
  ];
  
  return farms[Math.floor(Math.random() * farms.length)];
};

/**
 * Generate analytics from transactions
 */
export const analyzeTransactions = (transactions) => {
  const analysis = {
    totalTransactions: transactions.length,
    totalRevenue: 0,
    averageOrderValue: 0,
    customerTypes: {},
    paymentMethods: {},
    topProducts: {},
    hourlyPattern: new Array(24).fill(0),
    dailyPattern: new Array(7).fill(0),
    statusDistribution: {},
    deliveryMethods: {}
  };
  
  transactions.forEach(transaction => {
    // Revenue
    analysis.totalRevenue += transaction.pricing.total;
    
    // Customer types
    const customerType = transaction.customer.type;
    analysis.customerTypes[customerType] = (analysis.customerTypes[customerType] || 0) + 1;
    
    // Payment methods
    const paymentType = transaction.payment.type;
    analysis.paymentMethods[paymentType] = (analysis.paymentMethods[paymentType] || 0) + 1;
    
    // Products
    transaction.items.forEach(item => {
      if (!analysis.topProducts[item.name]) {
        analysis.topProducts[item.name] = { count: 0, revenue: 0 };
      }
      analysis.topProducts[item.name].count += item.quantity;
      analysis.topProducts[item.name].revenue += item.price * item.quantity;
    });
    
    // Time patterns
    const hour = new Date(transaction.timestamp).getHours();
    const day = new Date(transaction.timestamp).getDay();
    analysis.hourlyPattern[hour]++;
    analysis.dailyPattern[day]++;
    
    // Status distribution
    analysis.statusDistribution[transaction.status] = (analysis.statusDistribution[transaction.status] || 0) + 1;
    
    // Delivery methods
    const deliveryMethod = transaction.delivery.method.code;
    analysis.deliveryMethods[deliveryMethod] = (analysis.deliveryMethods[deliveryMethod] || 0) + 1;
  });
  
  analysis.averageOrderValue = analysis.totalRevenue / Math.max(1, analysis.totalTransactions);
  
  return analysis;
};

export default {
  generateTransactions,
  analyzeTransactions,
  generateCustomer,
  CUSTOMER_TYPES,
  ORDER_PATTERNS,
  PAYMENT_METHODS,
  ORDER_STATUSES
};