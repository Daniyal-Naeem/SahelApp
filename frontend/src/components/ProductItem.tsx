import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React, {useState} from 'react';
import {ItemDetails, ProductTypes} from '../constants/types';
import {images, icons} from '../constants';
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
  priceOff: string | number;
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const NavigateToProductsDetails = () => {
    navigation.navigate('ProductDetails', {itemDetails});
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Calculate discount percentage
  const discountPercent = Math.round(((priceBeforeDeal - price) / priceBeforeDeal) * 100);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={NavigateToProductsDetails}
      activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{uri: image}} style={styles.image} resizeMode="cover" />
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={toggleWishlist}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Image 
            source={icons.heart} 
            style={[styles.wishlistIcon, isWishlisted && styles.wishlistIconActive]} 
            resizeMode="contain"
          />
        </TouchableOpacity>
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% Off</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            SAR {price.toFixed(2)}
          </Text>
          {priceBeforeDeal > price && (
            <Text style={styles.priceBeforeDeal}>
              SAR {priceBeforeDeal.toFixed(2)}
            </Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            <AirbnbRating
              count={5}
              defaultRating={stars}
              size={12}
              showRating={false}
              isDisabled={true}
              selectedColor="#FFD700"
              ratingContainerStyle={styles.ratingStars}
            />
          </View>
          <Text style={styles.reviewCount}>
            {formatNumber(numberOfReview)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: r(180),
    backgroundColor: Colors.white,
    borderRadius: r(12),
    marginHorizontal: Spacing[2],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: r(180),
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background[200],
  },
  wishlistButton: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    width: r(32),
    height: r(32),
    borderRadius: r(16),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  wishlistIcon: {
    width: r(18),
    height: r(18),
    tintColor: Colors.neutral[500],
  },
  wishlistIconActive: {
    tintColor: Colors.action,
  },
  discountBadge: {
    position: 'absolute',
    bottom: Spacing[2],
    left: Spacing[2],
    backgroundColor: '#FF6B9D',
    paddingHorizontal: Spacing[2],
    paddingVertical: r(4),
    borderRadius: r(6),
  },
  discountText: {
    color: Colors.white,
    fontSize: r(11),
    fontFamily: FontFamilies.psemibold,
  },
  content: {
    padding: Spacing[3],
  },
  title: {
    fontSize: FontSizes.base,
    color: Colors.black[100],
    marginBottom: Spacing[1],
    fontFamily: FontFamilies.psemibold,
    lineHeight: r(20),
    minHeight: r(40),
  },
  description: {
    fontSize: FontSizes.xs,
    color: Colors.neutral[500],
    marginBottom: Spacing[2],
    fontFamily: FontFamilies.pregular,
    lineHeight: r(16),
    minHeight: r(32),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[2],
  },
  price: {
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    fontSize: FontSizes.lg,
  },
  priceBeforeDeal: {
    color: Colors.neutral[400],
    fontFamily: FontFamilies.pregular,
    fontSize: FontSizes.sm,
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: r(2),
  },
  reviewCount: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.pregular,
    color: Colors.neutral[500],
    marginLeft: Spacing[1],
  },
});

export default ProductItem;
