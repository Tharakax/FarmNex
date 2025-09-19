import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import PaymentCardsManager from './pages/client/PaymentCards.jsx'
import { ToastProvider } from "./pages/croplive/ToastProvider.jsx"; // ✅ import ToastProvider

// Lazy loaded components ...
const HomePage = React.lazy(() => import('./pages/homePage.jsx'))
const LoginPage = React.lazy(() => import('./pages/loginpage'))
const AdminDashboard = React.lazy(() => import('./pages/admindashboard'))
const Testing = React.lazy(() => import('./pages/testing'))
const ProductsPage = React.lazy(() => import('./pages/client/Products.jsx'))
const OneProduct = React.lazy(() => import('./pages/client/OneProduct.jsx'))
const Cart = React.lazy(() => import('./pages/client/cart.jsx'))
const EnterShipping = React.lazy(() => import('./pages/client/EnterShipping.jsx'))
const EnterPayment = React.lazy(() => import('./pages/client/EnterPayment.jsx'))
const TrainingShowcase = React.lazy(() => import('./pages/TrainingShowcase.jsx'))
const TrainingHomePage = React.lazy(() => import('./pages/TrainingHomePage.jsx'))
const AddEditTraining = React.lazy(() => import('./pages/farmer/AddEditTraining.jsx'))
const ViewTraining = React.lazy(() => import('./pages/farmer/ViewTraining.jsx'))
const AboutPage = React.lazy(() => import('./pages/AboutPage.jsx'))
const FarmerDashboard = React.lazy(() => import('./pages/farmerdashboard.jsx'))

// Lazy load crop components
const AddCropPlan = React.lazy(() => import('./pages/croplive/AddCropPlan.jsx'))
const AllCropPlans = React.lazy(() => import('./pages/croplive/AllCropPlans.jsx'))
const UpdateCropPlan = React.lazy(() => import('./pages/croplive/UpdateCropPlan.jsx'))
const DeleteCropPlan = React.lazy(() => import('./pages/croplive/DeleteCropPlan.jsx'))

// Lazy load livestock components
const AddLiveStockPlan = React.lazy(() => import('./pages/croplive/AddLiveStockPlan.jsx'))
const AllLiveStockPlan = React.lazy(() => import('./pages/croplive/AllLiveStockPlan.jsx'))
const UpdateLiveStockPlan = React.lazy(() => import('./pages/croplive/UpdateLiveStockPlan.jsx'))
const DeleteLiveStockPlan = React.lazy(() => import('./pages/croplive/DeleteLiveStockPlan.jsx'))

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
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
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <ToastProvider> {/* ✅ Wrap everything with ToastProvider */}
      <Toaster position="top-right" />
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/testing" element={<Testing />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/oneProduct/:id" element={<OneProduct />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/shipping/:orderId" element={<EnterShipping />} />
            <Route path="/payment/:orderId" element={<EnterPayment />} />
            <Route path="payment-methods" element={<PaymentCardsManager />} />
            <Route path="/training" element={<TrainingShowcase />} />
            <Route path="/training-showcase" element={<TrainingShowcase />} />
            <Route path="/training-home" element={<TrainingHomePage />} />
            <Route path="/add" element={<AddEditTraining />} />
            <Route path="/edit/:id" element={<AddEditTraining />} />
            <Route path="/view/:id" element={<ViewTraining />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />

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

            {/* Fallback */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                  <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                  <a href="/" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Go Home</a>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  )
}

export default App
