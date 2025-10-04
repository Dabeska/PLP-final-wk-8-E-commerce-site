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
        const data = await ProductsApi.list();
        setProducts(data.products ?? data);
      } catch (err) {
        setError('Unable to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Discover our latest drops</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          Browse curated products across categories and find your next favourite piece.
        </p>
      </div>
      <ProductList products={products} emptyState="Products will appear soon." />
    </div>
  );
};

export default HomePage;
