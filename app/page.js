

'use client';
import { useState, useEffect } from 'react';
import { database } from '@/config/firebase';
import { ref, get } from 'firebase/database';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'All Categories',
    maxPrice: 1000
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsRef = ref(database, 'public/products');
        const snapshot = await get(productsRef);
        if (snapshot.exists()) {
          // Convert Firebase object to array with IDs
          const productsData = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data
          }));
          setProducts(productsData);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    return (
      product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.type === 'All Categories' || product.type === filters.type) &&
      product.price <= filters.maxPrice
    );
  });

  // Make sure each category has a unique key
  const categories = ['All Categories', ...new Set(products.map(p => p.type))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">Our Products</h1>
        
        {/* Filters */}
        <div className="mb-8 space-y-4 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {categories.map((category, index) => (
                <option key={`category-${index}-${category}`} value={category}>{category}</option>
              ))}
            </select>
            
            <div className="flex-1 space-y-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Max Price: ₹{filters.maxPrice}</label>
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={`product-${product.id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{product.name}</h2>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                    {product.type}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stock: {product.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
