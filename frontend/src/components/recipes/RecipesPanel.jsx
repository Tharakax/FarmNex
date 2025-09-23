import React, { useMemo, useState } from 'react';
import { Search, Filter, Clock, Users, Star, ChefHat, Leaf } from 'lucide-react';

const sampleRecipes = [
  {
    id: 1,
    title: 'Tomato Basil Soup',
    description: 'Creamy tomato soup made with fresh farm tomatoes and basil.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=260',
    category: 'vegetables',
    cookTime: '30 mins',
    servings: 4,
    rating: 4.8,
    featured: true,
  },
  {
    id: 2,
    title: 'Farm Eggs & Herbs',
    description: 'Fluffy scrambled eggs from free-range hens with garden herbs.',
    image: 'https://images.unsplash.com/photo-1525351326368-efbb5cb6fee9?auto=format&fit=crop&w=400&h=260',
    category: 'dairy',
    cookTime: '10 mins',
    servings: 2,
    rating: 4.9,
    featured: true,
  },
  {
    id: 3,
    title: 'Roasted Pepper Medley',
    description: 'Colorful roasted peppers with olive oil and fresh thyme.',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&h=260',
    category: 'vegetables',
    cookTime: '45 mins',
    servings: 6,
    rating: 4.7,
  },
  {
    id: 4,
    title: 'Fruit Smoothie Bowl',
    description: 'Smoothie bowl topped with seasonal farm fruits.',
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=400&h=260',
    category: 'fruits',
    cookTime: '15 mins',
    servings: 2,
    rating: 4.6,
  },
];

const categoryMeta = {
  all: { label: 'All', color: 'bg-gray-100 text-gray-700' },
  vegetables: { label: 'Vegetables', color: 'bg-green-100 text-green-700' },
  dairy: { label: 'Dairy', color: 'bg-yellow-100 text-yellow-700' },
  fruits: { label: 'Fruits', color: 'bg-pink-100 text-pink-700' },
};

const Badge = ({ text, className = '' }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{text}</span>
);

export default function RecipesPanel() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const recipes = useMemo(() => {
    return sampleRecipes.filter((r) => {
      const matchesQuery =
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || r.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-green-600" /> Recipes
          </h2>
          <p className="text-sm text-gray-600">Quick ideas using your farm-fresh products</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                category === key
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <div key={r.id} className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-100">
              <img
                src={r.image}
                alt={r.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&h=260';
                }}
              />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{r.title}</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-sm">{r.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{r.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge text={categoryMeta[r.category]?.label || 'Other'} className={categoryMeta[r.category]?.color} />
                  {r.featured && <Badge text="Featured" className="bg-purple-100 text-purple-700" />}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {r.cookTime}</div>
                  <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {r.servings}</div>
                </div>
              </div>
              <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                View Recipe
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
