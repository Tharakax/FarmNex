import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginPage from './pages/loginpage'
import AdminDashboard from './pages/admindashboard'
import Testing from './pages/testing'
import HomePage from './pages/homePage.jsx'
import ProductsPage from './pages/client/Products.jsx'
import OneProduct from './pages/client/OneProduct.jsx'
import Cart from './pages/client/cart.jsx'
import EnterShipping from './pages/client/EnterShipping.jsx'
import EnterPayment from './pages/client/EnterPayment.jsx'

function App() {

  return (
    <div className="min-h-screen w-full">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/testing" element={<Testing />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/oneProduct/:id" element={<OneProduct />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shipping/:id" element={<EnterShipping />} />
        <Route path="/:id/payment" element={<EnterPayment />} />



        {/* Add more routes as needed */}

      </Routes>
    </div>
  )
}

export default App
