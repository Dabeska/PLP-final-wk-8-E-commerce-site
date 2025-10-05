import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { OrdersApi } from '../services/api';
import { useState } from 'react';
import { Spinner } from '../components/Spinner';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon, 
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const CartPage = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      setPlacingOrder(true);
      setError(null);

      const orderItems = items.map((item) => {
        const numericProductId = Number(item.product.id);
        return {
          product_id: Number.isNaN(numericProductId) ? item.product.id : numericProductId,
          quantity: item.quantity,
          price: Number(item.product.price)
        };
      });

      const payload = {
        total_price: Number(totalPrice.toFixed(2)),
        order_items: orderItems
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

  const handleRemoveItem = async (productId: string) => {
    setRemovingItem(productId);
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    removeItem(productId);
    setRemovingItem(null);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const shippingEstimate = 5.99;
  const taxEstimate = totalPrice * 0.08;
  const finalTotal = totalPrice + shippingEstimate + taxEstimate;

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="mx-auto w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-8">
              <ShoppingBagIcon className="h-24 w-24 text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
              <p className="text-slate-600 mt-2">
                {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Cart Items */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <ul className="divide-y divide-slate-200">
                {items.map(({ product, quantity }) => (
                  <li 
                    key={product.id} 
                    className={`p-6 transition-all duration-300 ${
                      removingItem === product.id ? 'opacity-50 scale-95' : 'opacity-100'
                    }`}
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="h-24 w-24 rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="h-full w-full object-cover transition-transform hover:scale-105" 
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <ShoppingBagIcon className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="flex justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 truncate">
                              {product.name}
                            </h3>
                            <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                              {product.description}
                            </p>
                            <p className="text-xl font-bold text-slate-900 mt-2">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(product.id)}
                            disabled={removingItem === product.id}
                            className="flex-shrink-0 h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            aria-label="Remove item"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-700">Quantity:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(product.id, quantity - 1)}
                                disabled={quantity <= 1}
                                className="h-8 w-8 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              <span className="w-12 text-center font-semibold text-slate-900">
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(product.id, quantity + 1)}
                                className="h-8 w-8 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">
                              ${(product.price * quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>${shippingEstimate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span>${taxEstimate.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-slate-900">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-4 text-sm text-slate-500 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="h-4 w-4" />
                    <span>Free shipping over $50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span>Secure checkout</span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3">
                    <div className="rounded-full bg-red-100 p-1">
                      <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={placingOrder}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                >
                  {placingOrder ? (
                    <div className="flex items-center justify-center gap-3">
                      <Spinner />
                      Processing Order...
                    </div>
                  ) : (
                    `Checkout - $${finalTotal.toFixed(2)}`
                  )}
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => navigate('/')}
                  className="w-full border-2 border-slate-300 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Secure checkout</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Your payment information is encrypted and secure. We never share your details with third parties.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;