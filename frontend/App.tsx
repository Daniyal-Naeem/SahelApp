import React, {useEffect, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  CheckoutScreen,
  ForgotPasswordScreen,
  HomeScreen,
  LoginScreen,
  OnboardingScreen,
  OTPScreen,
  PlaceOrder,
  ProductsDetailsScreen,
  ProfileScreen,
  ResetPasswordScreen,
  SignupScreen,
  SplashScreen,
} from './src/screens';
import GetStartedScreen from './src/screens/GetStartedScreen';
import {ItemDetails} from './src/constants/types';
import {getItem} from './src/utils/AsyncStorage';
import {ActivityIndicator, View} from 'react-native';
import {ProductsProvider} from './src/context/ProductsContext';
import CustomDrawerContent from './src/components/CustomDrawerContent';

export type RouteStackParamList = {
  Onboarding: undefined;
  GetStarted: undefined;
  Login: undefined;
  Signup: undefined;
  HomeScreen: undefined;
  Profile: undefined;
  Checkout: undefined;
  PlaceOrder: {itemDetails: ItemDetails} | undefined;
  ForgotPassword: undefined;
  OTP: undefined;
  ResetPassword: undefined;
  ProductDetails: {itemDetails: ItemDetails} | undefined;
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
      name="ProfileDrawer"
      component={ProfileScreen}
      options={{title: 'Profile'}}
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

  const checkIfAlreadyOnboarded = async () => {
    const onboarded = await getItem('onboarded');
    if (onboarded === 200) {
      // successfully onboarded, don't show onboarding screen once again
      setShowOnboarded(false);
      console.log(`it's value should be 200:`, onboarded);
    } else {
      // didn't onboard, show onboarding screen
      setShowOnboarded(true);
      console.log(`it's value is:`, onboarded);
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
      <View className="flex flex-1 justify-center items-center">
        <ActivityIndicator size={'large'} color={'#F3F3F3'} />
      </View>
    );
  }

  return (
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
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen
            name="ProductDetails"
            component={ProductsDetailsScreen}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </ProductsProvider>
  );
};

export default App;
