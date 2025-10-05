import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { CategoriesApi, OrdersApi, ProductsApi, StatusApi } from '../services/api';
import type { Category, Order, Product, Status } from '../types';
import { Spinner } from '../components/Spinner';
import {
  ShoppingBagIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

type ProductFormState = {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  imageUrl: string;
  imageFile: File | null;
};

type CategoryFormState = {
  id: string;
  name: string;
  description: string;
};

const initialProductForm: ProductFormState = {
  id: '',
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  imageUrl: '',
  imageFile: null
};

const initialCategoryForm: CategoryFormState = {
  id: '',
  name: '',
  description: ''
};

const AdminDashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders'>('products');

  const [productForm, setProductForm] = useState<ProductFormState>(initialProductForm);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productSubmitting, setProductSubmitting] = useState(false);

  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(initialCategoryForm);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const [orderUpdatingId, setOrderUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'product' | 'category'; id: string; name: string } | null>(null);

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
        setProducts(productRes);
        setCategories(categoryRes);
        setOrders(orderRes);
        setStatuses(statusRes);
      } catch (err) {
        console.error(err);
        setError('Failed to load admin dashboard data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    void fetchAll();
  }, []);

  const dashboardStats = useMemo(
    () => ({
      totalProducts: products.length,
      totalCategories: categories.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => (order.status?.name ?? '').toLowerCase() === 'pending').length,
      totalRevenue: orders.reduce((total, order) => total + order.total, 0)
    }),
    [products, categories, orders]
  );

  const resetProductForm = () => {
    setProductForm({ ...initialProductForm });
    setIsEditingProduct(false);
  };

  const handleProductInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setProductForm((prev) => ({ ...prev, imageFile: file }));
  };

  const startEditProduct = (product: Product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock != null ? product.stock.toString() : '',
      categoryId: product.categoryId ?? '',
      imageUrl: product.imageUrl ?? '',
      imageFile: null
    });
    setIsEditingProduct(true);
    setActionMessage(null);
    // Scroll to form
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreateOrUpdateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!productForm.name || !productForm.description || !productForm.price || !productForm.stock || !productForm.categoryId) {
      setActionMessage('Please fill in all required fields (marked with *).');
      return;
    }

    const priceValue = Number(productForm.price);
    const stockValue = Number(productForm.stock);

    if (!Number.isFinite(priceValue) || !Number.isFinite(stockValue)) {
      setActionMessage('Price and stock must be valid numbers.');
      return;
    }

    try {
      setProductSubmitting(true);
      setActionMessage(null);

      let imageUrl = productForm.imageUrl.trim() || undefined;
      if (productForm.imageFile) {
        const uploadResult = await ProductsApi.uploadImage(productForm.imageFile);
        imageUrl = uploadResult.url;
      }

      if (isEditingProduct && productForm.id) {
        const updated = await ProductsApi.update(productForm.id, {
          name: productForm.name,
          description: productForm.description,
          price: priceValue,
          stock: stockValue,
          categoryId: productForm.categoryId,
          imageUrl: imageUrl ?? null
        });
        setProducts((prev) => prev.map((product) => (product.id === updated.id ? updated : product)));
        setActionMessage('✅ Product updated successfully!');
      } else {
        const created = await ProductsApi.create({
          name: productForm.name,
          description: productForm.description,
          price: priceValue,
          stock: stockValue,
          categoryId: productForm.categoryId,
          imageUrl: imageUrl ?? null
        });
        setProducts((prev) => [created, ...prev]);
        setActionMessage('✅ Product created successfully!');
      }

      resetProductForm();
    } catch (err) {
      console.error(err);
      setActionMessage('❌ Unable to save product. Please try again.');
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await ProductsApi.remove(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      setActionMessage('✅ Product deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setActionMessage('❌ Failed to delete product. It might be referenced in existing orders.');
    }
  };

  const handleCategoryInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEditCategory = (category: Category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description ?? ''
    });
    setIsEditingCategory(true);
    setActionMessage(null);
    document.getElementById('category-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ ...initialCategoryForm });
    setIsEditingCategory(false);
  };

  const handleCreateOrUpdateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryForm.name) {
      setActionMessage('Category name is required.');
      return;
    }

    try {
      setCategorySubmitting(true);
      setActionMessage(null);

      if (isEditingCategory && categoryForm.id) {
        const updated = await CategoriesApi.update(categoryForm.id, {
          name: categoryForm.name,
          description: categoryForm.description || undefined
        });
        setCategories((prev) => prev.map((category) => (category.id === updated.id ? updated : category)));
        setActionMessage('✅ Category updated successfully!');
      } else {
        const created = await CategoriesApi.create({
          name: categoryForm.name,
          description: categoryForm.description || undefined
        });
        setCategories((prev) => [created, ...prev]);
        setActionMessage('✅ Category created successfully!');
      }

      resetCategoryForm();
    } catch (err) {
      console.error(err);
      setActionMessage('❌ Unable to save category. Please try again.');
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await CategoriesApi.remove(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      setActionMessage('✅ Category deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setActionMessage('❌ Failed to delete category. It might be used by existing products.');
    }
  };

  const getStatusIdByName = (name: string): string | undefined => {
    const status = statuses.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return status?.id;
  };

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

  const handleUpdateOrderStatus = async (orderId: string, statusId: string) => {
    if (!statusId) {
      return;
    }

    try {
      setOrderUpdatingId(orderId);
      const updated = await OrdersApi.update(orderId, { status_id: statusId });
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
      setActionMessage('✅ Order status updated successfully!');
    } catch (err) {
      console.error(err);
      setActionMessage('❌ Failed to update order status. Please try again.');
    } finally {
      setOrderUpdatingId(null);
    }
  };

  const handleApproveOrder = (orderId: string) => {
    const statusId =
      getStatusIdByName('Approved') ??
      getStatusIdByName('Completed') ??
      getStatusIdByName('Processing');
    if (statusId) {
      void handleUpdateOrderStatus(orderId, statusId);
    } else {
      setActionMessage('❌ Approved status is not configured in the system.');
    }
  };

  const handleCancelOrder = (orderId: string) => {
    const statusId = getStatusIdByName('Cancelled') ?? getStatusIdByName('Canceled');
    if (statusId) {
      void handleUpdateOrderStatus(orderId, statusId);
    } else {
      setActionMessage('❌ Cancelled status is not configured in the system.');
    }
  };

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  );

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const fetchAll = async () => {
      try {
        const [productRes, categoryRes, orderRes, statusRes] = await Promise.all([
          ProductsApi.list(),
          CategoriesApi.list(),
          OrdersApi.list(),
          StatusApi.list()
        ]);
        setProducts(productRes);
        setCategories(categoryRes);
        setOrders(orderRes);
        setStatuses(statusRes);
      } catch (err) {
        setError('Failed to load admin dashboard data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    void fetchAll();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Spinner />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 animate-pulse rounded-full bg-blue-500"></div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-slate-700">Loading Admin Dashboard</p>
              <p className="text-sm text-slate-500">Preparing your management tools...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="rounded-full bg-red-100 p-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center space-y-4 max-w-md">
              <h3 className="text-xl font-semibold text-slate-900">Unable to load dashboard</h3>
              <p className="text-slate-600">{error}</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ClockIcon className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-100">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl">
            Manage your products, categories, and monitor orders in real-time. Everything you need to run your store efficiently.
          </p>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div className={`rounded-2xl border p-4 mb-6 flex items-start gap-3 ${actionMessage.includes('❌')
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
            }`}>
            {actionMessage.includes('❌') ? (
              <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <p className="flex-1 font-medium">{actionMessage}</p>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <section className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Products</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardStats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TagIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Categories</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardStats.totalCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardStats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Orders</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardStats.pendingOrders}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Tabs */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200">
            <div className="flex flex-wrap gap-1 p-6 pb-0">
              {[
                { id: 'products' as const, label: 'Products', icon: ShoppingBagIcon, count: products.length },
                { id: 'categories' as const, label: 'Categories', icon: TagIcon, count: categories.length },
                { id: 'orders' as const, label: 'Orders', icon: ClipboardDocumentListIcon, count: orders.length }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    <span className={`rounded-full px-2 py-1 text-xs ${activeTab === tab.id
                        ? 'bg-white text-blue-600'
                        : 'bg-slate-200 text-slate-600'
                      }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-[400px,1fr]">
                {/* Product Form */}
                <div id="product-form" className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100">
                      {isEditingProduct ? <PencilIcon className="h-4 w-4 text-blue-600" /> : <PlusIcon className="h-4 w-4 text-blue-600" />}
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {isEditingProduct ? 'Update Product' : 'Add New Product'}
                    </h2>
                  </div>

                  <form className="space-y-4" onSubmit={handleCreateOrUpdateProduct}>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Product Name *</label>
                      <input
                        name="name"
                        type="text"
                        required
                        value={productForm.name}
                        onChange={handleProductInputChange}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Description *</label>
                      <textarea
                        name="description"
                        required
                        value={productForm.description}
                        onChange={handleProductInputChange}
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Describe the product..."
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Price ($) *</label>
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          min={0}
                          required
                          value={productForm.price}
                          onChange={handleProductInputChange}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Stock *</label>
                        <input
                          name="stock"
                          type="number"
                          min={0}
                          required
                          value={productForm.stock}
                          onChange={handleProductInputChange}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Category *</label>
                      <select
                        name="categoryId"
                        required
                        value={productForm.categoryId}
                        onChange={handleProductInputChange}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Image URL</label>
                      <input
                        name="imageUrl"
                        type="url"
                        value={productForm.imageUrl}
                        onChange={handleProductInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Upload Image</label>
                      <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors">
                        <PhotoIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <label className="block cursor-pointer">
                          <span className="sr-only">Upload product image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProductFileChange}
                            className="w-full opacity-0 cursor-pointer"
                            aria-hidden={false}
                          />
                          <p className="text-sm text-slate-600">
                            {productForm.imageFile ? productForm.imageFile.name : 'Click to upload image'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">JPEG, PNG up to 5MB</p>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={productSubmitting}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
                      >
                        {productSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <Spinner />
                            {isEditingProduct ? 'Updating...' : 'Creating...'}
                          </div>
                        ) : isEditingProduct ? (
                          'Update Product'
                        ) : (
                          'Create Product'
                        )}
                      </button>
                      {isEditingProduct && (
                        <button
                          type="button"
                          onClick={resetProductForm}
                          className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Products List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">All Products ({products.length})</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">
                                  <PhotoIcon className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 truncate">{product.name}</h4>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{product.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                              <span>${product.price.toFixed(2)}</span>
                              <span>•</span>
                              <span>{product.stock ?? 0} in stock</span>
                              <span>•</span>
                              <span>{categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}</span>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditProduct(product)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit product"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm({ type: 'product', id: product.id, name: product.name })}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete product"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!products.length && (
                    <div className="text-center py-12">
                      <ShoppingBagIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No products yet. Create your first product to get started!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-[400px,1fr]">
                {/* Category Form */}
                <div id="category-form" className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-green-100">
                      {isEditingCategory ? <PencilIcon className="h-4 w-4 text-green-600" /> : <PlusIcon className="h-4 w-4 text-green-600" />}
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {isEditingCategory ? 'Update Category' : 'Add New Category'}
                    </h2>
                  </div>

                  <form className="space-y-4" onSubmit={handleCreateOrUpdateCategory}>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Category Name *</label>
                      <input
                        name="name"
                        type="text"
                        required
                        value={categoryForm.name}
                        onChange={handleCategoryInputChange}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        placeholder="Enter category name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                      <textarea
                        name="description"
                        value={categoryForm.description}
                        onChange={handleCategoryInputChange}
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        placeholder="Describe the category..."
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={categorySubmitting}
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
                      >
                        {categorySubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <Spinner />
                            {isEditingCategory ? 'Updating...' : 'Creating...'}
                          </div>
                        ) : isEditingCategory ? (
                          'Update Category'
                        ) : (
                          'Create Category'
                        )}
                      </button>
                      {isEditingCategory && (
                        <button
                          type="button"
                          onClick={resetCategoryForm}
                          className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Categories List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">All Categories ({categories.length})</h3>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {categories.map((category) => (
                      <div key={category.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-2">{category.name}</h4>
                            <p className="text-sm text-slate-600">
                              {category.description || 'No description provided.'}
                            </p>
                            <div className="mt-3 text-xs text-slate-500">
                              {products.filter(p => p.categoryId === category.id).length} products
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => startEditCategory(category)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit category"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm({ type: 'category', id: category.id, name: category.name })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete category"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!categories.length && (
                    <div className="text-center py-12">
                      <TagIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No categories yet. Create your first category to organize products!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">All Orders ({orders.length})</h3>

                <div className="space-y-4">
                  {sortedOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status?.name);
                    const StatusIcon = statusConfig.icon;
                    const totalItems = order.items?.reduce((total, item) => total + item.quantity, 0) || 0;

                    return (
                      <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-slate-900">
                                Order #{order.id.slice(-8).toUpperCase()}
                              </h4>
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

                          <div className="flex flex-col sm:flex-row gap-3">
                            <select
                              value={order.statusId}
                              onChange={(event) => handleUpdateOrderStatus(order.id, event.target.value)}
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                              disabled={orderUpdatingId === order.id}
                            >
                              {statuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                  {status.name}
                                </option>
                              ))}
                            </select>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveOrder(order.id)}
                                disabled={orderUpdatingId === order.id}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={orderUpdatingId === order.id}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {(order.items ?? []).map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                  {item.product?.imageUrl ? (
                                    <img
                                      src={item.product.imageUrl}
                                      alt={item.product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                      <ShoppingBagIcon className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-medium text-slate-900 truncate text-sm">
                                    {item.product?.name ?? 'Product'}
                                  </h5>
                                  <p className="text-xs text-slate-500">
                                    Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-slate-900 text-sm">
                                  ${(item.unitPrice * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {!sortedOrders.length && (
                    <div className="text-center py-12">
                      <ClipboardDocumentListIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No orders yet. Orders will appear here when customers make purchases.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Delete {showDeleteConfirm.type === 'product' ? 'Product' : 'Category'}?
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
                  {showDeleteConfirm.type === 'category' && ' Products in this category will become uncategorized.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-6 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => showDeleteConfirm.type === 'product'
                  ? handleDeleteProduct(showDeleteConfirm.id)
                  : handleDeleteCategory(showDeleteConfirm.id)
                }
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;