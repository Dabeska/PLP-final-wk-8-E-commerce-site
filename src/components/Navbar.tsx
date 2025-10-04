import { Fragment, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Home', to: '/' },
  { name: 'Shop', to: '/' },
  { name: 'Orders', to: '/orders', requiresAuth: true }
];

const adminLinks = [{ name: 'Admin', to: '/admin', requiresAuth: true }];

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
          <Link to="/" className="text-xl font-semibold text-primary-600">
            ShopSphere
          </Link>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-8">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition hover:text-primary-600 ${
                  isActive ? 'text-primary-600' : 'text-slate-600'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
          {user?.role === 'admin' &&
            adminLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition hover:text-primary-600 ${
                    isActive ? 'text-primary-600' : 'text-slate-600'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative inline-flex items-center">
            <ShoppingCartIcon className="h-6 w-6 text-slate-600" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 px-1 text-xs font-semibold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="hidden text-sm font-medium text-slate-600 transition hover:text-primary-600 sm:inline"
              >
                Hi, {user.fullName.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-slate-600 transition hover:text-primary-600">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-slate-600 transition hover:text-primary-600">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>

      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="lg:hidden" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-200 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-200 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <Link to="/" className="text-lg font-semibold text-primary-600" onClick={() => setMobileMenuOpen(false)}>
                  ShopSphere
                </Link>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="rounded-md p-2 text-slate-600">
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-6 space-y-4">
                {navigation
                  .filter((item) => (item.requiresAuth ? !!user : true))
                  .map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-md px-3 py-2 text-sm font-medium ${
                          isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-700 hover:bg-slate-100'
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                {user?.role === 'admin' &&
                  adminLinks.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-md px-3 py-2 text-sm font-medium ${
                          isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-700 hover:bg-slate-100'
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
              </div>
              <div className="mt-6 border-t border-slate-200 pt-6">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-slate-600">{user.email}</span>
                    <button onClick={handleLogout} className="text-left text-sm font-medium text-primary-600">
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      className="rounded-md border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
    </header>
  );
};

export default Navbar;
