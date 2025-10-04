import { createContext, useContext, useMemo, useReducer } from 'react';
import type { Product } from '../types';

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR' };

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

interface CartContextValue extends CartState {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const initialState: CartState = {
  items: []
};

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((item) => item.product.id === action.payload.product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === action.payload.product.id
              ? {
                  ...item,
                  quantity: item.quantity + (action.payload.quantity ?? 1)
                }
              : item
          )
        };
      }
      return {
        items: [...state.items, { product: action.payload.product, quantity: action.payload.quantity ?? 1 }]
      };
    }
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter((item) => item.product.id !== action.payload.productId)
      };
    case 'UPDATE_QUANTITY':
      return {
        items: state.items.map((item) =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        )
      };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addItem = (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR' });

  const totals = useMemo(() => {
    return state.items.reduce(
      (acc, item) => {
        acc.totalItems += item.quantity;
        acc.totalPrice += item.quantity * item.product.price;
        return acc;
      },
      { totalItems: 0, totalPrice: 0 }
    );
  }, [state.items]);

  const value = useMemo(
    () => ({
      items: state.items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems: totals.totalItems,
      totalPrice: totals.totalPrice
    }),
    [state.items, totals.totalItems, totals.totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
