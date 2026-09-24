import {Alert} from 'react-native';

type AuthNav = {
  navigate: (screen: 'Login' | 'Signup', params?: {redirect?: 'Checkout'}) => void;
};

/**
 * Guests may browse and fill the cart. Checkout requires an account.
 * Returns true when already signed in; otherwise prompts Sign Up / Log In.
 */
export const requireCheckoutAuth = (
  isAuthenticated: boolean,
  navigation: AuthNav,
): boolean => {
  if (isAuthenticated) {
    return true;
  }

  Alert.alert(
    'Sign in to checkout',
    'Create an account or log in to complete your order. You can keep browsing as a guest.',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Up',
        onPress: () => navigation.navigate('Signup', {redirect: 'Checkout'}),
      },
      {
        text: 'Log In',
        onPress: () => navigation.navigate('Login', {redirect: 'Checkout'}),
      },
    ],
  );
  return false;
};
