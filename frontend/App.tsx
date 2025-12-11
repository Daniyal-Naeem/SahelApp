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
  HomeScreen,
  LanguageScreen,
  LoginScreen,
  NotificationsScreen,
  OnboardingScreen,
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
import {ItemDetails} from './src/constants/types';
import {getItem} from './src/utils/AsyncStorage';
import {ActivityIndicator, View, StyleSheet, Platform, StatusBar} from 'react-native';
import {Colors} from './src/constants/styles';
import {ProductsProvider} from './src/context/ProductsContext';
import {store} from './src/store/store';
import CustomDrawerContent from './src/components/CustomDrawerContent';

export type RouteStackParamList = {
  Onboarding: undefined;
  GetStarted: undefined;
  Login: undefined;
  Signup: undefined;
  HomeScreen: {screen?: string} | undefined;
  Checkout: {itemDetails: ItemDetails} | undefined;
  PlaceOrder: {itemDetails: ItemDetails} | undefined;
  Payment: {itemDetails: ItemDetails} | undefined;
  ForgotPassword: undefined;
  OTP: undefined;
  ResetPassword: undefined;
  ProductDetails: {itemDetails: ItemDetails} | undefined;
  Reviews: {reviews: any[]; productTitle?: string} | undefined;
  SendGift: {itemDetails: ItemDetails} | undefined;
  VIPClub: undefined;
  Notifications: undefined;
  Support: undefined;
  Language: undefined;
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
  </Drawer.Navigator>
);

const App = () => {
  const Stack = createNativeStackNavigator<RouteStackParamList>();
  const [showOnboarded, setShowOnboarded] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    checkIfAlreadyOnboarded();
  }, []);
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#ffffff', true);
      StatusBar.setBarStyle('dark-content', true);
    }
  }, []);
  const checkIfAlreadyOnboarded = async () => {
    const onboarded = await getItem('onboarded');
    if (onboarded === 200) {
      setShowOnboarded(false);
    } else {
      setShowOnboarded(true);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (showOnboarded === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={'large'} color={Colors.black[300]} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ProductsProvider>
          <GestureHandlerRootView style={{flex: 1}}>
            <NavigationContainer>
            <Stack.Navigator
              screenOptions={{headerShown: false}}
              initialRouteName={showOnboarded ? 'Onboarding' : 'HomeScreen'}>
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
            <Stack.Screen
              name="ProductDetails"
              component={ProductsDetailsScreen}
            />
            <Stack.Screen
              name="Reviews"
              component={ReviewsScreen}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="VIPClub"
              component={VIPClubScreen}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
            />
            <Stack.Screen
              name="Support"
              component={SupportScreen}
            />
            <Stack.Screen
              name="Language"
              component={LanguageScreen}
            />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </ProductsProvider>
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
