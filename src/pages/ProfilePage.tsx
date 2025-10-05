import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { OrdersApi } from '../services/api';
import type { Order } from '../types';
import { Spinner } from '../components/Spinner';
import {
  UserCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XMarkIcon,
  ArrowPathIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

const ProfilePage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOrdersTab, setActiveOrdersTab] = useState<'recent' | 'all'>('recent');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await OrdersApi.list();
        // Normalize response: OrdersApi.list may return Order[] or { orders: Order[] }.
        if (Array.isArray(data)) {
          setOrders(data);
        } else if ((data as any)?.orders && Array.isArray((data as any).orders)) {
          setOrders((data as any).orders);
        } else {
          setOrders([]);
        }
        setError(null);
      } catch (err) {
        setError('Unable to load your orders at the moment. Please try again later.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    void fetchOrders();
  }, []);

  const getStatusConfig = (statusName?: string) => {
    const status = (statusName ?? '').toLowerCase();
    
    switch (status) {
      case 'completed':
      case 'delivered':
        return {
          color: 'text-green-700 bg-green-100 border-green-200',
          icon: CheckCircleSolidIcon,
        };
      case 'approved':
      case 'confirmed':
        return {
          color: 'text-blue-700 bg-blue-100 border-blue-200',
          icon: CheckCircleIcon,
        };
      case 'shipped':
      case 'processing':
        return {
          color: 'text-purple-700 bg-purple-100 border-purple-200',
          icon: TruckIcon,
        };
      case 'cancelled':
      case 'canceled':
        return {
          color: 'text-red-700 bg-red-100 border-red-200',
          icon: XMarkIcon,
        };
      case 'pending':
      default:
        return {
          color: 'text-yellow-700 bg-yellow-100 border-yellow-200',
          icon: ClockIcon,
        };
    }
  };

  const getTotalItems = (order: Order) => {
    return order.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const recentOrders = sortedOrders.slice(0, 5);
  const displayOrders = activeOrdersTab === 'recent' ? recentOrders : sortedOrders;

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const fetchOrders = async () => {
      try {
        const data = await OrdersApi.list();
        setOrders(data.orders ?? data);
      } catch (err) {
        setError('Unable to load your orders at the moment. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    void fetchOrders();
  };

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((total, order) => total + order.total, 0),
    pendingOrders: orders.filter(order => 
      (order.status?.name ?? '').toLowerCase() === 'pending'
    ).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-100">
              <UserCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
              Your Profile
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl">
            Manage your personal information, view your order history, and track your shopping activity.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Profile Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold mb-4">
                  {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">{user?.fullName}</h2>
                <p className="text-slate-600 mt-1">{user?.email}</p>
                <span className="inline-flex items-center gap-1.5 mt-3 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  <ShieldCheckIcon className="h-3 w-3" />
                  {user?.role || 'Customer'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <CalendarIcon className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Member since</p>
                    <p className="text-sm text-slate-600">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <ShoppingBagIcon className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Total orders</p>
                    <p className="text-sm text-slate-600">{stats.totalOrders}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <CheckCircleIcon className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Total spent</p>
                    <p className="text-sm text-slate-600">${stats.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all duration-200">
                <PencilIcon className="h-4 w-4" />
                Edit Profile
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-4">Shopping Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Orders Placed</span>
                  <span className="font-bold">{stats.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Pending Orders</span>
                  <span className="font-bold">{stats.pendingOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Total Spent</span>
                  <span className="font-bold">${stats.totalSpent.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Order History</h2>
                  <p className="text-slate-600 mt-1">
                    {orders.length} order{orders.length !== 1 ? 's' : ''} in total
                  </p>
                </div>

                {orders.length > 5 && (
                  <div className="flex mt-4 sm:mt-0">
                    <button
                      onClick={() => setActiveOrdersTab('recent')}
                      className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                        activeOrdersTab === 'recent'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Recent
                    </button>
                    <button
                      onClick={() => setActiveOrdersTab('all')}
                      className={`px-4 py-2 text-sm font-medium rounded-r-lg border border-l-0 ${
                        activeOrdersTab === 'all'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      All Orders
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4">
                  <Spinner />
                  <p className="text-slate-600">Loading your orders...</p>
                </div>
              ) : error ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4 text-center">
                  <div className="rounded-full bg-red-100 p-4">
                    <XMarkIcon className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">Unable to load orders</h3>
                    <p className="text-slate-600 max-w-md">{error}</p>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    Try Again
                  </button>
                </div>
              ) : displayOrders.length ? (
                <div className="space-y-4">
                  {displayOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status?.name);
                    const StatusIcon = statusConfig.icon;
                    const totalItems = getTotalItems(order);
                    
                    return (
                      <div key={order.id} className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-slate-900">
                                Order #{order.id.slice(-8).toUpperCase()}
                              </h3>
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusConfig.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {order.status?.name || 'Processing'}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { 
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
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">${order.total.toFixed(2)}</p>
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mt-2">
                              View Details
                            </button>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                          {order.items?.slice(0, 4).map((item, index) => (
                            <div key={item.id} className="flex-shrink-0">
                              <div className="relative">
                                <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden">
                                  {item.product?.imageUrl ? (
                                    <img 
                                      src={item.product.imageUrl} 
                                      alt={item.product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                      <ShoppingBagIcon className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                                {index === 3 && order.items && order.items.length > 4 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      +{order.items.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {activeOrdersTab === 'recent' && orders.length > 5 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setActiveOrdersTab('all')}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        View all {orders.length} orders
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBagIcon className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders yet</h3>
                  <p className="text-slate-600 max-w-md mx-auto mb-6">
                    When you place your first order, it will appear here with all the details and tracking information.
                  </p>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Account Security */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Account Protected</p>
                      <p className="text-sm text-green-700">Your account is secure and active</p>
                    </div>
                  </div>
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <button className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                    <EnvelopeIcon className="h-5 w-5 text-slate-600" />
                    <span className="font-medium text-slate-900">Change Email</span>
                  </button>
                  
                  <button className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                    <ShieldCheckIcon className="h-5 w-5 text-slate-600" />
                    <span className="font-medium text-slate-900">Change Password</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;