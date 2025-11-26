import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import React, {useState} from 'react';
import {ItemDetails} from '../constants/types';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteStackParamList} from '../../App';
import {Colors, Spacing, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {favoriteIcon} from '../assets/svgs/favoriteIcon';
import {favoriteActiveIcon} from '../assets/svgs/favoriteActiveIcon';
import {activeStar} from '../assets/svgs/activeStar';
import {halfStar} from '../assets/svgs/halfstar';
import {inactiveStar} from '../assets/svgs/inactiveStar';

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
  currency?: string; // Dynamic currency, defaults to 'SAR'
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
  currency = 'SAR', // Default currency
}) => {
  const navigation = useNavigation<StackNavigationProp<RouteStackParamList, 'ProductDetails'>>();
  const [isFavorite, setIsFavorite] = useState(false);

  const NavigateToProductsDetails = () => {
    // Navigate with both itemDetails and productId for API fetching
    navigation.navigate('ProductDetails', {
      itemDetails,
      productId: itemDetails._id,
    });
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Render stars using SVG icons
  const renderStars = () => {
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;
    const starsArray = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsArray.push(
          <SvgXml
            key={i}
            xml={activeStar}
            width={r(16)}
            height={r(16)}
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        starsArray.push(
          <SvgXml
            key={i}
            xml={halfStar}
            width={r(16)}
            height={r(16)}
          />
        );
      } else {
        // Empty/inactive star
        starsArray.push(
          <SvgXml
            key={i}
            xml={inactiveStar}
            width={r(16)}
            height={r(16)}
          />
        );
      }
    }
    return starsArray;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={NavigateToProductsDetails}>
      <View style={styles.imageContainer}>
        <FastImage source={{uri: image}} style={styles.image} />
        <TouchableOpacity
          style={styles.heartButton}
          onPress={handleFavoritePress}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <SvgXml
            xml={isFavorite ? favoriteActiveIcon : favoriteIcon}
        
          />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          {title}
        </Text>
        <Text style={styles.description}>
          {description}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {currency} {price}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceBeforeDeal}>
            {currency} {priceBeforeDeal}
          </Text>
          <Text style={styles.priceOff}>{priceOff}Off</Text>
        </View>
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {renderStars()}
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
    width: r(288),
    backgroundColor: Colors.white,
    borderRadius: r(12),
    // Removed overflow: 'hidden' to allow shadow to show
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05, // Reduced shadow opacity
    shadowRadius: 2, // Reduced shadow radius
    elevation: 1, // Reduced elevation for Android
    marginBottom: r(4), // Add space for shadow at bottom
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden', // Apply overflow hidden to image container instead
    borderTopLeftRadius: r(12),
    borderTopRightRadius: r(12),
  },
  image: {
    width: '100%',
    height: r(200),
    resizeMode: 'cover',
    // Border radius handled by imageContainer
  },
  heartButton: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    width: r(32),
    height: r(32),
    borderRadius: r(16),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing[1],
    paddingVertical: Spacing[3],
  },
  title: {
    fontSize: r(16),
    color: Colors.black[100],
    marginBottom: Spacing[2],
    textAlign: 'left',
    fontFamily: FontFamilies.mmedium,
    fontWeight: '500',
  },
  description: {
    fontSize: r(12),
    color: Colors.black[100],
    textAlign: 'left',
    fontFamily: FontFamilies.mregular,
    marginBottom: Spacing[3],
    lineHeight: r(18)
  },
  priceRow: {
    marginBottom: Spacing[1],
  },
  price: {
    color: Colors.black[100],
    fontFamily: FontFamilies.mmedium,
    fontSize: r(18),
    textAlign: 'left',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  priceBeforeDeal: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontFamily: FontFamilies.mregular || FontFamilies.mthin,
    fontSize: r(12),
    textDecorationLine: 'line-through',
    textAlign: 'left',
  },
  priceOff: {
    color: '#FF6B35', // Orange/red color for discount
    fontFamily: FontFamilies.mregular || FontFamilies.mthin,
    fontSize: r(12),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r(2),
  },
  reviewCount: {
    fontSize: r(12),
    fontFamily: FontFamilies.mregular || FontFamilies.mthin,
    color: 'rgba(0, 0, 0, 0.5)', // Light gray
  },
});

export default ProductItem;
