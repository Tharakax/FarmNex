<<<<<<< HEAD
import React, { useState, Suspense } from 'react';
import { 
  Home, 
  Cloud, 
=======
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Home, 
  Wheat, 
  Users, 
  Cloud, 
  TrendingUp, 
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5
  Package, 
  FileText, 
  Settings, 
  Bell, 
  LogOut, 
  User,
  Menu,
<<<<<<< HEAD
  ShoppingBag,
  Truck,
  BookOpen
} from 'lucide-react';

=======
  X,
  AlertTriangle,
  Calendar,
  Activity
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
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5

// Reusable Card Component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

// Sidebar Component
<<<<<<< HEAD
const Sidebar = ({ isOpen, toggleSidebar, activeItem, setActiveItem }) => {
  const menuItems = [
    { name: 'Home', icon: Home },
    { name: 'Products', icon: ShoppingBag },
    { name: 'Supplies', icon: Truck },
    { name: 'Weather', icon: Cloud },
    { name: 'Inventory', icon: Package },
    { name: 'Training', icon: BookOpen },
=======
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [activeItem, setActiveItem] = useState('Home');
  
  const menuItems = [
    { name: 'Home', icon: Home },
    { name: 'Crops', icon: Wheat },
    { name: 'Livestock', icon: Users },
    { name: 'Weather', icon: Cloud },
    { name: 'Market Prices', icon: TrendingUp },
    { name: 'Inventory', icon: Package },
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5
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
      <div className={`fixed left-0 top-0 h-full bg-green-800 text-white w-64 transform transition-transform duration-300 ease-in-out z-30 lg:translate-x-0 lg:static lg:z-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-green-700">
          <h2 className="text-xl font-bold">Farm Manager</h2>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setActiveItem(item.name)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-green-700 transition-colors duration-200 ${
                  activeItem === item.name ? 'bg-green-700 border-r-4 border-green-300' : ''
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

// Header Component
const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-2xl font-semibold text-gray-800 lg:ml-0">Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-700">John Smith</p>
              <p className="text-xs text-gray-500">Farm Owner</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
          
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <LogOut className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

<<<<<<< HEAD



// Lazy load components to handle errors gracefully
const ProductManagement = React.lazy(() => import('../components/products/ProductManagement'));
const FarmerInventoryManagement = React.lazy(() => import('../components/inventory/FarmerInventoryManagement'));
const FarmerSuppliesManagement = React.lazy(() => import('../components/supplies/FarmerSuppliesManagement'));
const TestSupplies = React.lazy(() => import('../components/supplies/TestSupplies'));
const ReportsManagement = React.lazy(() => import('../components/reports/ReportsManagement'));
const TrainingManagement = React.lazy(() => import('../components/training/TrainingManagement'));
=======
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
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5

// Main Dashboard Component
const FarmerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
<<<<<<< HEAD
  const [activeItem, setActiveItem] = useState('Home');
=======
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

<<<<<<< HEAD
  // Render the appropriate content based on active sidebar item
  const renderContent = () => {
    console.log('Current active item:', activeItem);
    switch (activeItem) {
      case 'Products':
        console.log('Rendering ProductManagement');
        return <ProductManagement />;
      case 'Inventory':
        console.log('Rendering FarmerInventoryManagement');
        return <FarmerInventoryManagement />;
      case 'Supplies':
        console.log('Rendering FarmerSuppliesManagement');
        try {
          return <FarmerSuppliesManagement />;
        } catch (error) {
          console.error('Error rendering FarmerSuppliesManagement:', error);
          return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="text-lg font-bold text-red-800 mb-2">Error Loading Supplies</h2>
              <p className="text-red-600 mb-4">There was an error loading the supplies management component.</p>
              <pre className="text-sm text-red-700 bg-red-100 p-3 rounded overflow-auto">
                {error.message || error.toString()}
              </pre>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reload Page
              </button>
            </div>
          );
        }
      case 'Weather':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Weather Information</h2>
              <p className="text-gray-600">Weather dashboard functionality coming soon.</p>
            </div>
          </div>
        );
      case 'Training':
        return <TrainingManagement />;
      case 'Reports':
        return <ReportsManagement />;
      case 'Settings':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h2>
              <p className="text-gray-600">Settings panel coming soon.</p>
            </div>
          </div>
        );
      case 'Home':
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to Farm Manager</h2>
              <p className="text-gray-600">Use the navigation menu to access different sections of your farm management system.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />
=======
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-6">
<<<<<<< HEAD
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          }>
            {renderContent()}
          </Suspense>
=======
          <DashboardStats />
          <ChartSection />
          <ActivityTable />
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5
        </main>
      </div>
    </div>
  );
};

export default FarmerDashboard;