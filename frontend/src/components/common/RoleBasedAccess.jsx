import React from 'react';
import { Shield, AlertTriangle, Users, Settings, Leaf, BarChart3 } from 'lucide-react';
import BrandLogo from '../BrandLogo.jsx';

const RoleBasedAccess = ({ userRole, requiredRole, children, showMessage = true }) => {
  const hasAccess = checkRoleAccess(userRole, requiredRole);

  if (hasAccess) {
    return children;
  }

  if (!showMessage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this area. This section is restricted to{' '}
            <span className="font-semibold text-red-600">{requiredRole}</span> users only.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Role-Based Security</p>
                <p>
                  Your current role: <span className="font-semibold">{userRole}</span><br/>
                  Required role: <span className="font-semibold">{requiredRole}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <RoleAccessGuide />
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <BrandLogo size={16} />
              <span>FarmNex - Secure Farm Management</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleAccessGuide = () => {
  const roleGuide = [
    {
      role: 'Admin',
      icon: Settings,
      color: 'text-purple-600 bg-purple-100',
      description: 'Full system access, user management, all reports',
      dashboards: ['Admin Dashboard', 'All Management Tools']
    },
    {
      role: 'FarmStaff',
      brand: true,
      color: 'text-green-600 bg-green-100',
      description: 'Farm operations, products, inventory, reports',
      dashboards: ['Farmer Dashboard', 'Product Management', 'Inventory']
    },
    {
      role: 'Manager',
      icon: BarChart3,
      color: 'text-blue-600 bg-blue-100',
      description: 'Team oversight, analytics, operational reports',
      dashboards: ['Manager Dashboard', 'Team Analytics']
    },
    {
      role: 'Customer',
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
      description: 'Shopping, orders, customer support',
      dashboards: ['Customer Dashboard', 'Order History']
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Access Guide</h3>
      <div className="space-y-3 text-left">
        {roleGuide.map((role, index) => {
          const IconComponent = role.icon;
          return (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${role.color}`}>
                {role.brand ? (
                  <BrandLogo size={16} />
                ) : role.iconProps ? (
                  null
                ) : (
                  <IconComponent className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{role.role}</p>
                <p className="text-xs text-gray-600 mb-1">{role.description}</p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Access:</span> {role.dashboards.join(', ')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to check role access
const checkRoleAccess = (userRole, requiredRole) => {
  const roleHierarchy = {
    'Admin': 4,
    'Manager': 3, 
    'FarmStaff': 2,
    'DeliveryStaff': 2,
    'Customer': 1
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  // Special case: exact role match required for certain roles
  if (requiredRole === 'Admin' || requiredRole === 'FarmStaff') {
    return userRole === requiredRole;
  }

  return userLevel >= requiredLevel;
};

export default RoleBasedAccess;
export { checkRoleAccess };