import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductsApi } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Spinner } from '../components/Spinner';

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const data = await ProductsApi.get(productId);
        setProduct(data.product ?? data);
      } catch (err) {
        setError('Unable to load product.');
      } finally {
        setLoading(false);
      }
    };
    void fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
        {error ?? 'Product not found.'}
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex aspect-square items-center justify-center text-slate-400">Image coming soon</div>
        )}
      </div>
      <div className="space-y-6">
        <div>
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase text-primary-600">
            {product.category?.name ?? 'Category'}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{product.name}</h1>
        </div>
        <p className="text-lg text-slate-600">{product.description}</p>
        <p className="text-3xl font-semibold text-primary-600">${product.price.toFixed(2)}</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <button className="btn-primary flex-1" onClick={() => addItem(product)}>
            Add to cart
          </button>
          <button className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:text-primary-600">
            Add to wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
