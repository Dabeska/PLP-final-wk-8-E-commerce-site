import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <div className="card flex flex-col">
      <Link to={`/products/${product.id}`} className="aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">No image</div>
        )}
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </h3>
          <p className="text-lg font-semibold text-primary-600">${product.price.toFixed(2)}</p>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{product.description}</p>
        <div className="mt-auto pt-4">
          <button type="button" className="btn-primary w-full gap-2" onClick={() => addItem(product)}>
            <ShoppingCartIcon className="h-5 w-5" />
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
