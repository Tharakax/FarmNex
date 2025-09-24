import React, { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { orderAPI } from '../../services/orderAPI';
import { productAPI } from '../../services/productAPI';
import toast from 'react-hot-toast';

// Simple star rating widget for products the user purchased.
// Persist ratings locally (localStorage) under key `productRatings`.
export default function ProductStarRatings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load existing ratings from localStorage
  const loadRatings = () => {
    try {
      return JSON.parse(localStorage.getItem('productRatings') || '{}');
    } catch {
      return {};
    }
  };

  const [ratings, setRatings] = useState(loadRatings);

  const saveRatings = (next) => {
    setRatings(next);
    try { localStorage.setItem('productRatings', JSON.stringify(next)); } catch {}
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getMyOrders();
        const orders = res.success ? (res.data || []) : [];
        // Flatten unique products from orders
        const map = new Map();
        orders.forEach(o => {
          (o.items || []).forEach(it => {
            const id = it.productId || it._id || it.sku || it.name;
            if (!map.has(id)) {
              map.set(id, {
                id,
                name: it.name || 'Product',
                image: it.image,
              });
            }
          });
        });
        setItems(Array.from(map.values()));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRate = async (id, value) => {
    // Optimistically update UI
    const prev = ratings[id];
    const next = { ...ratings, [id]: value };
    saveRatings(next);
    try {
      const res = await productAPI.rateProduct(id, value);
      if (!res.success) {
        throw new Error(res.error || 'Failed to rate');
      }
      toast.success('Rating saved');
    } catch (e) {
      // Revert on failure
      const revert = { ...ratings, [id]: prev };
      saveRatings(revert);
      toast.error(e.message || 'Failed to save rating');
    }
  };

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Rate Your Products</h3>
        <div className="animate-pulse h-24 bg-gray-50 rounded-lg" />
      </div>
    );
  }

  if (!items.length) {
    return null; // nothing purchased yet—hide section
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Rate Your Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            <img
              src={(p.image && (p.image.startsWith('http') ? p.image : `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000')}${p.image.startsWith('/') ? '' : '/uploads/'}${p.image.startsWith('/') ? p.image : p.image}`)) || 'https://via.placeholder.com/48x48?text=No+Image'}
              alt={p.name}
              className="w-10 h-10 rounded object-cover"
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No+Image'; }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    onClick={() => handleRate(p.id, n)}
                    className="text-yellow-500 hover:scale-110 transition-transform"
                    aria-label={`Rate ${n} star`}
                  >
                    <Star className={n <= (ratings[p.id] || 0) ? 'fill-yellow-400' : ''} size={18} />
                  </button>
                ))}
                {ratings[p.id] ? (
                  <span className="ml-2 text-xs text-gray-600">{ratings[p.id]} / 5</span>
                ) : (
                  <span className="ml-2 text-xs text-gray-400">tap a star</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
