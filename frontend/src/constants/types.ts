import {ImageSourcePropType} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RouteStackParamList} from '../../App';

// Global type helper for screen props
export type ScreenProps<T extends keyof RouteStackParamList> = NativeStackScreenProps<RouteStackParamList, T>;

type SplashTypes = {
  image: ImageSourcePropType;
  title: string;
  description: string;
};

type FeaturesTypes = {
  image: string;
  title: string;
};
type ReviewType = {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
};

type VariationType = {
  type: 'color' | 'size' | 'material';
  label: string;
  options: Array<{
    value: string;
    label: string;
    image?: string;
    isSelected?: boolean;
  }>;
};

type SpecificationType = {
  label: string;
  value: string;
};

type DeliveryOptionType = {
  type: string;
  duration: string;
  price: number;
};

type ItemDetails = ProductTypes;
type ProductTypes = {
  image: string[];
  status?: {
    icon?: string;
    name?: string;
  };
  _id: string;
  title: string;
  subtitle?: string; // e.g., "Vision Alta Women's Kurta Size (All Colours)"
  description: string;
  price: number;
  priceBeforeDeal: number;
  priceOff: string;
  stars: number;
  numberOfReview: number;
  ukSide?: string[] | number[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  // Additional fields for product detail screen
  variations?: VariationType[];
  specifications?: SpecificationType[];
  deliveryOptions?: DeliveryOptionType[];
  colorOptions?: Array<{
    color: string;
    name: string;
    isSelected?: boolean;
  }>;
  reviews?: ReviewType[];
  similarItems?: ProductTypes[];
};
type TabBarTypes = {
  title?: string;
  image: string;
  link: string;
  inActiveColor: string;
  activeColor: string;
  inActiveBGColor?: string;
  activeBGColor?: string;
};

export type {
  SplashTypes,
  FeaturesTypes,
  ProductTypes,
  TabBarTypes,
  ItemDetails,
  ReviewType,
  VariationType,
  SpecificationType,
  DeliveryOptionType,
};
