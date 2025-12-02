import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeTab, WishlistTab, CartTab, SearchTab, SettingTab} from '../tabs';
import ProductsDetailsScreen from './ProductsDetailsScreen';
import ReviewsScreen from './ReviewsScreen';
import SendGiftScreen from './SendGiftScreen';
import {View, Text} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {cartTabIcon} from '../assets/svgs/cartTabIcon';
import {wishlistTabIcon} from '../assets/svgs/wishlistTabIcon';
import {homeTabIcon} from '../assets/svgs/homeTabIcon';
import {searchTabIcon} from '../assets/svgs/searchTabIcon';
import {profileTabIcon} from '../assets/svgs/profileTabIcon';
import { ItemDetails } from '../constants/types';
import {FontFamilies, r, Colors} from '../constants/styles';
import {RouteStackParamList} from '../../App';

type TabBarItemProps = {
  icon: string;
  focused: boolean;
  isHome?: boolean;
};

const TabBarItem = ({
  icon,
  focused: _focused,
  isHome,
}: TabBarItemProps) => {
  // For home tab, the SVG already includes the red circle background
  if (isHome) {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: r(-28),
        }}>
        <SvgXml xml={icon} />
      </View>
    );
  }

  // For other tabs, use the SVG icon as is
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <SvgXml xml={icon} />
    </View>
  );
};

type TabBarLabelProps = {
  focused: boolean;
  children: string;
};

const TabBarLabel = ({focused, children}: TabBarLabelProps) => {
  return (
    <Text
      style={{
        fontFamily: focused ? FontFamilies.msemibold : FontFamilies.mregular,
        fontSize: r(12),
        color: focused ? Colors.primary : Colors.black[100],
      }}>
      {children}
    </Text>
  );
};
type Props = {};
export type RouteTabsParamList = {
  Home: undefined;
  Wishlist: undefined;
  Cart: {itemDetails: ItemDetails}  | undefined;
  Search: {query: string} | undefined;
  Profile: undefined;
};

// Create a Stack Navigator for Home tab that includes ProductDetails and Reviews
const HomeStack = createNativeStackNavigator<{
  HomeTab: undefined;
  ProductDetails: {itemDetails: ItemDetails} | undefined;
  Reviews: {reviews: any[]; productTitle?: string} | undefined;
  SendGift: {itemDetails: ItemDetails} | undefined;
}>();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{headerShown: false}}>
      <HomeStack.Screen name="HomeTab" component={HomeTab} />
      <HomeStack.Screen name="ProductDetails" component={ProductsDetailsScreen} />
      <HomeStack.Screen name="Reviews" component={ReviewsScreen} />
      <HomeStack.Screen name="SendGift" component={SendGiftScreen} />
    </HomeStack.Navigator>
  );
};

const HomeScreen = (_props: Props) => {
  const Tab = createBottomTabNavigator<RouteTabsParamList>();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#E5E5E5',
          borderTopWidth: r(0.5),
          height: r(80),           // increased height for icon + label
          shadowColor: '#000',
          shadowOffset: { width: 0, height: r(-2) },
          shadowOpacity: 0.1,
          shadowRadius: r(4),
          elevation: 5,
          paddingBottom: r(8),     // space for label
          paddingTop: r(8),
        },
        tabBarIconStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: r(2),
        },
        tabBarLabelStyle: {
          fontSize: r(12),
          marginBottom: r(2),
        },
        tabBarInactiveTintColor: Colors.black[100],
        tabBarActiveTintColor: Colors.primary,
      }}
    >
      <Tab.Screen
        name="Cart"
        component={CartTab}
        options={{
          tabBarLabel: ({focused}) => <TabBarLabel focused={focused}>Cart</TabBarLabel>,
          tabBarIcon: ({ focused }) => <TabBarItem icon={cartTabIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistTab}
        options={{
          tabBarLabel: ({focused}) => <TabBarLabel focused={focused}>Wishlist</TabBarLabel>,
          tabBarIcon: ({ focused }) => <TabBarItem icon={wishlistTabIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabBarItem icon={homeTabIcon} focused={focused} isHome />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchTab}
        options={{
          tabBarLabel: ({focused}) => <TabBarLabel focused={focused}>Search</TabBarLabel>,
          tabBarIcon: ({ focused }) => <TabBarItem icon={searchTabIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingTab}
        options={{
          tabBarLabel: ({focused}) => <TabBarLabel focused={focused}>Profile</TabBarLabel>,
          tabBarIcon: ({ focused }) => <TabBarItem icon={profileTabIcon} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
  
  
  
};

export default HomeScreen;
