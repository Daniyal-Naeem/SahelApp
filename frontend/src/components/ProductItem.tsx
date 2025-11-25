import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React from 'react';
import {ItemDetails, ProductTypes} from '../constants/types';
import {images} from '../constants';
import {Rating, AirbnbRating} from 'react-native-ratings';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../screens/OnboardingScreen';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteStackParamList} from '../../App';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';

type ProductItemProps = {
  image: string;
  title: string;
  description: string;
  price: number;
  priceBeforeDeal: number;
  priceOff: string;
  stars: number;
  numberOfReview: number;
  ukSide?: number[];
  itemDetails: ItemDetails;
};

const ProductItem: React.FC<ProductItemProps> = ({
  image,
  title,
  description,
  price,
  priceBeforeDeal,
  priceOff,
  stars,
  numberOfReview,
  itemDetails,
}) => {
  const navigation = useNavigation<StackNavigationProp<RouteStackParamList, 'ProductDetails'>>();
  const NavigateToProductsDetails = () => {
    navigation.navigate('ProductDetails', {itemDetails});
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={NavigateToProductsDetails}>
      <Image source={{uri: image}} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>
          {title}
        </Text>
        <Text style={styles.description}>
          {description}
        </Text>
        <Text style={styles.price}>
          ${price}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceBeforeDeal}>
            {priceBeforeDeal}
          </Text>
          <Text style={styles.priceOff}> {priceOff} </Text>
        </View>
        <View style={styles.ratingContainer}>
          <View>
            <AirbnbRating
              count={stars}
              reviews={['Terrible', 'Bad', 'Okay', 'Good', 'Great']}
              defaultRating={stars}
              size={20}
              ratingContainerStyle={{flex: 1, flexDirection: 'row'}}
            />
          </View>

          <Text style={styles.reviewCount}>
            {numberOfReview}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: r(288),
    backgroundColor: Colors.white,
    borderRadius: r(12),
  },
  image: {
    width: '100%',
    borderTopLeftRadius: r(12),
    borderTopRightRadius: r(12),
    height: r(160),
  },
  content: {
    paddingHorizontal: Spacing[3],
  },
  title: {
    fontSize: FontSizes['3xl'],
    color: Colors.black[100],
    marginVertical: Spacing[2],
    textAlign: 'left',
    fontFamily: FontFamilies.mbold,
  },
  description: {
    fontSize: FontSizes.xl,
    color: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'left',
    fontFamily: FontFamilies.pmedium,
  },
  price: {
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    fontSize: FontSizes['2xl'],
    textAlign: 'left',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  priceBeforeDeal: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontFamily: FontFamilies.mthin,
    fontSize: FontSizes.xl,
    textDecorationLine: 'line-through',
    textAlign: 'left',
  },
  priceOff: {
    color: Colors.action,
    fontFamily: FontFamilies.mthin,
    fontSize: FontSizes.xl,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  reviewCount: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mthin,
    color: 'rgba(0, 0, 0, 0.9)',
  },
});

export default ProductItem;
