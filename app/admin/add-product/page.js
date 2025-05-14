'use client';
import { database } from '@/config/firebase';
import { get, ref, set } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AddProduct() {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: '',
    price: '',
    quantity: '',
    description: '',
    images: [''] // Changed from 'image' to 'images' array
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newType, setNewType] = useState('');
  const router = useRouter();

  // Fetch all existing product types
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const productsRef = ref(database, 'public/products');
        const snapshot = await get(productsRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const types = Object.values(data)
            .map(product => product.type)
            .filter(Boolean); // Filter out any null or undefined values
          
          // Get unique types
          const uniqueTypes = [...new Set(types)].sort();
          
          console.log('Fetched product types:', uniqueTypes);
          setProductTypes(uniqueTypes);
        }
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
    };

    fetchProductTypes();
  }, []);

  // Check if we're in edit mode and load product data
  useEffect(() => {
    const loadEditProduct = () => {
      try {
        const editProductData = localStorage.getItem('editProduct');
        if (editProductData) {
          const product = JSON.parse(editProductData);
          console.log('Loading product for edit:', product);
          
          // Set form data with the product values
          setFormData({
            id: product.id || product.key || '', // Use id or key, whichever is available
            name: product.name || '',
            type: product.type || '',
            price: product.price ? product.price.toString() : '',
            quantity: product.quantity ? product.quantity.toString() : '',
            description: product.description || '',
            // Handle both single image string and array of images
            images: Array.isArray(product.images) ? product.images : 
                   (product.image ? [product.image] : [''])
          });
          
          setIsEditMode(true);
          
          // Clear localStorage after loading
          localStorage.removeItem('editProduct');
        }
      } catch (error) {
        console.error('Error loading product for edit:', error);
      }
    };

    loadEditProduct();
  }, []);

  const handleTypeChange = (e) => {
    const value = e.target.value;
    if (value === 'new_type') {
      setShowNewTypeInput(true);
      setFormData(prev => ({ ...prev, type: '' }));
    } else {
      setShowNewTypeInput(false);
      setFormData(prev => ({ ...prev, type: value }));
    }
  };

  const handleNewTypeChange = (e) => {
    const value = e.target.value;
    setNewType(value);
    setFormData(prev => ({ ...prev, type: value }));
  };

  // Handle image URL changes
  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
    setMessage({ type: '', content: '' });
  };

  // Add a new image input field
  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  // Remove an image input field
  const removeImageField = (index) => {
    if (formData.images.length <= 1) return; // Keep at least one image field
    
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.type.trim()) return 'Product type is required';
    if (!formData.price || formData.price <= 0) return 'Valid price is required';
    if (!formData.quantity || formData.quantity <= 0) return 'Valid quantity is required';
    if (!formData.description.trim()) return 'Description is required';
    
    // Check if at least one image URL is provided and valid
    if (!formData.images.some(img => img.trim())) {
      return 'At least one image URL is required';
    }
    
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
      // Filter out empty image URLs
      const filteredImages = formData.images.filter(img => img.trim());
      
      // Prepare product data
      const productData = {
        name: formData.name,
        type: formData.type,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        description: formData.description,
        images: filteredImages,
        image: filteredImages[0] // Keep first image as main image for backward compatibility
      };
      
      // If ID is provided, use it, otherwise generate one
      let productId = formData.id.trim();
      
      if (productId) {
        // Use provided ID - update existing product
        const productRef = ref(database, `public/products/${productId}`);
        
        // Add the ID to the product data
        productData.id = productId;
        
        // Update the product
        await set(productRef, productData);
        setMessage({ type: 'success', content: 'Product updated successfully!' });
      } else {
        // Generate ID
        const newKey = Date.now().toString(); // Generate a timestamp-based key
        const newProductRef = ref(database, `public/products/${newKey}`);
        
        // Add the ID to the product data
        productData.id = newKey;
        
        // Create new product
        await set(newProductRef, productData);
        setMessage({ type: 'success', content: 'Product added successfully!' });
      }

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage({ type: 'error', content: `Failed to ${isEditMode ? 'update' : 'add'} product. Please try again.` });
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

  const handleCancel = () => {
    router.push('/admin');
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
                value={showNewTypeInput ? 'new_type' : formData.type}
                onChange={handleTypeChange}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                <option value="" disabled>Select a product type</option>
                {productTypes.map((type, index) => (
                  <option key={`type-${index}`} value={type}>{type}</option>
                ))}
                <option value="new_type">+ Add New Type</option>
              </select>
              
              {showNewTypeInput && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={newType}
                    onChange={handleNewTypeChange}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter new product type"
                    required
                  />
                </div>
              )}
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
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Images</label>
                <button
                  type="button"
                  onClick={addImageField}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-sm font-medium cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Image
                </button>
              </div>
              
              {formData.images.map((image, index) => (
                <div key={`image-${index}`} className="flex items-center gap-2 mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="https://example.com/image.jpg"
                    required={index === 0} // Only the first image is required
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                First image will be used as the main product image
              </p>
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
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Product' : 'Add Product')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
