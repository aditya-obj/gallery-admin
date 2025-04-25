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
  const [previewMode, setPreviewMode] = useState(false);
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
    setPreviewMode(false);
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
            <div className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
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

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preview</h2>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {previewMode ? 'Show Details' : 'Show Card'}
              </button>
            </div>

            <div className="relative perspective-1000">
              <div
                className={`
                  transition-all duration-700 transform-style-3d relative w-full
                  ${previewMode ? 'rotate-y-0' : 'rotate-y-180'}
                `}
              >
                {/* Card View (Front) */}
                <div
                  className={`
                    backface-hidden absolute w-full
                    ${previewMode ? 'visible' : 'invisible'}
                  `}
                >
                  <div className="bg-gray-900 rounded-xl overflow-hidden">
                    {formData.image && (
                      <div className="relative h-64 w-full">
                        <Image
                          src={formData.image}
                          alt={formData.name || 'Product preview'}
                          fill
                          className="object-cover"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL'}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold text-white">{formData.name || 'Product Name'}</h2>
                        <span className="px-4 py-1 bg-blue-700 text-white rounded-full text-sm">
                          {formData.type || 'Category'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-lg mb-4">
                        {formData.description || 'Product description'}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-3xl font-bold text-white">${formData.price || '0.00'}</span>
                        <span className="text-gray-400">
                          Stock: {formData.quantity || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details View (Back) */}
                <div
                  className={`
                    backface-hidden absolute w-full rotate-y-180
                    ${previewMode ? 'invisible' : 'visible'}
                  `}
                >
                  <div className="space-y-4">
                    <pre className="whitespace-pre-wrap break-words text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      {JSON.stringify(formData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
