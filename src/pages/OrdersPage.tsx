import { useEffect, useMemo, useState } from 'react';
import { OrdersApi } from '../services/api';
import type { Order } from '../types';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBagIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const fetchedOrders = await OrdersApi.list();
        setOrders(fetchedOrders);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Unable to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  );

  const getStatusConfig = (statusName?: string) => {
    const status = (statusName ?? '').toLowerCase();
    
    switch (status) {
      case 'completed':
      case 'delivered':
        return {
          color: 'text-green-700 bg-green-100 border-green-200',
          icon: CheckCircleSolidIcon,
          label: 'Delivered'
        };
      case 'approved':
      case 'confirmed':
        return {
          color: 'text-blue-700 bg-blue-100 border-blue-200',
          icon: CheckCircleIcon,
          label: 'Confirmed'
        };
      case 'shipped':
      case 'processing':
        return {
          color: 'text-purple-700 bg-purple-100 border-purple-200',
          icon: TruckIcon,
          label: 'Shipped'
        };
      case 'cancelled':
      case 'canceled':
        return {
          color: 'text-red-700 bg-red-100 border-red-200',
          icon: XMarkIcon,
          label: 'Cancelled'
        };
      case 'pending':
      default:
        return {
          color: 'text-yellow-700 bg-yellow-100 border-yellow-200',
          icon: ClockIcon,
          label: statusName || 'Processing'
        };
    }
  };

  const canCancelOrder = (order: Order) => {
    if (!user) {
      return false;
    }
    const statusName = (order.status?.name ?? '').toLowerCase();
    return !['cancelled', 'canceled', 'approved', 'completed', 'shipped', 'delivered'].includes(statusName);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setActionError(null);
      setCancellingOrderId(orderId);
      const updated = await OrdersApi.cancel(orderId);
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
      setShowCancelConfirm(null);
    } catch (err) {
      console.error(err);
      setActionError('Unable to cancel order. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getTotalItems = (order: Order) => {
    return order.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await OrdersApi.list();
        setOrders(fetchedOrders);
      } catch (err) {
        setError('Unable to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    void fetchOrders();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Spinner />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 animate-pulse rounded-full bg-blue-500"></div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-slate-700">Loading your orders</p>
              <p className="text-sm text-slate-500">Fetching your purchase history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="rounded-full bg-red-100 p-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center space-y-4 max-w-md">
              <h3 className="text-xl font-semibold text-slate-900">Unable to load orders</h3>
              <p className="text-slate-600">{error}</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sortedOrders.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="mx-auto w-48 h-48 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mb-8">
              <ShoppingBagIcon className="h-24 w-24 text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">No orders yet</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              When you place your first order, it will appear here with all the details and tracking information.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Orders</h1>
          <p className="text-slate-600">
            {sortedOrders.length} order{sortedOrders.length !== 1 ? 's' : ''} in total
          </p>
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 mb-6 flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Action failed</p>
              <p className="text-red-600 text-sm mt-1">{actionError}</p>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {sortedOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status?.name);
            const StatusIcon = statusConfig.icon;
            const totalItems = getTotalItems(order);
            
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                {/* Order Header */}
                <div className="p-6 border-b border-slate-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-slate-600">
                        {totalItems} item{totalItems !== 1 ? 's' : ''} • ${order.total.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => setShowCancelConfirm(order.id)}
                          disabled={cancellingOrderId === order.id}
                          className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {(order.items ?? []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                            {item.product?.imageUrl ? (
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <ShoppingBagIcon className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-slate-900 truncate">
                              {item.product?.name ?? 'Product'}
                            </h4>
                            <p className="text-sm text-slate-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-slate-500">
                            ${item.unitPrice.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Cancel Order?</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCancelConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={() => handleCancelOrder(showCancelConfirm)}
                  disabled={cancellingOrderId === showCancelConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {cancellingOrderId === showCancelConfirm ? (
                    <>
                      <Spinner />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;