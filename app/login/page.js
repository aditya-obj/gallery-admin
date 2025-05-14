'use client';
import { database } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { get, ref } from 'firebase/database';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const logoRef = ref(database, 'settings/logo');
        const snapshot = await get(logoRef);
        
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchLogo();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Invalid credentials');

      const data = await response.json();
      login(data.user);
      router.push('/admin');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-900 flex flex-col md:flex-row">
      {/* Left Section - Welcome Message with Background Image */}
      <div className="w-full md:w-1/2 relative flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Background" 
            className="w-full h-full object-cover opacity-40"
            fill
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="max-w-md mx-auto px-6 md:px-12 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Welcome</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
              Back
            </span>
          </h1>
          
          <p className="text-blue-100/90 text-lg mb-8">
            Sign in to your account to access your personalized dashboard and continue your journey.
          </p>
          
          {/* Trust Indicators */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg">
                <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-blue-100">Secure Authentication</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg">
                <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-blue-100">Protected Data</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg">
                <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <span className="text-blue-100">Biometric Support</span>
            </div>
          </div>
          
          
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full md:w-1/2 bg-gray-900 p-6 md:p-12 flex items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Sign in
            </h2>
            <p className="text-gray-400">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-700 
                             bg-gray-800/80 text-white 
                             placeholder-gray-500
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-700 
                             bg-gray-800/80 text-white 
                             placeholder-gray-500
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-900/30 border border-red-800">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-red-200">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 
                       text-white font-semibold rounded-lg 
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </div>
              ) : (
                "Login"
              )}
            </button>

            <div className="text-center">
              <Link 
                href="/" 
                className="text-sm text-blue-400 hover:text-blue-300 font-medium hover:underline cursor-pointer"
              >
                Return to homepage
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
