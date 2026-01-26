import axios from './axios';
import { getItem, setItem, removeItem } from '../utils/AsyncStorage';
import { checkAuthStatus } from '../utils/authGuard';

const LOCAL_CART_KEY = 'guest_cart';

// Cart item type
export interface CartItem {
  _id?: string; // Backend cart item ID (if synced)
  product: string | any; // Product ID or full product object
  quantity: number;
  variation?: {
    color?: string;
    size?: string;
    [key: string]: any;
  };
  price?: number; // Price at time of adding (optional)
}

// Cart type
export interface Cart {
  items: CartItem[];
  total?: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
}

/**
 * Get local cart from storage (guest mode)
 */
const getLocalCart = async (): Promise<Cart> => {
  try {
    const cartData = await getItem(LOCAL_CART_KEY);
    if (cartData && typeof cartData === 'object' && 'items' in cartData) {
      return cartData as Cart;
    }
    return { items: [] };
  } catch (error) {
    return { items: [] };
  }
};

/**
 * Save local cart to storage (guest mode)
 */
const saveLocalCart = async (cart: Cart): Promise<void> => {
  try {
    await setItem(LOCAL_CART_KEY, cart);
  } catch (error) {
    console.error('Error saving local cart:', error);
  }
};

/**
 * Clear local cart
 */
const clearLocalCart = async (): Promise<void> => {
  try {
    await removeItem(LOCAL_CART_KEY);
  } catch (error) {
    console.error('Error clearing local cart:', error);
  }
};

/**
 * Add item to cart (works in both guest and authenticated mode)
 */
export const addToCart = async (item: CartItem): Promise<Cart> => {
  const isAuthenticated = await checkAuthStatus();
  
  if (!isAuthenticated) {
    // Guest mode: Use local storage
    return addToCartGuest(item);
  } else {
    // Authenticated: Use backend API
    return addToCartAuthenticated(item);
  }
};

/**
 * Add item to cart (guest mode - local storage)
 */
export const addToCartGuest = async (item: CartItem): Promise<Cart> => {
  try {
    const cart = await getLocalCart();
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (cartItem) => 
        (typeof cartItem.product === 'string' ? cartItem.product : cartItem.product._id) === 
        (typeof item.product === 'string' ? item.product : item.product._id) &&
        JSON.stringify(cartItem.variation) === JSON.stringify(item.variation)
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      cart.items.push(item);
    }
    
    await saveLocalCart(cart);
    return cart;
  } catch (error) {
    throw error;
  }
};

/**
 * Add item to cart (authenticated - backend API)
 */
export const addToCartAuthenticated = async (item: CartItem): Promise<Cart> => {
  try {
    const res = await axios.post('/cart/add', {
      product: typeof item.product === 'string' ? item.product : item.product._id,
      quantity: item.quantity,
      variation: item.variation,
      price: item.price
    });
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get cart (works in both guest and authenticated mode)
 */
export const getCart = async (): Promise<Cart> => {
  const isAuthenticated = await checkAuthStatus();
  
  if (!isAuthenticated) {
    // Guest mode: Get from local storage
    return getLocalCart();
  } else {
    // Authenticated: Get from backend
    return getCartAuthenticated();
  }
};

/**
 * Get cart (authenticated - backend API)
 */
export const getCartAuthenticated = async (): Promise<Cart> => {
  try {
    const res = await axios.get('/cart');
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get cart count (works in both guest and authenticated mode)
 */
export const getCartCount = async (): Promise<number> => {
  const isAuthenticated = await checkAuthStatus();
  
  if (!isAuthenticated) {
    // Guest mode: Count local items
    const cart = await getLocalCart();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  } else {
    // Authenticated: Get count from backend
    return getCartCountAuthenticated();
  }
};

/**
 * Get cart count (authenticated - backend API)
 */
export const getCartCountAuthenticated = async (): Promise<number> => {
  try {
    const res = await axios.get('/cart/count');
    return res.data.count || 0;
  } catch (error: any) {
    return 0;
  }
};

/**
 * Update cart item quantity (works in both guest and authenticated mode)
 */
export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart> => {
  const isAuthenticated = await checkAuthStatus();
  
  if (!isAuthenticated) {
    // Guest mode: Update local storage
    return updateCartItemGuest(itemId, quantity);
  } else {
    // Authenticated: Update via backend API
    return updateCartItemAuthenticated(itemId, quantity);
  }
};

/**
 * Update cart item quantity (guest mode - local storage)
 */
export const updateCartItemGuest = async (itemId: string, quantity: number): Promise<Cart> => {
  try {
    const cart = await getLocalCart();
    const itemIndex = cart.items.findIndex(
      (item) => (typeof item.product === 'string' ? item.product : item.product._id) === itemId
    );
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await saveLocalCart(cart);
    }
    
    return cart;
  } catch (error) {
    throw error;
  }
};

/**
 * Update cart item quantity (authenticated - backend API)
 */
export const updateCartItemAuthenticated = async (itemId: string, quantity: number): Promise<Cart> => {
  try {
    const res = await axios.put(`/cart/update/${itemId}`, { quantity });
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Remove item from cart (works in both guest and authenticated mode)
 */
export const removeFromCart = async (itemId: string): Promise<Cart> => {
  const isAuthenticated = await checkAuthStatus();
  
  if (!isAuthenticated) {
    // Guest mode: Remove from local storage
    return removeFromCartGuest(itemId);
  } else {
    // Authenticated: Remove via backend API
    return removeFromCartAuthenticated(itemId);
  }
};

/**
 * Remove item from cart (guest mode - local storage)
 */
export const removeFromCartGuest = async (itemId: string): Promise<Cart> => {
  try {
    const cart = await getLocalCart();
    cart.items = cart.items.filter(
      (item) => (typeof item.product === 'string' ? item.product : item.product._id) !== itemId
    );
    await saveLocalCart(cart);
    return cart;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove item from cart (authenticated - backend API)
 */
export const removeFromCartAuthenticated = async (itemId: string): Promise<Cart> => {
  try {
    const res = await axios.delete(`/cart/remove/${itemId}`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Clear cart (works in both guest and authenticated mode)
 */
export const clearCart = async (): Promise<void> => {
  const isAuthenticated = await checkAuthStatus();
  
  if (!isAuthenticated) {
    // Guest mode: Clear local storage
    await clearLocalCart();
  } else {
    // Authenticated: Clear via backend API
    await clearCartAuthenticated();
  }
};

/**
 * Clear cart (authenticated - backend API)
 */
export const clearCartAuthenticated = async (): Promise<void> => {
  try {
    await axios.delete('/cart/clear');
  } catch (error: any) {
    throw error;
  }
};

/**
 * Sync local cart to backend (called after login)
 */
export const syncCartToBackend = async (): Promise<Cart> => {
  try {
    const localCart = await getLocalCart();
    const syncedItems: string[] = [];
    
    // If local cart has items, sync them to backend
    if (localCart.items.length > 0) {
      // Add each item to backend cart
      for (const item of localCart.items) {
        try {
          await axios.post('/cart/add', {
            product: typeof item.product === 'string' ? item.product : item.product._id,
            quantity: item.quantity,
            variation: item.variation,
            price: item.price
          });
          // Track successfully synced items
          const productId = typeof item.product === 'string' ? item.product : item.product._id;
          if (productId) {
            syncedItems.push(productId);
          }
        } catch (error) {
          console.error('Error syncing cart item:', error);
          // Continue with other items even if one fails
        }
      }
      
      // Only remove synced items from local cart, keep failed ones
      if (syncedItems.length > 0) {
        const remainingItems = localCart.items.filter(
          item => {
            const productId = typeof item.product === 'string' ? item.product : item.product._id;
            return !syncedItems.includes(productId);
          }
        );
        
        if (remainingItems.length === 0) {
          // All items synced, clear local cart
          await clearLocalCart();
        } else {
          // Some items failed, keep them in local cart
          await setItem(LOCAL_CART_KEY, { items: remainingItems });
        }
      }
    }
    
    // Load backend cart
    return await getCartAuthenticated();
  } catch (error: any) {
    throw error;
  }
};

/**
 * Sync backend cart to local (for offline support - optional)
 */
export const syncCartFromBackend = async (): Promise<Cart> => {
  try {
    const backendCart = await getCartAuthenticated();
    // Optionally cache backend cart locally for offline access
    return backendCart;
  } catch (error: any) {
    throw error;
  }
};

