import { useEffect, useState } from 'react';
import ProductList from '../components/ProductList';
import { ProductsApi } from '../services/api';
import type { Product } from '../types';
import { Spinner } from '../components/Spinner';

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await ProductsApi.list();
        setProducts(fetchedProducts);
        setError(null);
      } catch (err) {
        setError('Unable to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await ProductsApi.list();
      setProducts(fetchedProducts);
    } catch (err) {
      setError('Unable to load products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Spinner />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 animate-pulse rounded-full bg-blue-500"></div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-slate-700">Loading amazing products</p>
              <p className="text-sm text-slate-500">Just a moment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="rounded-full bg-red-100 p-4">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-center space-y-4 max-w-md">
              <h3 className="text-xl font-semibold text-slate-900">Oops! Something went wrong</h3>
              <p className="text-slate-600">{error}</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto px-4 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-4">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            Fresh arrivals every week
          </div>
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl lg:text-6xl bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
            Discover Our Latest Drops
          </h1>
          <p className="text-lg text-slate-600 sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Browse curated products across categories and find your next favorite piece. 
            Quality meets style in every item.
          </p>
        </div>

        {/* Products Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
              <p className="text-slate-500">
                {products.length} amazing product{products.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          <ProductList 
            products={products} 
            emptyState={
              <div className="text-center space-y-4 py-16">
                <div className="rounded-full bg-slate-100 p-6 inline-flex">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">No products available</h3>
                  <p className="text-slate-500">Products will appear here soon. Check back later!</p>
                </div>
              </div>
            } 
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;