import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Heart,
  Wrench,
  DollarSign,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Video,
  FileText,
  Eye,
  Clock,
  Star,
  Grid,
  List
} from 'lucide-react';

// Card component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, onClick }) => {
  const getCategoryIcon = (categoryName) => {
    switch (categoryName) {
      case 'Crop Management':
        return <Sprout className="h-12 w-12 text-green-600" />;
      case 'Livestock':
        return <Heart className="h-12 w-12 text-orange-600" />;
      case 'Equipment':
        return <Wrench className="h-12 w-12 text-blue-600" />;
      case 'Finance':
        return <DollarSign className="h-12 w-12 text-yellow-600" />;
      case 'Marketing':
        return <TrendingUp className="h-12 w-12 text-purple-600" />;
      case 'General':
        return <BookOpen className="h-12 w-12 text-gray-600" />;
      default:
        return <BookOpen className="h-12 w-12 text-gray-600" />;
    }
  };

  const getCategoryColor = (categoryName) => {
    switch (categoryName) {
      case 'Crop Management':
        return 'border-green-200 hover:border-green-300 hover:shadow-green-100';
      case 'Livestock':
        return 'border-orange-200 hover:border-orange-300 hover:shadow-orange-100';
      case 'Equipment':
        return 'border-blue-200 hover:border-blue-300 hover:shadow-blue-100';
      case 'Finance':
        return 'border-yellow-200 hover:border-yellow-300 hover:shadow-yellow-100';
      case 'Marketing':
        return 'border-purple-200 hover:border-purple-300 hover:shadow-purple-100';
      case 'General':
        return 'border-gray-200 hover:border-gray-300 hover:shadow-gray-100';
      default:
        return 'border-gray-200 hover:border-gray-300 hover:shadow-gray-100';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 border-2 ${getCategoryColor(category.name)} hover:shadow-lg`}
      onClick={() => onClick(category)}
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {getCategoryIcon(category.name)}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{category.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            {category.count} materials
          </span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
};

// Material Card for category view
const MaterialCard = ({ material, onViewMaterial }) => {
  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'guide':
      case 'article':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewMaterial(material)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getTypeIcon(material.type)}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900 mb-1">{material.title}</h4>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {material.views}
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(material.createdAt).toLocaleDateString()}
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
              {material.difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrainingCategories = ({ onViewMaterial }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([
    {
      name: 'Crop Management',
      description: 'Learn about crop rotation, soil health, pest control, and plant nutrition',
      count: 24,
      color: 'green'
    },
    {
      name: 'Livestock',
      description: 'Animal husbandry, feed management, health care, and breeding',
      count: 18,
      color: 'orange'
    },
    {
      name: 'Equipment',
      description: 'Farm machinery, maintenance, operation, and safety procedures',
      count: 15,
      color: 'blue'
    },
    {
      name: 'Finance',
      description: 'Budgeting, loans, insurance, and financial planning for farms',
      count: 12,
      color: 'yellow'
    },
    {
      name: 'Marketing',
      description: 'Sales strategies, market analysis, and customer relationships',
      count: 9,
      color: 'purple'
    },
    {
      name: 'General',
      description: 'General farming tips, sustainable practices, and industry news',
      count: 16,
      color: 'gray'
    }
  ]);

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/training?category=${encodeURIComponent(category.name)}`);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Error fetching category materials:', error);
      // Set mock data for development
      const mockMaterials = generateMockMaterials(category.name);
      setMaterials(mockMaterials);
    } finally {
      setLoading(false);
    }
  };

  const generateMockMaterials = (categoryName) => {
    const baseMaterials = {
      'Crop Management': [
        { title: 'Soil pH Testing and Management', type: 'Video', difficulty: 'Beginner', views: 245 },
        { title: 'Organic Pest Control Methods', type: 'PDF', difficulty: 'Intermediate', views: 189 },
        { title: 'Crop Rotation Planning Guide', type: 'Article', difficulty: 'Advanced', views: 156 },
        { title: 'Nutrient Deficiency Identification', type: 'Guide', difficulty: 'Intermediate', views: 203 }
      ],
      'Livestock': [
        { title: 'Cattle Feed Nutrition Basics', type: 'Video', difficulty: 'Beginner', views: 298 },
        { title: 'Livestock Health Management', type: 'PDF', difficulty: 'Advanced', views: 167 },
        { title: 'Breeding Program Setup', type: 'Article', difficulty: 'Advanced', views: 134 },
        { title: 'Pasture Management Guide', type: 'Guide', difficulty: 'Intermediate', views: 178 }
      ],
      'Equipment': [
        { title: 'Tractor Maintenance Schedule', type: 'PDF', difficulty: 'Beginner', views: 214 },
        { title: 'Harvester Operation Safety', type: 'Video', difficulty: 'Intermediate', views: 156 },
        { title: 'Equipment Financing Options', type: 'Article', difficulty: 'Beginner', views: 98 },
        { title: 'Preventive Maintenance Guide', type: 'Guide', difficulty: 'Intermediate', views: 189 }
      ]
    };

    const materials = baseMaterials[categoryName] || [
      { title: 'General Farming Guide', type: 'Article', difficulty: 'Beginner', views: 156 },
      { title: 'Best Practices Overview', type: 'PDF', difficulty: 'Intermediate', views: 234 }
    ];

    return materials.map((material, index) => ({
      _id: `${categoryName}-${index}`,
      ...material,
      description: `Comprehensive guide covering ${material.title.toLowerCase()} for farmers.`,
      category: categoryName,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      createdBy: 'Training Team',
      tags: ['farming', categoryName.toLowerCase().replace(' ', '-')]
    }));
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setMaterials([]);
  };

  if (selectedCategory) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToCategories}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Categories
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h2>
              <p className="text-gray-600">{selectedCategory.description}</p>
            </div>
          </div>
        </div>

        {/* Materials list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((material) => (
              <MaterialCard
                key={material._id}
                material={material}
                onViewMaterial={onViewMaterial}
              />
            ))}
            
            {materials.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
                <p className="text-gray-500">Materials for this category will be added soon.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Training Categories</h2>
        <p className="text-gray-600">Browse training materials organized by farming topics</p>
      </div>

      {/* Categories Overview */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          {categories.map((category) => (
            <div key={category.name} className="p-3">
              <div className="text-2xl font-bold text-gray-900">{category.count}</div>
              <div className="text-sm text-gray-600">{category.name}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.name}
            category={category}
            onClick={handleCategoryClick}
          />
        ))}
      </div>

      {/* Popular Materials by Category */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Sprout className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">Crop Management</span>
            </div>
            <h4 className="text-sm font-medium text-gray-800">Soil pH Testing Guide</h4>
            <p className="text-xs text-gray-500">245 views • Beginner</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-gray-900">Livestock</span>
            </div>
            <h4 className="text-sm font-medium text-gray-800">Feed Nutrition Basics</h4>
            <p className="text-xs text-gray-500">298 views • Beginner</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Equipment</span>
            </div>
            <h4 className="text-sm font-medium text-gray-800">Tractor Maintenance</h4>
            <p className="text-xs text-gray-500">214 views • Beginner</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrainingCategories;
