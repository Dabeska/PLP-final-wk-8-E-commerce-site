import { useState, useEffect } from 'react';
import type { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  emptyState?: React.ReactNode;
}

const ProductList = ({ products, emptyState }: ProductListProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!products.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 backdrop-blur-sm p-16 text-center text-slate-500 transition-all duration-300 hover:border-slate-400 hover:bg-white/70">
        {emptyState ?? (
          <div className="space-y-4">
            <svg className="h-12 w-12 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
            </svg>
            <p className="text-lg font-medium text-slate-600">No products found</p>
            <p className="text-sm text-slate-500">Try adjusting your search or check back later</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          className="transition-all duration-300 hover:scale-105"
          style={{
            animationDelay: `${index * 100}ms`,
            animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 100}ms both` : 'none'
          }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};


export default ProductList;