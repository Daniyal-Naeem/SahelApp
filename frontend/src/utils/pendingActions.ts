import { setItem, getItem, removeItem } from './AsyncStorage';

const PENDING_ACTIONS_KEY = 'pending_actions';
const NAVIGATION_STATE_KEY = 'navigation_state';

export interface PendingAction {
  type: 'add_to_wishlist' | 'proceed_to_checkout' | 'create_review' | 'access_support' | 'view_order_tracking' | 'access_orders';
  data: any;
  redirectTo: string;
  timestamp: number;
}

/**
 * Store a pending action that needs to be executed after authentication
 */
export const storePendingAction = async (action: PendingAction): Promise<void> => {
  try {
    const actions = await getPendingActions();
    actions.push(action);
    await setItem(PENDING_ACTIONS_KEY, actions);
  } catch (error) {
    console.error('Error storing pending action:', error);
  }
};

/**
 * Get all pending actions
 */
export const getPendingActions = async (): Promise<PendingAction[]> => {
  try {
    const data = await getItem(PENDING_ACTIONS_KEY);
    if (!data) return [];
    
    // Handle both string (if not parsed) and array (if already parsed)
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
};

/**
 * Clear all pending actions
 */
export const clearPendingActions = async (): Promise<void> => {
  try {
    await removeItem(PENDING_ACTIONS_KEY);
  } catch (error) {
    console.error('Error clearing pending actions:', error);
  }
};

/**
 * Remove a specific pending action by type
 */
export const removePendingAction = async (type: PendingAction['type']): Promise<void> => {
  try {
    const actions = await getPendingActions();
    const filtered = actions.filter(action => action.type !== type);
    await setItem(PENDING_ACTIONS_KEY, filtered);
  } catch (error) {
    console.error('Error removing pending action:', error);
  }
};

/**
 * Store navigation state for restoration after authentication
 */
export const storeNavigationState = async (state: any): Promise<void> => {
  try {
    await setItem(NAVIGATION_STATE_KEY, state);
  } catch (error) {
    console.error('Error storing navigation state:', error);
  }
};

/**
 * Get stored navigation state
 */
export const getNavigationState = async (): Promise<any | null> => {
  try {
    return await getItem(NAVIGATION_STATE_KEY);
  } catch (error) {
    console.error('Error getting navigation state:', error);
    return null;
  }
};

/**
 * Clear stored navigation state
 */
export const clearNavigationState = async (): Promise<void> => {
  try {
    await removeItem(NAVIGATION_STATE_KEY);
  } catch (error) {
    console.error('Error clearing navigation state:', error);
  }
};

/**
 * Check if pending actions have expired (older than 24 hours)
 */
export const clearExpiredPendingActions = async (): Promise<void> => {
  try {
    const actions = await getPendingActions();
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    const validActions = actions.filter(action => {
      return (now - action.timestamp) < TWENTY_FOUR_HOURS;
    });
    
    if (validActions.length !== actions.length) {
      await setItem(PENDING_ACTIONS_KEY, JSON.stringify(validActions));
    }
  } catch (error) {
    console.error('Error clearing expired pending actions:', error);
  }
};

