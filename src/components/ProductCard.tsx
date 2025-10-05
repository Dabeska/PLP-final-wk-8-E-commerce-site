import { Link } from 'react-router-dom';
import { ShoppingCartIcon, HeartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const imageSrc = product.imageUrl && !imageError 
    ? product.imageUrl 
    : 'https://images.unsplash.com/photo-1560769684-5503c4fc5fa4?w=500&h=500&fit=crop&auto=format';

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      addItem(product);
      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 600));
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Wishlist Button */}
      <button
        onClick={() => setIsWishlisted(!isWishlisted)}
        className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110 hover:shadow-lg"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isWishlisted ? (
          <HeartSolidIcon className="h-5 w-5 text-red-500" />
        ) : (
          <HeartIcon className="h-5 w-5 text-slate-600 transition-colors group-hover:text-red-400" />
        )}
      </button>

      {/* Quick View Button */}
      <button
        onMouseEnter={() => setShowQuickView(true)}
        onMouseLeave={() => setShowQuickView(false)}
        className="absolute left-3 top-3 z-20 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 hover:shadow-lg"
        aria-label="Quick view"
      >
        <EyeIcon className="h-5 w-5 text-slate-600" />
      </button>

      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        <Link 
          to={`/products/${product.id}`} 
          className="block h-full w-full"
        >
          {/* Loading Skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 animate-pulse bg-slate-300" />
          )}
          
          {/* Product Image */}
          <img 
            src={imageSrc}
            alt={product.name}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          
          {/* Quick View Overlay */}
          <div 
            className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-all duration-300 ${
              showQuickView ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="rounded-full bg-white px-6 py-3 font-medium text-slate-900 shadow-lg">
              Quick View
            </span>
          </div>
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category Tag */}
        {product.category && (
          <span className="mb-2 inline-block self-start rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            {String(product.category)}
          </span>
        )}

        {/* Name and Price */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <Link 
            to={`/products/${product.id}`}
            className="group/title flex-1"
          >
            <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover/title:text-blue-600 line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex flex-col items-end gap-1">
            <p className="text-xl font-bold text-slate-900">
              ${product.price.toFixed(2)}
            </p>
      
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-slate-600 leading-relaxed">
          {product.description}
        </p>

      

        {/* Add to Cart Button */}
        <div className="mt-auto pt-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`relative w-full gap-3 overflow-hidden rounded-xl py-3 px-4 font-semibold text-white transition-all duration-300 ${
              isAddingToCart
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg active:scale-95'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {/* Button Content */}
            <div className={`flex items-center justify-center gap-2 transition-all duration-300 ${
              isAddingToCart ? 'opacity-0' : 'opacity-100'
            }`}>
              <ShoppingCartIcon className="h-5 w-5" />
              Add to Cart
            </div>

            {/* Loading State */}
            {isAddingToCart && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Added!</span>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;