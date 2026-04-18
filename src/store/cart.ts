/**
 * Cart store — synced with backend, cached locally.
 */
import { create } from "zustand";
import { ordersApi } from "@/lib/api";

interface CartItem {
  id: string;
  product: {
    id: string;
    name_ru: string;
    price: number;
    unit: string;
    moq: number;
    images: Array<{ url: string; is_primary: boolean }>;
    supplier_id: string;
    in_stock: boolean;
  };
  quantity: number;
  unit_price: number;
}

interface Cart {
  id: string;
  supplier_id: string;
  items: CartItem[];
  notes?: string;
  subtotal: number;
}

interface CartState {
  carts: Cart[];
  isLoading: boolean;
  fetchCarts: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: (cartId: string) => Promise<void>;
  getTotalItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  carts: [],
  isLoading: false,

  fetchCarts: async () => {
    set({ isLoading: true });
    try {
      const { data } = await ordersApi.getCarts();
      set({ carts: data });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity) => {
    const { data } = await ordersApi.addToCart({ product_id: productId, quantity });
    // Replace or add the cart for this supplier
    set((state) => {
      const exists = state.carts.find((c) => c.id === data.id);
      return {
        carts: exists
          ? state.carts.map((c) => (c.id === data.id ? data : c))
          : [...state.carts, data],
      };
    });
  },

  removeItem: async (itemId) => {
    await ordersApi.removeCartItem(itemId);
    set((state) => ({
      carts: state.carts.map((cart) => ({
        ...cart,
        items: cart.items.filter((i) => i.id !== itemId),
      })).filter((cart) => cart.items.length > 0),
    }));
  },

  clearCart: async (cartId) => {
    await ordersApi.clearCart(cartId);
    set((state) => ({ carts: state.carts.filter((c) => c.id !== cartId) }));
  },

  getTotalItemCount: () => {
    return get().carts.reduce((acc, cart) => acc + cart.items.length, 0);
  },
}));
