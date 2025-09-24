# AdminHeader Component Usage Guide

The `AdminHeader` component is a clean, modern header designed for Farm Nex admin pages. It provides a consistent navigation experience across all admin interfaces.

## Features

- 🎨 **Clean Design**: Modern, professional appearance with Farm Nex branding
- 🔍 **Search Integration**: Optional search functionality
- 🔔 **Notifications**: Notification center with dropdown
- 👤 **User Profile**: Profile dropdown with logout functionality
- ↩️ **Navigation**: Optional back button with customizable text and path
- 📱 **Responsive**: Mobile-friendly design with collapsing elements
- 🎛️ **Configurable**: Highly customizable through props

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | `"Admin Dashboard"` | Main header title |
| `subtitle` | string | `"Manage your Farm Nex system"` | Subtitle text (hidden on mobile) |
| `showBackButton` | boolean | `false` | Show/hide back button |
| `backButtonText` | string | `"Back"` | Text for back button |
| `backButtonPath` | string | `"/"` | Navigation path for back button |
| `showSearch` | boolean | `false` | Show/hide search functionality |
| `className` | string | `""` | Additional CSS classes |

## Usage Examples

### Basic Usage
```jsx
import AdminHeader from '../components/AdminHeader';

function AdminPage() {
  return (
    <div>
      <AdminHeader />
      {/* Your page content */}
    </div>
  );
}
```

### User Management Page
```jsx
import AdminHeader from '../components/AdminHeader';

function UserManagement() {
  return (
    <div>
      <AdminHeader 
        title="User Management"
        subtitle="Manage your smart farming team members and customers"
        showBackButton={true}
        backButtonText="Back to Admin"
        backButtonPath="/admin"
        showSearch={false}
      />
      {/* Your user management content */}
    </div>
  );
}
```

### Dashboard with Search
```jsx
import AdminHeader from '../components/AdminHeader';

function Dashboard() {
  return (
    <div>
      <AdminHeader 
        title="Farm Dashboard"
        subtitle="Monitor your farm operations and analytics"
        showSearch={true}
        className="border-b-2 border-green-100"
      />
      {/* Your dashboard content */}
    </div>
  );
}
```

### Settings Page
```jsx
import AdminHeader from '../components/AdminHeader';

function SettingsPage() {
  return (
    <div>
      <AdminHeader 
        title="Farm Settings"
        subtitle="Configure your farm preferences and system settings"
        showBackButton={true}
        backButtonText="Back to Dashboard"
        backButtonPath="/admin"
      />
      {/* Your settings content */}
    </div>
  );
}
```

### Analytics Page with Custom Styling
```jsx
import AdminHeader from '../components/AdminHeader';

function AnalyticsPage() {
  return (
    <div>
      <AdminHeader 
        title="Farm Analytics"
        subtitle="Track crop performance, sales metrics, and seasonal trends"
        showBackButton={true}
        backButtonText="← Dashboard"
        backButtonPath="/admin"
        showSearch={true}
        className="bg-gradient-to-r from-green-50 to-emerald-50"
      />
      {/* Your analytics content */}
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes and is fully responsive. The header:
- Uses Farm Nex green color scheme (`green-500` to `emerald-600`)
- Has a sticky position (`sticky top-0`)
- Includes proper z-index for overlays (`z-50`)
- Has smooth transitions and hover effects
- Adapts to mobile screens with collapsing elements

## State Management

The component handles its own state for:
- Profile dropdown visibility
- Notifications dropdown visibility
- Search query (if search is enabled)
- Admin user data loading from localStorage/JWT

## User Data Loading

The component automatically loads admin user data from:
1. `localStorage.getItem('currentUser')` (first priority)
2. JWT token from `localStorage.getItem('token')` or `sessionStorage.getItem('authToken')`
3. Falls back to default "Admin User" if no data found

## Notifications

The notification system shows:
- Red dot indicator for unread notifications
- Dropdown with recent notifications
- Sample notifications (you can customize this data)

## Profile Management

The profile dropdown includes:
- Admin user name and email
- Profile link (navigates to `/profile`)
- Settings link (navigates to `/settings`)
- Logout functionality (clears tokens and redirects to `/login`)

## Integration Tips

1. **Replace existing headers**: Remove inline navigation bars and use this component
2. **Consistent styling**: Use the same props structure across pages for consistency
3. **Mobile optimization**: The component handles mobile responsiveness automatically
4. **Search integration**: Connect the search functionality to your data fetching logic
5. **Notification updates**: Extend the notification system to connect to your backend API

## Customization

You can extend the component by:
- Adding more dropdown menu items
- Customizing notification data source
- Adding more search filters
- Implementing role-based visibility
- Adding breadcrumb navigation

This component provides a solid foundation for all your admin page headers while maintaining consistency with the Farm Nex design system.