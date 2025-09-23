import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import PaymentCardsManager from './pages/client/PaymentCards.jsx';
import MyOrders from './pages/client/MyOrders.jsx';
import ViewOrder from './pages/client/ViewOrder.jsx';
import { ToastProvider } from "./pages/croplive/ToastProvider.jsx"; // ✅ import ToastProvider
import { GlobalBackButton } from './components/common/BackButton';
// Note: Feedback functionality is integrated into customer dashboard

// Lazy load components for easier debugging
const HomePage = React.lazy(() => import('./pages/homePage.jsx'));
//const LoginPage = React.lazy(() => import('./pages/loginpage'));
const AdminDashboard = React.lazy(() => import('./pages/admindashboard'));
const ProductsPage = React.lazy(() => import('./pages/client/Products.jsx'));
const OneProduct = React.lazy(() => import('./pages/client/OneProduct.jsx'));
const Cart = React.lazy(() => import('./pages/client/cart.jsx'));
const EnterShipping = React.lazy(() => import('./pages/client/EnterShipping.jsx'));
const EnterPayment = React.lazy(() => import('./pages/client/EnterPayment.jsx'));
const TrainingShowcase = React.lazy(() => import('./components/training/pages/TrainingShowcase.jsx'));
const TrainingHomePage = React.lazy(() => import('./components/training/pages/TrainingHomePage.jsx'));
const AddEditTraining = React.lazy(() => import('./components/training/pages/AddEditTraining.jsx'));
const ViewTraining = React.lazy(() => import('./components/training/pages/ViewTraining.jsx'));
const AboutPage = React.lazy(() => import('./pages/AboutPage.jsx'));
const FarmerDashboard = React.lazy(() => import('./pages/farmerdashboard.jsx'));
const PublicTrainingViewer = React.lazy(() => import('./components/training/pages/PublicTrainingViewer.jsx'));
const TrainingTest = React.lazy(() => import('./pages/TrainingTest.jsx'));
const ValidationDemo = React.lazy(() => import('./pages/ValidationDemo.jsx'));
const SweetAlertTest = React.lazy(() => import('./pages/SweetAlertTest.jsx'));
const RequiredFieldsTest = React.lazy(() => import('./pages/RequiredFieldsTest.jsx'));
const SweetAlertDebug = React.lazy(() => import('./pages/SweetAlertDebug.jsx'));
const SoilMoistureDashboard = React.lazy(() => import('./pages/SoilMoistureDashboard.jsx'));
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess.jsx'));
const PaymentUnsuccess = React.lazy(() => import('./pages/PaymentUnsuccess.jsx'));

// User Pages (Lazy Load)
const AddUser = React.lazy(() => import('./pages/user/AddUser/AddUser.jsx'));
const UpdateUser = React.lazy(() => import('./pages/user/UpdateUser/UpdateUser.jsx'));
const DeleteUser = React.lazy(() => import('./pages/user/DeleteUser/DeleteUser.jsx'));
const Register = React.lazy(() => import('./pages/user/Register/Register.jsx'));
const Login = React.lazy(() => import('./pages/user/Login/Login.jsx'));
const UserDetails = React.lazy(() => import('./pages/user/UserDetails/UserDetails.jsx'));
const UserProfile = React.lazy(() => import('./pages/user/UserProfile/UserProfile.jsx'));
const ChangePassword = React.lazy(() => import('./pages/user/UserProfile/ChangePassword.jsx'));
const OTPVerifyPage = React.lazy(() => import('./pages/user/Login/OTPVerifyPage.jsx'));
const AdminDash = React.lazy(() => import('./pages/user/Home/AdminDash.jsx'));
const CustomerDashboard = React.lazy(() => import('./pages/user/Home/Home.jsx')); // customer dashboard
const UserQA = React.lazy(() => import('./pages/user/QAManagement/UserQA.jsx')); //QA
const AdminQA = React.lazy(() => import('./pages/user/QAManagement/AdminQA.jsx')); //QA

// Lazy load crop components
const AddCropPlan = React.lazy(() => import('./pages/croplive/AddCropPlan.jsx'));
const AllCropPlans = React.lazy(() => import('./pages/croplive/AllCropPlans.jsx'));
const UpdateCropPlan = React.lazy(() => import('./pages/croplive/UpdateCropPlan.jsx'));
const DeleteCropPlan = React.lazy(() => import('./pages/croplive/DeleteCropPlan.jsx'));

// Lazy load livestock components
const AddLiveStockPlan = React.lazy(() => import('./pages/croplive/AddLiveStockPlan.jsx'));
const AllLiveStockPlan = React.lazy(() => import('./pages/croplive/AllLiveStockPlan.jsx'));
const UpdateLiveStockPlan = React.lazy(() => import('./pages/croplive/UpdateLiveStockPlan.jsx'));
const DeleteLiveStockPlan = React.lazy(() => import('./pages/croplive/DeleteLiveStockPlan.jsx'));

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) { 
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">There was an error loading this component.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ToastProvider> {/* ✅ Wrap everything with ToastProvider */}
      <Toaster position="top-center" />
      <GlobalBackButton />
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/*<Route path="/loginn" element={<LoginPage />} />*/}
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/oneProduct/:id" element={<OneProduct />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/shipping/:orderId" element={<EnterShipping />} />
            <Route path="/payment/:orderId" element={<EnterPayment />} />
            <Route path="payment-methods" element={<PaymentCardsManager />} />
            <Route path="/order-success/:orderId" element={<PaymentSuccess />} />
            <Route path="/order-unsuccess/:orderId" element={<PaymentUnsuccess />} />
            {/* Training Management Routes */}
            <Route path="/training" element={<TrainingShowcase />} />
            <Route path="/training/:id" element={<PublicTrainingViewer />} />
            <Route path="/training-showcase" element={<TrainingShowcase />} />
            <Route path="/training-home" element={<TrainingHomePage />} />
            <Route path="/add" element={<AddEditTraining />} />
            <Route path="/myorders" element={<MyOrders   />} />
            <Route path="/order-details/:orderid" element={<ViewOrder   />} />

            <Route path="/edit/:id" element={<AddEditTraining />} />
            <Route path="/view/:id" element={<ViewTraining />} />

            {/* User Management Routes */}
            <Route path="/adduser" element={<AddUser />} />
            <Route path="/userdetails" element={<UserDetails />} />
            <Route path="/userdetails/:id" element={<UpdateUser />} />
            <Route path="/deleteuser/:id" element={<DeleteUser />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/userprofile" element={<UserProfile />} />
            <Route path="/changepassword" element={<ChangePassword />} />
            <Route path="/otp" element={<OTPVerifyPage />} />
            <Route path="/admin" element={<AdminDash />} />
            <Route path="/customerdash" element={<CustomerDashboard />} />

            {/* Feedback functionality is integrated into customer dashboard */}
            {/* Standalone feedback routes removed - use /customerdash instead */}

            {/* Q&A Management Routes */}
            <Route path="/userqa" element={<UserQA />} />
            <Route path="/adminqa" element={<AdminQA />} />

            <Route path="/training-test" element={<TrainingTest />} />
            <Route path="/validation-demo" element={<ValidationDemo />} />
            <Route path="/sweetalert-test" element={<SweetAlertTest />} />
            <Route path="/required-fields-test" element={<RequiredFieldsTest />} />
            <Route path="/sweetalert-debug" element={<SweetAlertDebug />} />
            
            {/* Soil Moisture Dashboard */}
            <Route path="/soil-dashboard" element={<SoilMoistureDashboard />} />
            <Route path="/soil" element={<SoilMoistureDashboard />} />
            {/* About Page Route */}
            <Route path="/about" element={<AboutPage />} />
            
            {/* Farmer Dashboard Routes */}
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/farmerdashboard" element={<FarmerDashboard />} />

            {/* Crop Routes */}
            <Route path="/crops" element={<AllCropPlans />} />
            <Route path="/crops/add" element={<AddCropPlan />} />
            <Route path="/crops/update/:id" element={<UpdateCropPlan />} />
            <Route path="/crops/delete/:id" element={<DeleteCropPlan />} />

            {/* Livestock Routes */}
            <Route path="/livestock" element={<AllLiveStockPlan />} />
            <Route path="/livestock/add" element={<AddLiveStockPlan />} />
            <Route path="/livestock/update/:id" element={<UpdateLiveStockPlan />} />
            <Route path="/livestock/delete/:id" element={<DeleteLiveStockPlan />} />

            {/* Fallback route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                    <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                    <a
                      href="/"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;
