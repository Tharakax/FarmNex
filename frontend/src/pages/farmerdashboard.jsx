import React, { useState, Suspense } from 'react';
import { getLoggedInUser, getRoleDisplayName } from '../utils/userUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SoilMoistureWidget from '../components/SoilMoistureWidget';
import WeatherWidget from '../components/WeatherWidget';
import WeatherDashboard from '../components/WeatherDashboard';
import { 
  Home, 
  Wheat, 
  Users, 
  Cloud, 
  TrendingUp,
  Package, 
  FileText, 
  Settings, 
  Bell, 
  LogOut, 
  User,
  Menu,
  ShoppingBag,
  Truck,
  BookOpen,
  X,
  AlertTriangle,
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Sample data
const cropYieldData = [
  { month: 'Jan', yield: 45 },
  { month: 'Feb', yield: 52 },
  { month: 'Mar', yield: 48 },
  { month: 'Apr', yield: 61 },
  { month: 'May', yield: 55 },
  { month: 'Jun', yield: 67 },
  { month: 'Jul', yield: 73 },
  { month: 'Aug', yield: 69 }
];

const recentActivities = [
  { id: 1, activity: 'Watered tomato crops in Sector A', date: '2024-08-07', time: '08:30' },
  { id: 2, activity: 'Fed livestock in Barn 2', date: '2024-08-07', time: '07:15' },
  { id: 3, activity: 'Harvested corn from Field 3', date: '2024-08-06', time: '16:45' },
  { id: 4, activity: 'Applied fertilizer to wheat field', date: '2024-08-06', time: '14:20' },
  { id: 5, activity: 'Veterinary checkup for cattle', date: '2024-08-05', time: '11:00' }
];

// Reusable Card Component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

// Import ErrorFallback
import ErrorFallback from '../components/common/ErrorFallback';

// Lazy load components with error handling
const ProductManagement = React.lazy(() => 
  import('../components/products/ProductManagement')
    .catch(error => {
      console.error('Failed to load ProductManagement:', error);
      return { default: () => <ErrorFallback error={error} componentName="Product Management" /> };
    })
);

const FarmerInventoryManagement = React.lazy(() => 
  import('../components/inventory/FarmerInventoryManagement')
    .catch(error => {
      console.error('Failed to load FarmerInventoryManagement:', error);
      return { default: () => <ErrorFallback error={error} componentName="Inventory Management" /> };
    })
);

const FarmerSuppliesManagement = React.lazy(() => 
  import('../components/supplies/FarmerSuppliesManagement')
    .catch(error => {
      console.error('Failed to load FarmerSuppliesManagement:', error);
      return { default: () => <ErrorFallback error={error} componentName="Supplies Management" /> };
    })
);

const ReportsManagement = React.lazy(() => 
  import('../components/reports/ReportsManagement')
    .catch(error => {
      console.error('Failed to load ReportsManagement:', error);
      return { default: () => <ErrorFallback error={error} componentName="Reports Management" /> };
    })
);

const ProductManagementReport = React.lazy(() => 
  import('../components/reports/ProductManagementReport')
    .catch(error => {
      console.error('Failed to load ProductManagementReport:', error);
      return { default: () => <ErrorFallback error={error} componentName="Product Report" /> };
    })
);

const TrainingManagementFull = React.lazy(() => 
  import('../components/training/legacy/TrainingManagementFull')
    .catch(error => {
      console.error('Failed to load TrainingManagementFull:', error);
      return { default: () => <ErrorFallback error={error} componentName="Training Management" /> };
    })
);

// Weather Dashboard component
const WeatherDashboardLazy = React.lazy(() => Promise.resolve({ default: WeatherDashboard }));

// Dashboard Stats Component
const DashboardStats = () => {
  const stats = [
    {
      title: 'Total Crop Yield',
      value: '1,247 tons',
      icon: Wheat,
      color: 'bg-green-500',
      change: '+12%'
    },
    {
      title: 'Livestock Count',
      value: '342',
      icon: Users,
      color: 'bg-blue-500',
      change: '+5%'
    },
    {
      title: 'Upcoming Tasks',
      value: '23',
      icon: Calendar,
      color: 'bg-yellow-500',
      change: '+3'
    },
    {
      title: 'Weather Alerts',
      value: '2',
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: 'Active'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// Chart Section Component
const ChartSection = () => {
  return (
    <Card className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Crop Yield Trends</h3>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">Last 8 months</span>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cropYieldData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" className="text-sm" />
            <YAxis className="text-sm" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="yield" 
              stroke="#16a34a" 
              strokeWidth={3}
              dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// Activity Table Component
const ActivityTable = () => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Recent Farm Activities</h3>
        <button className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors">
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Activity</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
            </tr>
          </thead>
          <tbody>
            {recentActivities.map((activity) => (
              <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-gray-800">{activity.activity}</td>
                <td className="py-4 px-4 text-gray-600">{activity.date}</td>
                <td className="py-4 px-4 text-gray-600">{activity.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Sidebar Component
const Sidebar = ({ isOpen, toggleSidebar, activeItem, setActiveItem, isCollapsed, toggleCollapse }) => {
  const currentUser = getLoggedInUser();
  
  const menuItems = [
    { name: 'Home', icon: Home },
    { name: 'Products', icon: ShoppingBag },
    { name: 'Supplies', icon: Truck },
    { name: 'Weather', icon: Cloud },
    { name: 'Inventory', icon: Package },
    { name: 'Training', icon: BookOpen },
    { name: 'Reports', icon: FileText },
    { name: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-green-800 text-white transform transition-all duration-300 ease-in-out z-30 lg:translate-x-0 lg:static lg:z-0 overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'lg:w-20' : 'w-72 sm:w-80'}`}>
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b border-green-700 ${isCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center justify-between lg:justify-center">
            {!isCollapsed && (
              <h2 className="text-lg sm:text-xl font-bold">Farm Manager</h2>
            )}
            <div className="flex items-center space-x-2">
              {/* Desktop Toggle Button */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-1 rounded-md hover:bg-green-700 transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
              {/* Mobile Close Button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-1 rounded-md hover:bg-green-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        {!isCollapsed && (
          <div className="p-4 sm:p-6 border-b border-green-700">
            <div className="text-center">
              {/* User Info */}
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-white">{currentUser.name}</h3>
                <p className="text-sm text-green-200">{getRoleDisplayName(currentUser.role)}</p>
                <p className="text-xs text-green-300 mt-1">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}

        
        {/* Navigation Menu */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveItem(item.name);
                  // Auto-close sidebar on mobile after selection
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-4' : 'px-4 sm:px-6'} py-3 text-left hover:bg-green-700 transition-colors duration-200 group ${
                  activeItem === item.name ? 'bg-green-700 border-r-4 border-green-300' : ''
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <Icon className={`h-5 w-5 group-hover:scale-110 transition-transform duration-200 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <>
                    <span className="text-sm sm:text-base font-medium">{item.name}</span>
                    {activeItem === item.name && (
                      <div className="ml-auto w-2 h-2 bg-green-300 rounded-full"></div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 sm:p-6 border-t border-green-700">
            <div className="text-center">
              <p className="text-xs text-green-300">
                FarmNex Dashboard v2.0
              </p>
              <p className="text-xs text-green-400 mt-1">
                © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Header Component
const Header = ({ toggleSidebar }) => {
  const currentUser = getLoggedInUser();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors mr-2"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </button>
          
          {/* Profile Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{getRoleDisplayName(currentUser.role)}</p>
            </div>
          </div>
          
          {/* Logout */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Logout">
            <LogOut className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

// Main Dashboard Component
const FarmerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Render the appropriate content based on active sidebar item
  const renderContent = () => {
    console.log('Current active item:', activeItem);
    
    try {
      switch (activeItem) {
        case 'Products':
          console.log('Rendering ProductManagement');
          return <ProductManagement />;
        case 'Inventory':
          console.log('Rendering FarmerInventoryManagement');
          return <FarmerInventoryManagement />;
        case 'Supplies':
          console.log('Rendering FarmerSuppliesManagement');
          return <FarmerSuppliesManagement />;
        case 'Weather':
          console.log('Rendering WeatherDashboard');
          return <WeatherDashboardLazy />;
        case 'Training':
          console.log('Rendering TrainingManagementFull with all features');
          return <TrainingManagementFull />;
        case 'Reports':
          console.log('Rendering ProductManagementReport');
          return <ProductManagementReport />;
        case 'Settings':
          console.log('Rendering Settings');
          return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-semibold mb-4">Settings</h2><p>Settings panel is under development.</p></div>;
        case 'Home':
        default:
          return (
            <div>
              <DashboardStats />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2">
                  <ChartSection />
                </div>
                <div className="flex justify-center md:justify-start">
                  <SoilMoistureWidget deviceId="ARDUINO-UNO-001" title="Field Moisture Monitor" />
                </div>
              </div>
              {/* Weather Overview Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <WeatherWidget 
                    title="Weather Overview" 
                    compact={false} 
                    showForecast={true}
                    refreshInterval={300000}
                  />
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Today's Farm Conditions</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Soil Moisture</span>
                      </div>
                      <span className="text-green-600 font-semibold">Optimal</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Weather Conditions</span>
                      </div>
                      <span className="text-blue-600 font-semibold">Favorable</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Irrigation Schedule</span>
                      </div>
                      <span className="text-yellow-600 font-semibold">Next: 6:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Crop Status</span>
                      </div>
                      <span className="text-purple-600 font-semibold">Healthy Growth</span>
                    </div>
                  </div>
                </div>
              </div>
              <ActivityTable />
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering content for:', activeItem, error);
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-bold text-red-800 mb-2">Error Loading {activeItem}</h2>
          <p className="text-red-600 mb-4">There was an error loading the {activeItem.toLowerCase()} component.</p>
          <pre className="text-sm text-red-700 bg-red-100 p-3 rounded overflow-auto mb-4">
            {error.message || error.toString()}
          </pre>
          <div className="space-x-2">
            <button 
              onClick={() => setActiveItem('Home')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go Home
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        isCollapsed={sidebarCollapsed}
        toggleCollapse={toggleSidebarCollapse}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-0'}`}>
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            }>
              {renderContent()}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FarmerDashboard;
