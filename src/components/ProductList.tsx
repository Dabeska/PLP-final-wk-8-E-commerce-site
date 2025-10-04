import type { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  emptyState?: React.ReactNode;
}

const ProductList = ({ products, emptyState }: ProductListProps) => {
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        {emptyState ?? 'No products found.'}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
