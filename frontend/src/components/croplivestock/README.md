# Crop & Livestock Management Component

## Overview
The Crop & Livestock Management component provides a unified interface for farmers to manage their crops and livestock from within the Farmer Dashboard. This component integrates with existing crop and livestock management pages while providing quick overview and navigation capabilities.

## Features

### Dashboard Overview
- **Statistics Display**: Shows total crops, livestock types, active plans, and alerts
- **Performance Metrics**: Displays crop success rate, livestock health rate, and overall efficiency
- **Quick Actions**: Easy access to add new crops/livestock or view existing ones

### Integration Points
- **Navigation**: Direct links to dedicated crop and livestock management pages
- **Data Overview**: Recent crops and livestock status at a glance
- **Quick Actions**: Fast access to CRUD operations

## File Structure
```
components/croplivestock/
├── CropLivestockManagement.jsx  # Main dashboard component
├── index.js                     # Export definitions
└── README.md                    # This documentation
```

## Usage in Farmer Dashboard
The component is integrated into the Farmer Dashboard sidebar as "Crop & Livestock" and can be accessed by:
1. Clicking on the "Crop & Livestock" menu item in the sidebar
2. The component provides overview and navigation to detailed views

## Navigation Routes
- `/crops` - View all crops
- `/crops/add` - Add new crop plan
- `/crops/update/:id` - Update existing crop
- `/crops/delete/:id` - Delete crop plan
- `/livestock` - View all livestock
- `/livestock/add` - Add new livestock
- `/livestock/update/:id` - Update livestock info
- `/livestock/delete/:id` - Delete livestock record

## Props
The CropLivestockManagement component doesn't require any props and manages its own state internally.

## Dependencies
- React (hooks: useState, useEffect)
- react-router-dom (useNavigate)
- lucide-react (icons)
- react-hot-toast (notifications)

## Future Enhancements
- Real-time data updates
- Charts and graphs for trend analysis
- Weather integration for farming recommendations
- Mobile responsiveness improvements
- Export functionality for reports