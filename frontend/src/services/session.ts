import {getMe, getStoredSession, logout as clearSession} from '../services/authService';
import {getCart} from '../services/cartService';
import {getWishlist} from '../services/wishlistService';
import {setCredentials, clearCredentials, setHydrated} from '../store/authSlice';
import {setCartItems, clearCart, CartItem} from '../store/cartSlice';
import {setWishlist, clearWishlist} from '../store/wishlistSlice';
import type {AppDispatch} from '../store/store';

const mapCartFromApi = (cartPayload: any): CartItem[] => {
  const items = cartPayload?.cart?.items || cartPayload?.items || [];
  return items
    .map((item: any) => {
      const product = item.product || {};
      const productId = product._id || item.product;
      if (!productId) return null;
      return {
        _id: String(productId),
        cartItemId: item._id ? String(item._id) : undefined,
        title: product.title || 'Product',
        description: product.description || '',
        image: Array.isArray(product.image)
          ? product.image
          : product.image
            ? [product.image]
            : [],
        price: item.price ?? product.price ?? 0,
        priceBeforeDeal: product.priceBeforeDeal ?? product.price ?? 0,
        priceOff: String(product.priceOff ?? '0'),
        stars: product.stars || 0,
        numberOfReview: product.numberOfReview || 0,
        tags: product.tags || [],
        createdAt: product.createdAt || '',
        updatedAt: product.updatedAt || '',
        __v: product.__v || 0,
        quantity: item.quantity || 1,
        selectedVariation: item.selectedVariation || '',
        selectedColor: item.selectedColor || '',
        selectedDelivery: item.selectedDelivery || '',
      } as CartItem;
    })
    .filter(Boolean);
};

export const hydrateSession = async (dispatch: AppDispatch) => {
  try {
    const {token, user} = await getStoredSession();
    if (!token) {
      dispatch(clearCredentials());
      return false;
    }

    try {
      const freshUser = await getMe();
      dispatch(setCredentials({token, user: freshUser}));
    } catch {
      if (user) {
        dispatch(setCredentials({token, user}));
      } else {
        await clearSession();
        dispatch(clearCredentials());
        return false;
      }
    }

    await syncCommerceCaches(dispatch);
    return true;
  } catch {
    dispatch(clearCredentials());
    return false;
  } finally {
    dispatch(setHydrated(true));
  }
};

export const syncCommerceCaches = async (dispatch: AppDispatch) => {
  try {
    const cartData = await getCart();
    dispatch(setCartItems(mapCartFromApi(cartData)));
  } catch {
    // Keep local cart if offline
  }

  try {
    const wishlistData = await getWishlist();
    const products = wishlistData?.wishlist || [];
    dispatch(
      setWishlist(
        (Array.isArray(products) ? products : []).map((p: any) => ({
          _id: String(p._id),
          title: p.title || '',
          description: p.description || '',
          image: Array.isArray(p.image) ? p.image : p.image ? [p.image] : [],
          price: p.price || 0,
          priceBeforeDeal: p.priceBeforeDeal || p.price || 0,
          priceOff: String(p.priceOff ?? '0'),
          stars: p.stars || 0,
          numberOfReview: p.numberOfReview || 0,
          tags: p.tags || [],
          createdAt: p.createdAt || '',
          updatedAt: p.updatedAt || '',
          __v: p.__v || 0,
          status: p.status,
          vendor: p.vendor?.name || p.vendor,
        })),
      ),
    );
  } catch {
    // Keep local wishlist
  }
};

export const performLogout = async (dispatch: AppDispatch) => {
  await clearSession();
  dispatch(clearCredentials());
  dispatch(clearCart());
  dispatch(clearWishlist());
};
