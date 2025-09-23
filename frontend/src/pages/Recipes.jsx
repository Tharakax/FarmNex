import React, { useState } from 'react';
import { Clock, Users, Star, ChefHat, Leaf, ArrowRight, Filter, Search } from 'lucide-react';
import { FaLeaf } from 'react-icons/fa';
import Navigation from '../components/navigation';
import { NavLink } from 'react-router-dom';

const Recipes = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (recipeId) => {
    setImageErrors(prev => ({ ...prev, [recipeId]: true }));
  };

  const getImageSrc = (recipe) => {
    if (imageErrors[recipe.id]) {
      // Multiple fallback options based on category
      const fallbackImages = {
        vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        dairy: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        meat: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fruits: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        grains: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      };
      return fallbackImages[recipe.category] || fallbackImages.default;
    }
    return recipe.image;
  };

  const categories = [
    { id: 'all', name: 'All Recipes', icon: '🍽️' },
    { id: 'vegetables', name: 'Vegetable Dishes', icon: '🥕' },
    { id: 'grains', name: 'Grain & Cereal', icon: '🌾' },
    { id: 'dairy', name: 'Dairy Delights', icon: '🥛' },
    { id: 'meat', name: 'Meat & Poultry', icon: '🍖' },
    { id: 'fruits', name: 'Fresh Fruits', icon: '🍎' },
    { id: 'herbs', name: 'Herbs & Spices', icon: '🌿' }
  ];

  const recipes = [
    {
      id: 1,
      title: "Farm Fresh Tomato Basil Soup",
      description: "Creamy tomato soup made with fresh farm tomatoes and aromatic basil",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "vegetables",
      cookTime: "30 mins",
      servings: 4,
      difficulty: "Easy",
      rating: 4.8,
      ingredients: ["2 lbs fresh farm tomatoes", "1 cup fresh basil", "1 cup heavy cream", "2 tbsp olive oil"],
      farmProducts: ["Fresh Tomatoes", "Farm Herbs", "Dairy Cream"],
      featured: true
    },
    {
      id: 2,
      title: "Scrambled Farm Eggs with Herbs",
      description: "Fluffy scrambled eggs from free-range hens with garden-fresh herbs",
      image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6fee9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "dairy",
      cookTime: "10 mins",
      servings: 2,
      difficulty: "Easy",
      rating: 4.9,
      ingredients: ["6 farm-fresh eggs", "2 tbsp butter", "Fresh chives", "Salt & pepper"],
      farmProducts: ["Farm Eggs", "Fresh Herbs", "Farm Butter"],
      featured: true
    },
    {
      id: 3,
      title: "Roasted Bell Pepper Medley",
      description: "Colorful roasted peppers with olive oil and fresh herbs",
      image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "vegetables",
      cookTime: "45 mins",
      servings: 6,
      difficulty: "Medium",
      rating: 4.7,
      ingredients: ["4 bell peppers", "3 tbsp olive oil", "Fresh thyme", "Balsamic vinegar"],
      farmProducts: ["Bell Peppers", "Fresh Herbs", "Olive Oil"],
      featured: false
    },
    {
      id: 4,
      title: "Farm-Style Chicken Stew",
      description: "Hearty chicken stew with root vegetables and herbs",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "meat",
      cookTime: "90 mins",
      servings: 8,
      difficulty: "Hard",
      rating: 4.9,
      ingredients: ["2 lbs farm chicken", "4 carrots", "3 potatoes", "Fresh rosemary"],
      farmProducts: ["Farm Chicken", "Root Vegetables", "Fresh Herbs"],
      featured: true
    },
    {
      id: 5,
      title: "Fresh Fruit Smoothie Bowl",
      description: "Nutritious smoothie bowl topped with seasonal farm fruits",
      image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "fruits",
      cookTime: "15 mins",
      servings: 2,
      difficulty: "Easy",
      rating: 4.6,
      ingredients: ["Mixed berries", "Banana", "Greek yogurt", "Granola"],
      farmProducts: ["Fresh Berries", "Farm Yogurt", "Seasonal Fruits"],
      featured: false
    },
    {
      id: 6,
      title: "Quinoa Vegetable Bowl",
      description: "Nutritious grain bowl with fresh vegetables and herbs",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "grains",
      cookTime: "25 mins",
      servings: 4,
      difficulty: "Medium",
      rating: 4.5,
      ingredients: ["1 cup quinoa", "Mixed vegetables", "Lemon vinaigrette", "Fresh herbs"],
      farmProducts: ["Quinoa", "Fresh Vegetables", "Farm Herbs"],
      featured: false
    },
    {
      id: 7,
      title: "Herb-Crusted Salmon",
      description: "Fresh salmon with a crust of farm-grown herbs and spices",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "meat",
      cookTime: "20 mins",
      servings: 4,
      difficulty: "Medium",
      rating: 4.8,
      ingredients: ["4 salmon fillets", "Mixed herbs", "Olive oil", "Lemon"],
      farmProducts: ["Fresh Herbs", "Olive Oil", "Lemon"],
      featured: true
    },
    {
      id: 8,
      title: "Farm Cheese & Herb Omelet",
      description: "Fluffy omelet with farm cheese and fresh herbs",
      image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "dairy",
      cookTime: "15 mins",
      servings: 2,
      difficulty: "Medium",
      rating: 4.7,
      ingredients: ["4 farm eggs", "Farm cheese", "Fresh herbs", "Butter"],
      farmProducts: ["Farm Eggs", "Farm Cheese", "Fresh Herbs"],
      featured: false
    }
  ];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredRecipes = recipes.filter(recipe => recipe.featured);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-600';
      case 'Medium': return 'bg-yellow-100 text-yellow-600';
      case 'Hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

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

        {/* Search and Filter Section */}
        <section className="py-12 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-50/30"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200'
                    }`}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Recipes Section */}
        <section className="py-16 bg-gradient-to-br from-green-100 to-emerald-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Farm Recipes</h2>
              <p className="text-gray-600">Our most popular recipes featuring fresh FarmNex ingredients</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredRecipes.slice(0, 3).map((recipe) => (
                <div key={recipe.id} className="rounded-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 hover:rotate-1 transform-gpu" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(34, 197, 94, 0.05) 100%)',
                  boxShadow: '0 10px 40px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
                  transform: 'perspective(800px) rotateX(-2deg)'
                }}>
                  <div className="relative overflow-hidden">
                    <img 
                      src={getImageSrc(recipe)}
                      alt={recipe.title}
                      className="w-full h-48 object-cover transition-transform hover:scale-110"
                      onError={() => handleImageError(recipe.id)}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{recipe.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {recipe.cookTime}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {recipe.servings} servings
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-600">{recipe.rating}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">FarmNex Products:</h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.farmProducts.map((product, index) => (
                          <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-medium">
                      View Recipe
                    </button>
                  </div>
                </div>
              ))}
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="rounded-lg overflow-hidden hover:shadow-lg transition-all transform hover:scale-105 bg-white border border-gray-200">
                  <div className="relative">
                    <img 
                      src={getImageSrc(recipe)}
                      alt={recipe.title}
                      className="w-full h-40 object-cover"
                      onError={() => handleImageError(recipe.id)}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{recipe.title}</h3>
                    <p className="text-gray-600 mb-3 text-sm line-clamp-2">{recipe.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {recipe.cookTime}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {recipe.servings}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                        {recipe.rating}
                      </div>
                    </div>

                    <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors text-sm font-medium">
                      View Recipe
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12">
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
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
