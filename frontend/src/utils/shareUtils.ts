import {Linking, Platform, Alert, Share} from 'react-native';
import {ItemDetails} from '../constants/types';

/**
 * Share Utilities
 * Handles product sharing via various platforms
 */

export interface ShareOptions {
  title: string;
  message: string;
  url?: string;
}

/**
 * Generate product share URL (deep link)
 * In production, this would be your app's deep link URL
 */
export const generateProductShareUrl = (productId: string): string => {
  // TODO: Replace with actual deep link URL when available
  // Example: https://sahal.app/product/${productId}
  return `https://sahal.app/product/${productId}`;
};

/**
 * Generate share message for product
 */
export const generateProductShareMessage = (product: ItemDetails): string => {
  const price = product.price || 0;
  const currency = (product as any).currency || 'SAR';
  const discount = product.priceOff || '';
  
  let message = `Check out this amazing product!\n\n`;
  message += `📦 ${product.title || 'Product'}\n`;
  if (product.description) {
    message += `${product.description.substring(0, 100)}...\n\n`;
  }
  message += `💰 Price: ${currency} ${price}`;
  if (discount) {
    message += ` (${discount} OFF)`;
  }
  message += `\n\n`;
  message += `View on Sahal App: ${generateProductShareUrl(product._id || '')}`;
  
  return message;
};

/**
 * Share via native share dialog
 */
export const shareViaNative = async (options: ShareOptions): Promise<void> => {
  try {
    const result = await Share.share({
      message: options.message,
      title: options.title,
      url: options.url,
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // Shared with activity type of result.activityType
        console.log('Shared via:', result.activityType);
      } else {
        // Shared
        console.log('Shared successfully');
      }
    } else if (result.action === Share.dismissedAction) {
      // Dismissed
      console.log('Share dismissed');
    }
  } catch (error: any) {
    console.error('Error sharing:', error);
    Alert.alert('Error', 'Failed to share. Please try again.');
  }
};

/**
 * Share via WhatsApp
 */
export const shareViaWhatsApp = async (message: string): Promise<void> => {
  try {
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Fallback to web WhatsApp
      const webUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      await Linking.openURL(webUrl);
    }
  } catch (error: any) {
    console.error('Error sharing via WhatsApp:', error);
    Alert.alert(
      'WhatsApp Not Available',
      'Please install WhatsApp to share via WhatsApp.'
    );
  }
};

/**
 * Share via SMS
 */
export const shareViaSMS = async (message: string): Promise<void> => {
  try {
    const url = `sms:?body=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('SMS Not Available', 'SMS is not available on this device.');
    }
  } catch (error: any) {
    console.error('Error sharing via SMS:', error);
    Alert.alert('Error', 'Failed to open SMS. Please try again.');
  }
};

/**
 * Share via Facebook
 */
export const shareViaFacebook = async (url: string, message?: string): Promise<void> => {
  try {
    // Facebook sharing via URL scheme
    // Note: Facebook app sharing requires app ID and proper setup
    // For now, we'll use the web share URL
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    
    if (message) {
      // Try to open Facebook app with share intent
      const appUrl = `fb://share?href=${encodeURIComponent(url)}`;
      const canOpen = await Linking.canOpenURL(appUrl);
      
      if (canOpen) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(facebookUrl);
      }
    } else {
      await Linking.openURL(facebookUrl);
    }
  } catch (error: any) {
    console.error('Error sharing via Facebook:', error);
    Alert.alert('Error', 'Failed to open Facebook. Please try again.');
  }
};

/**
 * Copy link to clipboard
 * Uses React Native's Share API as fallback since Clipboard API varies by version
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    // Try to use Clipboard if available (React Native 0.60+)
    try {
      const {Clipboard} = require('react-native');
      if (Clipboard && typeof Clipboard.setString === 'function') {
        Clipboard.setString(text);
        Alert.alert('Copied!', 'Link copied to clipboard');
        return;
      }
    } catch (clipboardError) {
      // Clipboard not available, continue to fallback
    }

    // Fallback: Use Share API which works on all platforms
    const result = await Share.share({
      message: text,
      title: 'Copy Link',
    });

    // If user cancels share, show the link in an alert so they can manually copy
    if (result.action === Share.dismissedAction) {
      Alert.alert('Copy Link', text, [
        {text: 'OK'},
      ]);
    }
  } catch (error: any) {
    console.error('Error copying to clipboard:', error);
    // Final fallback: Show the text so user can manually copy
    Alert.alert('Copy Link', text, [
      {text: 'OK'},
    ]);
  }
};

/**
 * Share product via all available methods
 */
export const shareProduct = async (product: ItemDetails): Promise<void> => {
  const message = generateProductShareMessage(product);
  const url = generateProductShareUrl(product._id || '');
  
  await shareViaNative({
    title: product.title || 'Product',
    message,
    url,
  });
};

/**
 * Get available share options based on platform
 */
export const getAvailableShareOptions = (): string[] => {
  const options = ['Native Share', 'Copy Link'];
  
  // WhatsApp is available on most platforms
  options.push('WhatsApp');
  
  // SMS is available on mobile platforms
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    options.push('SMS');
  }
  
  // Facebook
  options.push('Facebook');
  
  return options;
};
