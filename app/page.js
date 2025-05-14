

'use client';
import { database } from '@/config/firebase';
import { get, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { isVideoUrl, isYoutubeUrl, getYoutubeEmbedUrl } from '@/app/utils/mediaHelpers';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'All Categories',
    maxPrice: 1000
  });
  // Add state to track active slides and hover status
  const [activeSlides, setActiveSlides] = useState({});
  const [pausedSlides, setPausedSlides] = useState({});
  const [hoveredCards, setHoveredCards] = useState({});

  // Add effect to handle automatic slideshow for dots
  useEffect(() => {
    // Create timers for each product with multiple images
    const timers = {};
    
    products.forEach(product => {
      if (product.images && product.images.length > 1 && hoveredCards[product.id]) {
        // Set up a timer for this product's slideshow only if card is hovered
        timers[product.id] = setInterval(() => {
          // Only advance the slide if not paused
          if (!pausedSlides[product.id]) {
            setActiveSlides(prev => {
              const currentIndex = prev[product.id] !== undefined ? prev[product.id] : 0;
              const nextIndex = (currentIndex + 1) % product.images.length;
              return {
                ...prev,
                [product.id]: nextIndex
              };
            });
          }
        }, 2000); // Change slide every 2 seconds
      }
    });
    
    // Clean up timers on unmount
    return () => {
      Object.values(timers).forEach(timer => clearInterval(timer));
    };
  }, [products, pausedSlides, hoveredCards]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsRef = ref(database, 'public/products');
        const snapshot = await get(productsRef);
        if (snapshot.exists()) {
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

  // Calculate max price for slider
  const maxPossiblePrice = Math.max(...products.map(p => p.price || 0), 1000);
  
  // Update maxPrice if it's higher than current filter
  useEffect(() => {
    if (maxPossiblePrice > filters.maxPrice) {
      setFilters(prev => ({ ...prev, maxPrice: maxPossiblePrice }));
    }
  }, [maxPossiblePrice]);

  const categories = ['All Categories', ...new Set(products.map(p => p.type).filter(Boolean))];
  
  const filteredProducts = products.filter(product => {
    return (
      product.name?.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.type === 'All Categories' || product.type === filters.type) &&
      product.price <= filters.maxPrice
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            {/* Simple spinner */}
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            
            <h2 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Loading Products</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center">Just a moment while we get things ready</p>
          </div>
        </div>
      </div>
    );
  }

  // Function to handle dot navigation
  const handleDotClick = (productId, slideIndex) => {
    setActiveSlides(prev => ({
      ...prev,
      [productId]: slideIndex
    }));
  };

  // Function to handle pause/resume of slideshow
  const handleSlideshowPause = (productId, isPaused) => {
    setPausedSlides(prev => ({
      ...prev,
      [productId]: isPaused
    }));
  };

  // Function to handle card hover
  const handleCardHover = (productId, isHovered) => {
    setHoveredCards(prev => ({
      ...prev,
      [productId]: isHovered
    }));
    
    // Reset to first image when leaving the card
    if (!isHovered) {
      setActiveSlides(prev => ({
        ...prev,
        [productId]: 0
      }));
      // Also reset the paused state when leaving the card
      setPausedSlides(prev => ({
        ...prev,
        [productId]: false
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 py-10 sm:py-16">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">Discover Amazing Products</h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 px-2">Find the perfect items for your needs at competitive prices</p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 pr-10 sm:pr-12 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 shadow-md text-sm sm:text-base"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Mobile Filters Toggle */}
        <div className="md:hidden mb-6">
          <button 
            onClick={() => document.getElementById('mobile-filters').classList.toggle('hidden')}
            className="w-full py-3 px-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-between"
          >
            <span className="text-gray-800 dark:text-white font-medium">Filters</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Filters and Products */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 sm:mb-12">
          {/* Filters - Mobile Collapsible, Desktop Always Visible */}
          <div id="mobile-filters" className="hidden md:block md:w-1/4 bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6">Filters</h3>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Category Filter */}
              <div>
                <label className="block text-gray-600 dark:text-gray-300 mb-2 font-medium text-sm sm:text-base">Category</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 text-sm sm:text-base"
                >
                  {categories.map((category, index) => (
                    <option key={`category-${index}`} value={category} className="bg-white dark:bg-gray-700">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price Range */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-gray-600 dark:text-gray-300 font-medium text-sm sm:text-base">Price Range</label>
                  <span className="text-gray-800 dark:text-white font-medium text-sm sm:text-base">₹{filters.maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxPossiblePrice}
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span>₹0</span>
                  <span>₹{maxPossiblePrice}</span>
                </div>
              </div>
              
              {/* Reset Button */}
              <button
                onClick={() => {
                  setFilters({search: '', type: 'All Categories', maxPrice: maxPossiblePrice});
                  // Hide mobile filters after reset
                  if (window.innerWidth < 768) {
                    document.getElementById('mobile-filters').classList.add('hidden');
                  }
                }}
                className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="md:w-3/4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                  <div 
                    key={`product-${product.id}`} 
                    className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                    onMouseEnter={() => handleCardHover(product.id, true)}
                    onMouseLeave={() => handleCardHover(product.id, false)}
                  >
                    <div 
                      className="relative h-48 sm:h-56 overflow-hidden group bg-white dark:bg-gray-700"
                      onMouseEnter={() => handleSlideshowPause(product.id, true)}
                      onMouseLeave={() => handleSlideshowPause(product.id, false)}
                    >
                      {/* Media Slider (Images and Videos) */}
                      {(product.images && product.images.length > 0) ? (
                        <>
                          {product.images.map((mediaUrl, index) => (
                            <div 
                              key={`media-${index}`}
                              className={`absolute inset-0 transition-opacity duration-500 ease-in-out 
                                        bg-white dark:bg-gray-700
                                        ${(activeSlides[product.id] === index || (!activeSlides[product.id] && index === 0)) 
                                          ? 'opacity-100' : 'opacity-0'}`}
                            >
                              {isVideoUrl(mediaUrl) ? (
                                <div 
                                  className="w-full h-full flex items-center justify-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {isYoutubeUrl(mediaUrl) ? (
                                    <iframe 
                                      src={getYoutubeEmbedUrl(mediaUrl)}
                                      title={`${product.name} - video ${index + 1}`}
                                      className="w-full h-full"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    ></iframe>
                                  ) : (
                                    <video 
                                      src={mediaUrl}
                                      className="w-full h-full object-contain"
                                      controls
                                      muted
                                      playsInline
                                      onMouseOver={(e) => e.target.play()}
                                      onMouseOut={(e) => e.target.pause()}
                                    ></video>
                                  )}
                                </div>
                              ) : (
                                <img 
                                  src={mediaUrl} 
                                  alt={`${product.name} - image ${index + 1}`}
                                  className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                                />
                              )}
                            </div>
                          ))}
                          
                          {/* Navigation Dots */}
                          {product.images.length > 1 && (
                            <div className="nav-dots">
                              {product.images.map((_, index) => (
                                <div 
                                  key={`dot-${index}`}
                                  className={`nav-dot ${(activeSlides[product.id] === index || (!activeSlides[product.id] && index === 0)) ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDotClick(product.id, index);
                                  }}
                                ></div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        isVideoUrl(product.image) ? (
                          <div className="w-full h-full flex items-center justify-center">
                            {isYoutubeUrl(product.image) ? (
                              <iframe 
                                src={getYoutubeEmbedUrl(product.image)}
                                title={product.name}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <video 
                                src={product.image}
                                className="w-full h-full object-contain"
                                controls
                                muted
                                playsInline
                                onMouseOver={(e) => e.target.play()}
                                onMouseOut={(e) => e.target.pause()}
                              ></video>
                            )}
                          </div>
                        ) : (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105 bg-white dark:bg-gray-700"
                          />
                        )
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 sm:px-3 py-1 bg-indigo-500/90 text-white text-xs font-medium rounded-full shadow-sm">
                          {product.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-1 sm:mb-2 line-clamp-1">{product.name}</h2>
                      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-grow">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">₹{product.price}</span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full">
                          Stock: {product.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700 shadow-md">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 dark:text-gray-500 mb-4 sm:mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-800 dark:text-white text-lg sm:text-xl mb-4 sm:mb-6">No products match your filters</p>
                  <button
                    onClick={() => setFilters({search: '', type: 'All Categories', maxPrice: maxPossiblePrice})}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-md flex items-center cursor-pointer text-sm sm:text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
