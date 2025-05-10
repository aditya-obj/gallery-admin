'use client';
import { sampleProducts } from '@/app/data/sampleProducts';
import { database } from '@/config/firebase';
import { get, push, ref, remove, set } from 'firebase/database';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productKey: null, productName: '' });
  const router = useRouter();

  // load all products once
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsRef = ref(database, 'public/products');
        const snapshot = await get(productsRef);

        if (!snapshot.exists()) {
          setError("No products found. Add your first product!");
          return;
        }

        // snapshot.val() is an object: { key1: {...}, key2: {...}, … }
        const data = snapshot.val();
        const list = Object.entries(data).map(([key, payload]) => ({
          key,
          ...payload,
        }));
        setProducts(list);

      } catch (err) {
        console.error('Error loading products:', err);
        setError(`Failed to load products: ${err.message}`);
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
    // Make sure we're passing the key as the id for Firebase
    const productToEdit = {
      ...product,
      id: product.key // Ensure the Firebase key is used as the id
    };
    
    console.log('Editing product:', productToEdit);
    localStorage.setItem('editProduct', JSON.stringify(productToEdit));
    router.push('/admin/add-product');
  };

  const openDeleteModal = (key, name) => {
    setDeleteModal({ isOpen: true, productKey: key, productName: name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, productKey: null, productName: '' });
  };

  const handleDelete = async () => {
    const key = deleteModal.productKey;
    if (!key) return;
    
    const path = `public/products/${key}`;
    console.log('Deleting node at:', path);
    try {
      await remove(ref(database, path));
      console.log('✅ remove() succeeded');
      setProducts((curr) => curr.filter((p) => p.key !== key));
      closeDeleteModal();
    } catch (err) {
      console.error('❌ remove() failed:', err);
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const addSampleProducts = async () => {
    try {
      const baseRef = ref(database, 'public/products');

      for (const product of sampleProducts) {
        // push() generates a brand-new key and returns its ref
        const newRef = push(baseRef);
        await set(newRef, {
          name:        product.name,
          type:        product.type,
          price:       product.price,
          quantity:    product.quantity,
          description: product.description,
          image:       product.image,
        });
      }

      alert('Sample products added!');
      // reload from Firebase
      setLoading(true);
      setError(null);
      const snap = await get(ref(database, 'public/products'));
      if (snap.exists()) {
        const list = Object.entries(snap.val()).map(([key, payload]) => ({
          key,
          ...payload,
        }));
        setProducts(list);
      }
    } catch (err) {
      console.error('Error adding samples:', err);
      alert(`Could not add sample products: ${err.message}`);
    } finally {
      setLoading(false);
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleAddNewProduct}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Product
          </button>
        </div>

        {error && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg border border-gray-700">
            <p className="text-yellow-400 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddNewProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all hover:shadow-lg"
              >
                Add First Product
              </button>
              <button
                onClick={addSampleProducts}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-all hover:shadow-lg"
              >
                Add Sample Products
              </button>
            </div>
          </div>
        )}

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.key} 
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col h-full transition-shadow hover:shadow-xl"
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-blue-900 text-blue-200 text-sm rounded-full shadow-md">
                      {product.type}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold text-white mb-2 line-clamp-1">{product.name}</h2>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-white">₹{product.price}</span>
                    <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-full">Stock: {product.quantity}</span>
                  </div>
                  <div className="flex justify-between gap-3 mt-auto">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow-md transition-colors hover:shadow-lg flex items-center justify-center cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(product.key, product.name)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm shadow-md transition-colors hover:shadow-lg flex items-center justify-center cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !error && (
            <div className="bg-gray-800 rounded-xl p-8 text-center shadow-lg border border-gray-700">
              <div className="flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-white text-xl mb-4">No products available</p>
                <button
                  onClick={handleAddNewProduct}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Your First Product
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 z-40"
            onClick={closeDeleteModal}
          ></div>
          
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <div 
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl pointer-events-auto border border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold text-white">{deleteModal.productName}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
