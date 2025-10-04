import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { OrdersApi } from '../services/api';
import { useState } from 'react';
import { Spinner } from '../components/Spinner';

const CartPage = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      setPlacingOrder(true);
      setError(null);
      const payload = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price
        }))
      };
      await OrdersApi.create(payload);
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Your cart is empty</h2>
        <p className="mt-2 text-sm text-slate-500">Browse our catalogue and add items to your cart.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Shopping cart</h1>
        <ul className="space-y-4">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">No image</div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-sm text-slate-500">${product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-500">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => updateQuantity(product.id, Number(event.target.value))}
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                  <button
                    className="text-sm font-medium text-red-500 hover:text-red-600"
                    onClick={() => removeItem(product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
          <div className="flex justify-between text-sm text-slate-500">
            <span>Items ({totalItems})</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" onClick={handleCheckout} disabled={placingOrder}>
          {placingOrder ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Processing...
            </span>
          ) : (
            'Checkout'
          )}
        </button>
      </aside>
    </div>
  );
};

export default CartPage;
