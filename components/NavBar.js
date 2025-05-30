'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleLogoutClick = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">E-commerce</Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href="/admin" 
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Admin
              </Link>
              <button
                onClick={handleLogoutClick}
                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLoginClick}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
