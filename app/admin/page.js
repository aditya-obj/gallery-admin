'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Admin() {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'Electronics',
    price: '',
    quantity: '',
    description: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Check if there's a product to edit in localStorage
    const editProduct = localStorage.getItem('editProduct');
    if (editProduct) {
      const product = JSON.parse(editProduct);
      setFormData(product);
      setIsEditMode(true);
      // Clear localStorage after loading
      localStorage.removeItem('editProduct');
    }
  }, []);

  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.price || formData.price <= 0) return 'Valid price is required';
    if (!formData.quantity || formData.quantity <= 0) return 'Valid quantity is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.image.trim()) return 'Image URL is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    
    if (error) {
      setMessage({ type: 'error', content: error });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: 'info', content: isEditMode ? 'Updating product...' : 'Adding product...' });

    try {
      const endpoint = isEditMode ? `/api/products/${formData.id}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save product');

      setMessage({ 
        type: 'success', 
        content: isEditMode ? 'Product updated successfully!' : 'Product added successfully!' 
      });
      
      if (!isEditMode) handleClear();
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        content: isEditMode ? 'Failed to update product. Please try again.' : 'Failed to add product. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage({ type: '', content: '' });
  };

  const handleClear = () => {
    setFormData({
      id: '',
      name: '',
      type: 'Electronics',
      price: '',
      quantity: '',
      description: '',
      image: ''
    });
    setMessage({ type: '', content: '' });
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product ID</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Leave empty for auto-generated ID"
                disabled={isEditMode} // Disable editing ID if in edit mode
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Food">Food</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
          </div>

          {message.content && (
            <div className={`p-4 rounded-lg ${
              message.type === 'error' ? 'bg-red-100 text-red-700' :
              message.type === 'success' ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {message.content}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Product' : 'Add Product')}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
