'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { database } from '@/config/firebase';
import { ref, get, set, remove } from 'firebase/database';
import { sampleProducts } from '@/app/data/sampleProducts';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log("Fetching products from Firebase...");
        const productsRef = ref(database, 'public/products');
        const snapshot = await get(productsRef);
        
        if (snapshot.exists()) {
          console.log("Products found:", snapshot.val());
          const productsData = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data
          }));
          setProducts(productsData);
        } else {
          console.log("No products found in database");
          setError("No products found. Add your first product!");
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setError(`Failed to load products: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleAddNewProduct = () => {
    router.push('/admin/add-product');
  };

  const handleEdit = (product) => {
    localStorage.setItem('editProduct', JSON.stringify(product));
    router.push('/admin/add-product');
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Delete directly from Firebase
        const productRef = ref(database, `public/products/${productId}`);
        await remove(productRef);
        
        // Remove product from state to update UI immediately
        setProducts(products.filter(p => p.id !== productId));
        alert('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  // Add sample products for testing
  const addSampleProducts = async () => {
    try {
      for (const product of sampleProducts) {
        const productRef = ref(database, `public/products/${product.id}`);
        await set(productRef, {
          name: product.name,
          type: product.type,
          price: product.price,
          quantity: product.quantity,
          description: product.description,
          image: product.image
        });
      }
      
      alert('Sample products added successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error adding sample products:', error);
      alert('Failed to add sample products.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-blue-400">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleAddNewProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add New Product
          </button>
        </div>
        
        {error && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <p className="text-yellow-400 mb-4">{error}</p>
            <div className="flex gap-4">
              <button
                onClick={handleAddNewProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Add First Product
              </button>
              <button
                onClick={addSampleProducts}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Add Sample Products
              </button>
            </div>
          </div>
        )}
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                <div className="relative h-64 w-full">
                  <Image
                    src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-white">{product.name}</h2>
                    <span className="px-2 py-1 bg-blue-900 text-blue-200 text-sm rounded-full">
                      {product.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-white">₹{product.price}</span>
                    <span className="text-sm text-gray-400">Stock: {product.quantity}</span>
                  </div>
                  
                  {/* Admin action buttons */}
                  <div className="flex justify-between gap-2 mt-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !error && (
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <p className="text-white text-xl mb-4">No products available</p>
            <button
              onClick={handleAddNewProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
