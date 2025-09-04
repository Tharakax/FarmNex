# Stock Display Privacy Implementation

This document explains how to properly use the stock display components to hide sensitive business information from customers while keeping it visible for farmers and admins.

## Components Overview

### 1. StockDisplay Component
- **Purpose**: Shows stock information with different levels of detail
- **New Props**: 
  - `publicView`: When `true`, hides sensitive information like exact quantities, min/max levels, last restocked dates
  - `showDetailedView`: When `true`, shows full stock monitoring dashboard
  - Existing props: `stock`, `unit`

### 2. ProductCard Component (Updated)
- **Purpose**: Admin/farmer product management cards
- **New Props**:
  - `isPublicView`: When `true`, hides admin actions and sensitive stock quantities
  - Existing props: `product`, `onEdit`, `onDelete`, `onView`

### 3. CustomerProductCard Component (New)
- **Purpose**: Customer-facing product cards for shopping
- **Features**: 
  - Always uses public stock display
  - Hides all sensitive business information
  - Includes shopping features (quantity selector, add to cart)
  - Shows only availability status, not exact quantities

## Usage Examples

### For Customer-Facing Pages (e.g., marketplace, shop)

```jsx
import CustomerProductCard from '../components/products/CustomerProductCard';

// In your marketplace/shop page
<CustomerProductCard
  product={product}
  onAddToCart={(product, quantity) => addToCart(product, quantity)}
  onToggleFavorite={(product) => toggleFavorite(product)}
  isFavorite={favorites.includes(product.id)}
/>
```

### For Admin/Farmer Management Pages

```jsx
import ProductCard from '../components/products/ProductCard';
import StockDisplay from '../components/StockDisplay';

// In admin product management pages
<ProductCard
  product={product}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
  isPublicView={false} // Shows all admin features
/>

// For detailed stock monitoring
<StockDisplay
  stock={product.stock}
  unit={product.unit}
  showDetailedView={true}
  publicView={false} // Shows all stock details
/>
```

### For Product Detail Pages (Context-Dependent)

```jsx
// Customer viewing product details
<StockDisplay
  stock={product.stock}
  unit={product.unit}
  showDetailedView={true}
  publicView={true} // Only shows availability status
/>

// Admin/farmer viewing product details
<StockDisplay
  stock={product.stock}
  unit={product.unit}
  showDetailedView={true}
  publicView={false} // Shows full stock monitoring
/>
```

## What Information is Hidden/Shown

### Public View (Customer-Facing)
**Shown:**
- Availability status (In Stock, Low Stock, Out of Stock)
- Customer-friendly messages ("Limited quantities available")
- Basic product information (name, price, description)

**Hidden:**
- Exact stock quantities (e.g., "23 units")
- Minimum/maximum stock levels
- Last restocked dates
- Stock monitoring charts and detailed analytics
- Admin actions (edit, delete buttons)
- Internal stock management details

### Private View (Admin/Farmer)
**Shown:**
- All stock details and quantities
- Stock monitoring dashboard
- Progress bars with min/max indicators
- Last restocked dates
- Admin management controls
- Detailed analytics and reporting

## Benefits

1. **Privacy Protection**: Sensitive business information is not exposed to customers
2. **Better UX**: Customers see relevant availability information without overwhelming details
3. **Business Security**: Competitors cannot analyze your stock levels and inventory patterns
4. **Flexible Implementation**: Same components work for both public and private contexts
5. **Maintains Functionality**: Full admin features remain available for authorized users

## Implementation Notes

- Always set `publicView={true}` for customer-facing components
- Use `CustomerProductCard` for marketplace/shopping interfaces
- Use standard `ProductCard` with `isPublicView={false}` for admin interfaces
- The `publicView` prop takes precedence over detailed information display
- Stock status messages are customer-friendly in public view
