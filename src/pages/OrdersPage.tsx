import { useEffect, useState } from 'react';
import { OrdersApi } from '../services/api';
import type { Order } from '../types';
import { Spinner } from '../components/Spinner';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrdersApi.list();
        setOrders(data.orders ?? data);
      } catch (err) {
        setError('Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };
    void fetchOrders();
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

  if (!orders.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-slate-900">No orders yet</h2>
        <p className="mt-2 text-sm text-slate-500">Place your first order to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Your orders</h1>
      <ul className="space-y-6">
        {orders.map((order) => (
          <li key={order.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Order #{order.id.slice(-6)}</p>
                <p className="text-xs text-slate-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary-600">${order.total.toFixed(2)}</p>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                  {order.status?.name ?? 'Processing'}
                </span>
              </div>
            </div>
            <div className="mt-4 divide-y divide-slate-200 border-t border-slate-200">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 text-sm text-slate-600">
                  <span>
                    {item.product?.name ?? 'Product'} × {item.quantity}
                  </span>
                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;
