import React from 'react';
import { ChefHat, Leaf } from 'lucide-react';
import { FaLeaf } from 'react-icons/fa';
import Navigation from '../components/navigation';
import { NavLink } from 'react-router-dom';
import RecipeList from '../components/recipes/RecipeList.jsx';

const Recipes = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-xl animate-pulse transform rotate-45 shadow-2xl"></div>
        <div className="absolute top-60 right-20 w-48 h-48 bg-gradient-to-tl from-teal-300/15 to-green-500/15 rounded-full blur-2xl animate-bounce transform -rotate-12 shadow-2xl"></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-400/25 to-green-600/25 rounded-full blur-lg animate-ping transform rotate-90 shadow-xl"></div>
      </div>

      <Navigation />

      <div className='pt-10'>
        {/* Hero Section */}
        <section 
          className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-[60vh] flex items-center transform-gpu"
          style={{
            background: `
              linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.4) 30%, rgba(0, 0, 0, 0.65) 100%),
              radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.3) 0%, transparent 70%),
              url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop&crop=center')
            `,
            backgroundSize: 'cover, 100% 100%, cover',
            backgroundPosition: 'center, center, center',
            backgroundAttachment: 'fixed, scroll, fixed',
            boxShadow: 'inset 0 0 200px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center">
              <div className="flex justify-center items-center mb-6">
                <ChefHat className="h-16 w-16 text-orange-400 mr-4" />
                <FaLeaf className="h-12 w-12 text-green-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 transform-gpu" style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 4px 8px rgba(0,0,0,0.7), 0 8px 16px rgba(0,0,0,0.5)',
                transform: 'perspective(1000px) rotateX(5deg)',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))'
              }}>
                Farm-to-Table <span className="text-green-300 animate-pulse" style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.6)',
                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.8))'
                }}>Recipes</span>
              </h1>
              <p className="text-xl text-white mb-8 max-w-3xl mx-auto transform-gpu" style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 4px 8px rgba(0,0,0,0.7)',
                transform: 'perspective(800px) rotateX(2deg)',
                filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.7))',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                padding: '12px 24px',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)'
              }}>
                Discover delicious recipes crafted with fresh ingredients from FarmNex. 
                From garden to kitchen, experience the true taste of farm-fresh cooking.
              </p>
            </div>
          </div>
        </section>



        {/* All Recipes Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">All Recipes</h2>
              <p className="text-gray-600">Explore our complete collection of farm-to-table recipes</p>
            </div>
            <div className="mt-4">
              <RecipeList showHeader={false} publicView={true} />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-16 relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9)), url('https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1920&h=1080&fit=crop&crop=center')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Ready to Cook with Fresh Ingredients?</h2>
            <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
              Get all the fresh ingredients you need from FarmNex to create these delicious recipes at home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/products">
                <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-flex items-center">
                  <Leaf className="mr-2 h-5 w-5" />
                  Shop Fresh Ingredients
                </button>
              </NavLink>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all transform hover:scale-105 backdrop-blur-sm">
                Join Cooking Community
              </button>
            </div>
          </div>
        </section>

        {/* Footer with Dark Background - Consistent with other pages */}
        <footer 
          className="relative py-12"
          style={{
            backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.95), rgba(17, 24, 39, 0.95)), url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop&crop=center')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <FaLeaf className="h-8 w-8 text-green-400" />
                  <span className="text-2xl font-bold">FarmNex</span>
                </div>
                <p className="text-gray-300">
                  Your trusted source for fresh farm products including crops and animal products delivered straight from local farms.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><NavLink to="/" className="hover:text-white transition-colors">Home</NavLink></li>
                  <li><NavLink to="/products" className="hover:text-white transition-colors">Products</NavLink></li>
                  <li><NavLink to="/recipes" className="hover:text-white transition-colors">Recipes</NavLink></li>
                  <li><NavLink to="/training" className="hover:text-white transition-colors">Training</NavLink></li>
                  <li><NavLink to="/about" className="hover:text-white transition-colors">About Us</NavLink></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                <div className="space-y-2 text-gray-300">
                  <p>Email: info@farmnex.com</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Address: 123 Farm Street, Green Valley, CA 90210</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 FarmNex. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Recipes;
