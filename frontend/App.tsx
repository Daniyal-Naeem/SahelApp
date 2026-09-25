import React, {useEffect, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  CheckoutScreen,
  ForgotPasswordScreen,
  GiftScreen,
  HomeScreen,
  LanguageScreen,
  LoginScreen,
  NotificationsScreen,
  OnboardingScreen,
  OrdersScreen,
  OrderDetailsScreen,
  OTPScreen,
  PlaceOrder,
  PaymentScreen,
  ProductsDetailsScreen,
  ResetPasswordScreen,
  ReviewsScreen,
  SignupScreen,
  SplashScreen,
  SupportScreen,
  VIPClubScreen,
} from './src/screens';
import GetStartedScreen from './src/screens/GetStartedScreen';
import VendorProductsScreen from './src/screens/VendorProductsScreen';
import VendorAddProductScreen from './src/screens/VendorAddProductScreen';
import BuyCreditsScreen from './src/screens/BuyCreditsScreen';
import {ItemDetails} from './src/constants/types';
import {getItem, setItem} from './src/utils/AsyncStorage';
import {ActivityIndicator, View, StyleSheet, Platform, StatusBar} from 'react-native';
import {Colors} from './src/constants/styles';
import {ProductsProvider} from './src/context/ProductsContext';
import {store} from './src/store/store';
import {useAppDispatch, useAppSelector} from './src/store/hooks';
import CustomDrawerContent from './src/components/CustomDrawerContent';
import {ToastProvider} from 'react-native-toast-notifications';
import {hydrateSession} from './src/services/session';
import {CartItem} from './src/store/cartSlice';
import {I18nProvider} from './src/i18n/I18nContext';

export type RouteStackParamList = {
  Onboarding: undefined;
  GetStarted: undefined;
  Login: {redirect?: 'Checkout'} | undefined;
  Signup: {redirect?: 'Checkout'} | undefined;
  HomeScreen: {screen?: string; initialTab?: string; scrollToAddress?: boolean} | undefined;
  Checkout: {cartItems?: CartItem[]; itemDetails?: ItemDetails} | undefined;
  PlaceOrder: {cartItems?: CartItem[]; itemDetails?: ItemDetails} | undefined;
  Payment: {cartItems?: CartItem[]; itemDetails?: ItemDetails; shippingAddress?: any} | undefined;
  ForgotPassword: undefined;
  OTP: undefined;
  ResetPassword: undefined;
  ProductDetails: {productId: string; itemDetails?: ItemDetails} | undefined;
  Reviews: {reviews: any[]; productTitle?: string} | undefined;
  SendGift: {itemDetails: ItemDetails} | undefined;
  VIPClub: undefined;
  Notifications: undefined;
  Support: undefined;
  Language: undefined;
  Gifts: undefined;
  BuyCredits: undefined;
  Orders: undefined;
  OrderDetails: {order: any} | undefined;
  VendorProducts: undefined;
  VendorAddProduct: undefined;
};

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={props => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerType: 'front',
      swipeEdgeWidth: 80,
    }}>
    <Drawer.Screen
      name="Dashboard"
      component={HomeScreen}
      options={{title: 'Home'}}
    />
    <Drawer.Screen
      name="VIPClub"
      component={VIPClubScreen}
      options={{title: 'VIP Club'}}
    />
    <Drawer.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{title: 'Notifications'}}
    />
    <Drawer.Screen
      name="Support"
      component={SupportScreen}
      options={{title: 'Support'}}
    />
    <Drawer.Screen
      name="Language"
      component={LanguageScreen}
      options={{title: 'Language'}}
    />
    <Drawer.Screen
      name="Gifts"
      component={GiftScreen}
      options={{title: 'Gifts'}}
    />
    <Drawer.Screen
      name="BuyCredits"
      component={BuyCreditsScreen}
      options={{title: 'Buy Credits'}}
    />
    <Drawer.Screen
      name="Orders"
      component={OrdersScreen}
      options={{title: 'My Orders'}}
    />
    <Drawer.Screen
      name="VendorProducts"
      component={VendorProductsScreen}
      options={{title: 'My Products'}}
    />
    <Drawer.Screen
      name="VendorAddProduct"
      component={VendorAddProductScreen}
      options={{title: 'Add Product'}}
    />
  </Drawer.Navigator>
);

const RootNavigator = () => {
  const Stack = createNativeStackNavigator<RouteStackParamList>();
  const dispatch = useAppDispatch();
  const {hydrated} = useAppSelector(state => state.auth);
  const [showOnboarded, setShowOnboarded] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    checkIfAlreadyOnboarded();
    hydrateSession(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#ffffff', true);
      StatusBar.setBarStyle('dark-content', true);
    }
  }, []);

  // Guests may browse Home without signing in. Skip onboarding gate.
  const checkIfAlreadyOnboarded = async () => {
    const onboarded = await getItem('onboarded');
    if (onboarded !== 200 && onboarded !== '200') {
      await setItem('onboarded', 200);
    }
    setShowOnboarded(false);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (showOnboarded === null || !hydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={'large'} color={Colors.black[300]} />
      </View>
    );
  }

  // Always land on Home so guests can browse immediately.
  // Auth is only required at checkout / profile actions.
  const initialRoute: keyof RouteStackParamList = 'HomeScreen';

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={initialRoute}>
        <Stack.Screen name="HomeScreen" component={DrawerNavigator} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="PlaceOrder" component={PlaceOrder} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="ProductDetails" component={ProductsDetailsScreen} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VIPClub" component={VIPClubScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="Gifts" component={GiftScreen} />
        <Stack.Screen name="BuyCredits" component={BuyCreditsScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="VendorProducts" component={VendorProductsScreen} />
        <Stack.Screen
          name="VendorAddProduct"
          component={VendorAddProductScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <I18nProvider>
          <ProductsProvider>
            <ToastProvider
              placement="bottom"
              offsetBottom={50}
              swipeEnabled={true}
              normalColor="#333">
              <GestureHandlerRootView style={{flex: 1}}>
                <RootNavigator />
              </GestureHandlerRootView>
            </ToastProvider>
          </ProductsProvider>
        </I18nProvider>
      </Provider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
