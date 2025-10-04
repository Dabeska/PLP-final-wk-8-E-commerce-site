import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CategoriesApi, OrdersApi, ProductsApi, StatusApi } from '../services/api';
import type { Category, Order, Product, Status } from '../types';
import { Spinner } from '../components/Spinner';

const AdminDashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders'>('products');

  const [formState, setFormState] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: ''
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [productRes, categoryRes, orderRes, statusRes] = await Promise.all([
          ProductsApi.list(),
          CategoriesApi.list(),
          OrdersApi.list(),
          StatusApi.list()
        ]);
        setProducts(productRes.products ?? productRes);
        setCategories(categoryRes.categories ?? categoryRes);
        setOrders(orderRes.orders ?? orderRes);
        setStatuses(statusRes.statuses ?? statusRes);
      } catch (err) {
        setError('Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };

    void fetchAll();
  }, []);

  const resetForm = () =>
    setFormState({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      categoryId: ''
    });

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload = {
        name: formState.name,
        description: formState.description,
        price: Number(formState.price),
        imageUrl: formState.imageUrl,
        categoryId: formState.categoryId || undefined
      };
      const newProduct = await ProductsApi.create(payload);
      setProducts((prev) => [...prev, newProduct.product ?? newProduct]);
      resetForm();
    } catch (err) {
      setError('Failed to create product.');
    }
  };

  const dashboardStats = useMemo(
    () => ({
      totalProducts: products.length,
      totalCategories: categories.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.status?.name === 'Pending').length
    }),
    [products, categories, orders]
  );

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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Admin dashboard</h1>
        <p className="text-sm text-slate-500">Manage catalogue, categories and monitor orders.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Products</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboardStats.totalProducts}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Categories</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboardStats.totalCategories}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Orders</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboardStats.totalOrders}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboardStats.pendingOrders}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {(
            [
              { id: 'products', label: 'Products' },
              { id: 'categories', label: 'Categories' },
              { id: 'orders', label: 'Orders' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Product catalogue</h2>
              <table className="mt-4 w-full table-auto text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-900">{product.name}</td>
                      <td className="px-4 py-2 text-slate-500">{product.category?.name ?? '—'}</td>
                      <td className="px-4 py-2 text-slate-500">${product.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">Add new product</h3>
              <form className="mt-4 space-y-4" onSubmit={handleCreateProduct}>
                <div>
                  <label className="text-sm font-medium text-slate-600">Name</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Description</label>
                  <textarea
                    required
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formState.price}
                    onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Image URL</label>
                  <input
                    type="url"
                    value={formState.imageUrl}
                    onChange={(event) => setFormState((prev) => ({ ...prev, imageUrl: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Category</label>
                  <select
                    value={formState.categoryId}
                    onChange={(event) => setFormState((prev) => ({ ...prev, categoryId: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full">
                  Create product
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <li key={category.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{category.name}</p>
                  <p className="text-xs text-slate-500">{category.description ?? '—'}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Orders overview</h2>
            <div className="mt-4 space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Order #{order.id.slice(-6)}</p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={order.statusId}
                        onChange={() => {}}
                        className="rounded-md border border-slate-300 px-3 py-1 text-sm"
                      >
                        {statuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm font-semibold text-primary-600">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-500">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        {item.product?.name ?? 'Product'} × {item.quantity} — ${item.unitPrice.toFixed(2)} each
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboardPage;
