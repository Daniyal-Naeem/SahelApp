import { getItem } from './AsyncStorage';
import { storePendingAction, storeNavigationState, getPendingActions, clearPendingActions, clearNavigationState, type PendingAction } from './pendingActions';

/**
 * Check if user is authenticated
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const token = await getItem('token');
    const user = await getItem('user');
    return !!(token && user);
  } catch (error) {
    return false;
  }
};

/**
 * Require authentication before executing an action
 * If not authenticated, stores the action and redirects to login
 */
export const requireAuth = async (
  action: () => Promise<void> | void,
  options?: {
    redirectTo?: 'login' | 'signup';
    preserveState?: boolean;
    actionType?: PendingAction['type'];
    actionData?: any;
    navigation?: any; // Navigation object for redirect
  }
): Promise<void> => {
  const isAuthenticated = await checkAuthStatus();
  
  if (!isAuthenticated) {
    // Store pending action if provided
    if (options?.actionType && options?.actionData) {
      await storePendingAction({
        type: options.actionType,
        data: options.actionData,
        redirectTo: options.redirectTo || 'login',
        timestamp: Date.now()
      });
    }
    
    // Store navigation state if requested
    if (options?.preserveState && options?.navigation) {
      try {
        const navigationState = options.navigation.getState();
        await storeNavigationState(navigationState);
      } catch (error) {
        console.error('Error storing navigation state:', error);
      }
    }
    
    // Navigate to auth screen
    if (options?.navigation) {
      options.navigation.navigate(options.redirectTo === 'signup' ? 'Signup' : 'Login');
    }
    
    // Return early - action will be executed after login
    return;
  } else {
    // User is authenticated, execute action immediately
    await action();
  }
};

/**
 * Execute all pending actions after successful authentication
 * This should be called after login/signup
 */
export const executePendingActions = async (navigation?: any): Promise<void> => {
  try {
    const pendingActions = await getPendingActions();
    
    // Import services dynamically to avoid circular dependencies
    for (const action of pendingActions) {
      try {
        switch (action.type) {
          case 'add_to_wishlist':
            // Import wishlist service dynamically
            const { addToWishlist } = await import('../services/wishlistService');
            await addToWishlist(action.data.productId);
            if (navigation) {
              navigation.navigate('HomeScreen', {
                screen: 'Dashboard',
                params: { screen: 'Wishlist' }
              });
            }
            break;
            
          case 'proceed_to_checkout':
            // Import cart service dynamically
            const { syncCartToBackend } = await import('../services/cartService');
            await syncCartToBackend();
            if (navigation) {
              navigation.navigate('Checkout');
            }
            break;
            
          case 'access_support':
            if (navigation) {
              navigation.navigate('Support');
            }
            break;
            
          case 'view_order_tracking':
            if (navigation && action.data.orderId) {
              navigation.navigate('OrderDetails', { orderId: action.data.orderId });
            }
            break;
            
          case 'access_orders':
            if (navigation) {
              navigation.navigate('Orders');
            }
            break;
            
          case 'create_review':
            // Handle review creation if needed
            break;
        }
      } catch (error) {
        console.error(`Error executing pending action ${action.type}:`, error);
      }
    }
    
    // Clear pending actions after execution
    await clearPendingActions();
    
    // Clear navigation state
    await clearNavigationState();
  } catch (error) {
    console.error('Error executing pending actions:', error);
  }
};

/**
 * Protect a screen - redirect to login if not authenticated
 * Use this in useEffect for screen-level protection
 */
export const protectScreen = async (
  onAuthenticated: () => Promise<void> | void,
  navigation: any,
  options?: {
    redirectTo?: 'login' | 'signup';
    actionType?: PendingAction['type'];
    actionData?: any;
  }
): Promise<void> => {
  const isAuthenticated = await checkAuthStatus();
  
  if (!isAuthenticated) {
    // Store pending action if provided
    if (options?.actionType && options?.actionData) {
      await storePendingAction({
        type: options.actionType,
        data: options.actionData,
        redirectTo: options.redirectTo || 'login',
        timestamp: Date.now()
      });
    }
    
    // Store navigation state
    try {
      const navigationState = navigation.getState();
      await storeNavigationState(navigationState);
    } catch (error) {
      console.error('Error storing navigation state:', error);
    }
    
    // Redirect to login
    navigation.navigate(options?.redirectTo === 'signup' ? 'Signup' : 'Login');
  } else {
    // User is authenticated, execute callback
    await onAuthenticated();
  }
};

