import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { OrdersApi } from '../services/api';
import type { Order } from '../types';
import { Spinner } from '../components/Spinner';

const ProfilePage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrdersApi.list();
        setOrders(data.orders ?? data);
      } catch (err) {
        setError('Unable to load your orders right now.');
      } finally {
        setLoading(false);
      }
    };
    void fetchOrders();
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your information and view account details.</p>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-sm font-medium text-slate-500">Full name</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">{user?.fullName}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-sm font-medium text-slate-500">Email</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">{user?.email}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-sm font-medium text-slate-500">Role</dt>
            <dd className="mt-1 inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase text-primary-600">
              {user?.role}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-sm font-medium text-slate-500">Joined</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
        </div>
        {loading ? (
          <div className="flex min-h-[150px] items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
        ) : orders.length ? (
          <ul className="mt-6 space-y-4">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Order #{order.id.slice(-6)}</p>
                  <p className="text-xs text-slate-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary-600">${order.total.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{order.status?.name ?? 'Processing'}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No orders yet. Start shopping to create your first order!</p>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
