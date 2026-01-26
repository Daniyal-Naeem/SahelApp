import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet, Alert} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {CustomButton, FormField} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {googleIcon} from '../assets/svgs/googleIcon';
import AppleIcon from '../assets/svgs/Apple.svg';
import FacebookIcon from '../assets/svgs/Facebook.svg';
import {login, googleLogin, appleLogin, facebookLogin} from '../services/authService';
import {executePendingActions} from '../utils/authGuard';
import {syncCartToBackend, getCart} from '../services/cartService';
import {useAppDispatch} from '../store';
import {setCart} from '../store/cartSlice';

type Props = {};

const LoginScreen = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
  });
  type RootStackParamList = {
    ForgotPassword: undefined;
    Signup: undefined;
    HomeScreen: undefined;
  };
  
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleLogin = async () => {
    // Basic validation
    if (!form.email && !form.username) {
      setEmailError('Email or username is required');
      return;
    }
    if (!form.password) {
      setPasswordError('Password is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const loginData = {
        email: form.email || undefined,
        username: form.username || undefined,
        password: form.password,
      };
      
      await login(loginData, navigation);
      
      // Sync cart to backend after login
      try {
        await syncCartToBackend();
        // Refresh Redux cart from backend after sync
        const backendCart = await getCart();
        if (backendCart && backendCart.items && Array.isArray(backendCart.items)) {
          const mappedItems = backendCart.items.map((item: any) => ({
            ...(item.product || item),
            quantity: item.quantity || 1,
            selectedVariation: item.variation?.variation,
            selectedColor: item.variation?.color,
            selectedDelivery: item.variation?.delivery,
          }));
          dispatch(setCart(mappedItems));
        }
      } catch (cartError) {
        console.error('Error syncing cart:', cartError);
      }
      
      // Execute pending actions (wishlist, checkout, etc.)
      await executePendingActions(navigation);
      
      // Navigate to home
      navigation.navigate('HomeScreen');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement Google Sign-In SDK integration
      // For now, this is a placeholder
      Alert.alert('Coming Soon', 'Google login will be available soon');
      // Example:
      // const {idToken} = await GoogleSignIn.signIn();
      // await googleLogin({idToken}, navigation);
      // await syncCartToBackend();
      // await executePendingActions(navigation);
      // navigation.navigate('HomeScreen');
    } catch (error: any) {
      Alert.alert('Error', 'Google login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAppleLogin = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement Apple Sign-In SDK integration
      // For now, this is a placeholder
      Alert.alert('Coming Soon', 'Apple login will be available soon');
      // Example:
      // const {idToken, user} = await AppleAuthentication.signIn();
      // await appleLogin({idToken, user}, navigation);
      // await syncCartToBackend();
      // await executePendingActions(navigation);
      // navigation.navigate('HomeScreen');
    } catch (error: any) {
      Alert.alert('Error', 'Apple login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFacebookLogin = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement Facebook Sign-In SDK integration
      // For now, this is a placeholder
      Alert.alert('Coming Soon', 'Facebook login will be available soon');
      // Example:
      // const {accessToken} = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      // await facebookLogin({accessToken}, navigation);
      // await syncCartToBackend();
      // await executePendingActions(navigation);
      // navigation.navigate('HomeScreen');
    } catch (error: any) {
      Alert.alert('Error', 'Facebook login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSignInWithProvider = (provider: 'google' | 'apple' | 'facebook') => {
    if (provider === 'google') {
      handleGoogleLogin();
    } else if (provider === 'apple') {
      handleAppleLogin();
    } else if (provider === 'facebook') {
      handleFacebookLogin();
    }
  };
  
  const handleNavigateToSignUp = () => {
    navigation.navigate('Signup');
  };
  return (
    <View style={styles.container}>
      <Text style={[styles.title, {fontFamily: FontFamilies.msemibold}]}>
        Welcome back
      </Text>
      <View>
        {/* text input */}
        <FormField
          title="Username or Email"
          value={form.email}
          setError={setEmailError}
          error={emailError}
          handleChangeText={(e: any) => {
            setEmailError('');
            setForm({...form, email: e});
          }}
          placeholder="Username or Email"
          otherStyles={styles.formField}
        />
        <View>
          <FormField
            title="Password"
            value={form.password}
            setError={setPasswordError}
            error={passwordError}
            handleChangeText={(e: any) => {
              setPasswordError('');
              setForm({...form, password: e});
            }}
            placeholder="Password"
            otherStyles={styles.formFieldSmall}
          />
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}>
            <Text
              style={[
                styles.forgotPasswordText,
                {fontFamily: FontFamilies.mmedium},
              ]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
        {/* submit btn */}
        <CustomButton
          title="Login"
          handlePress={handleLogin}
          isLoading={isSubmitting}
          containerStyle={styles.buttonContainer}
        />
        {/* or continue with  */}
        <View style={styles.centerContainer}>
          <View style={styles.dividerContainer}>
       
            <Text style={styles.dividerText}>- OR Continue with -</Text>
          
          </View>
          <View style={styles.socialContainer}>
            <TouchableOpacity onPress={() => handleSignInWithProvider('google')} style={styles.socialButton}>
              <SvgXml xml={googleIcon} width={r(24)} height={r(24)} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSignInWithProvider('apple')} style={styles.socialButton}>
              <AppleIcon width={r(24)} height={r(24)} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSignInWithProvider('facebook')} style={styles.socialButton}>
              <FacebookIcon width={r(24)} height={r(24)} />
            </TouchableOpacity>
          </View>
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Create An Account</Text>
            <TouchableOpacity onPress={handleNavigateToSignUp}>
              <Text
                style={[styles.signupLink, {fontFamily: FontFamilies.mbold}]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Spacing[28],
  },
  title: {
    fontSize: FontSizes['3xl'],
    marginBottom: Spacing[8],
  },
  formField: {
    marginBottom: Spacing[6],
  },
  formFieldSmall: {
    marginBottom: Spacing[3],
  },
  forgotPassword: {
    marginBottom: Spacing[6],
  },
  forgotPasswordText: {
    color: Colors.action,
    fontSize: FontSizes.xs,
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    marginBottom: Spacing[8],
  },
  centerContainer: {
    alignSelf: 'center',
    marginTop: Spacing[4],
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[5],
  },
  divider: {
    flex: 1,
    height: r(1),
    backgroundColor: Colors.gray[300],
  },
  dividerText: {
    color: '#575757',
    fontSize: FontSizes.xs,
    marginHorizontal: Spacing[3],
  },
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[6],
    justifyContent: 'center',
  },
  socialButton: {
    width: r(48),
    height: r(48),
    borderRadius: r(24),
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r(4),
    justifyContent: 'center',
  },
  signupText: {
    color: '#575757',
    fontSize: FontSizes.sm,
  },
  signupLink: {
    fontSize: FontSizes.sm,
    textDecorationLine: 'underline',
    color: Colors.action,
  },
});

export default LoginScreen;
