'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProductCard({ product, isAdmin = false }) {
  const router = useRouter();

  const handleEdit = () => {
    localStorage.setItem('editProduct', JSON.stringify(product));
    router.push('/admin/add-product');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${product.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }
        window.location.reload();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative h-64 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        {/* Admin Buttons */}
        {isAdmin && (
          <div className="flex justify-end gap-2 mb-4">
            <button 
              onClick={handleEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Edit
            </button>
            <button 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Delete
            </button>
          </div>
        )}

        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h2>
          <span className="px-4 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
            {product.type}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">${product.price}</span>
          <span className="text-gray-600 dark:text-gray-400">Stock: {product.quantity}</span>
        </div>
      </div>
    </div>
  );
}
