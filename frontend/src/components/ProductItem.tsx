import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import React, {useState, useEffect, useMemo} from 'react';
import {ItemDetails} from '../constants/types';
import {useNavigation} from '@react-navigation/native';
import {useI18n} from '../contexts/I18nContext';
import {getLocalizedProduct} from '../utils/productTranslations';
import {Colors, Spacing, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {favoriteIcon} from '../assets/svgs/favoriteIcon';
import {favoriteActiveIcon} from '../assets/svgs/favoriteActiveIcon';
import {activeStar} from '../assets/svgs/activeStar';
import {halfStar} from '../assets/svgs/halfstar';
import {inactiveStar} from '../assets/svgs/inactiveStar';
import {useAppSelector, useAppDispatch} from '../store';
import {toggleWishlist, addToWishlist as addToWishlistRedux, removeFromWishlist as removeFromWishlistRedux} from '../store/wishlistSlice';
import {requireAuth, checkAuthStatus} from '../utils/authGuard';
import {toggleWishlist as toggleWishlistAPI, checkWishlist} from '../services/wishlistService';

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
  width?: number; // Optional width for grid layouts
  forceFavoriteActive?: boolean; // Force show active favorite icon (e.g., in wishlist tab)
};

const ProductItem = ({
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
  width,
  forceFavoriteActive = false, // Default to false
}: ProductItemProps) => {
  const navigation = useNavigation<any>();
  const {language} = useI18n();
  const localizedProduct = useMemo(
    () => (itemDetails ? getLocalizedProduct(itemDetails, language) : null),
    [itemDetails, language],
  );
  const displayTitle = localizedProduct?.title ?? title;
  const displayDescription = localizedProduct?.description ?? description;
  const dispatch = useAppDispatch();
  const [isInWishlistAPI, setIsInWishlistAPI] = useState(false);
  const [isCheckingWishlist, setIsCheckingWishlist] = useState(false);
  
  // Check Redux state (for guest mode or local state)
  const isInWishlistRedux = useAppSelector(state =>
    state.wishlist.items.some(item => item._id === itemDetails._id),
  );
  
  // Use API status if authenticated, otherwise use Redux
  const isInWishlist = forceFavoriteActive || (isInWishlistAPI || isInWishlistRedux);

  // Check wishlist status from API when component mounts (if authenticated)
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated && itemDetails._id) {
        setIsCheckingWishlist(true);
        try {
          const inWishlist = await checkWishlist(itemDetails._id);
          setIsInWishlistAPI(inWishlist);
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        } finally {
          setIsCheckingWishlist(false);
        }
      }
    };
    
    checkWishlistStatus();
  }, [itemDetails._id]);

  const NavigateToProductsDetails = () => {
    let rootNavigator = navigation;
    while (rootNavigator.getParent()) {
      rootNavigator = rootNavigator.getParent() as any;
    }

    (rootNavigator as any).navigate('ProductDetails', {
      itemDetails: localizedProduct || itemDetails,
    });
  };

  const handleFavoritePress = async (e: any) => {
    e.stopPropagation();
    
    // Auth gate: Require authentication for wishlist
    await requireAuth(
      async () => {
        // User is authenticated, toggle wishlist via API
        try {
          const wishlistData = await toggleWishlistAPI(itemDetails._id);
          // Update local state based on API response
          if (wishlistData && wishlistData.items) {
            const isInWishlist = wishlistData.items.some(
              (item: any) => (item.product?._id || item.product?.id) === itemDetails._id
            );
            setIsInWishlistAPI(isInWishlist);
            
            // Also update Redux for consistency
            if (isInWishlist) {
              dispatch(addToWishlistRedux(itemDetails as any));
            } else {
              dispatch(removeFromWishlistRedux(itemDetails._id));
            }
          }
        } catch (error) {
          console.error('Error toggling wishlist:', error);
          // Fallback to Redux on error
          dispatch(toggleWishlist(itemDetails));
        }
      },
      {
        redirectTo: 'login',
        preserveState: true,
        actionType: 'add_to_wishlist',
        actionData: { productId: itemDetails._id },
        navigation,
      }
    );
    
    // Don't update Redux for guest mode - pending action will handle it after login
    // This prevents inconsistent state where item is in Redux but not in backend
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

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
      style={[styles.container, width ? {width} : {}]}
      activeOpacity={0.6}
      onPress={NavigateToProductsDetails}>
      <View style={styles.imageContainer}>
        <FastImage source={{uri: image}} style={styles.image} />
        <TouchableOpacity
          style={styles.heartButton}
        
          onPress={handleFavoritePress}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <SvgXml
            xml={forceFavoriteActive || isInWishlist ? favoriteActiveIcon : favoriteIcon}
            width={r(24)}
            height={r(24)}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          {displayTitle}
        </Text>
        <Text style={styles.description}>
          {displayDescription}
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
    marginBottom: Spacing[1],
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
