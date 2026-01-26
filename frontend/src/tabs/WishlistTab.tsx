import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {ProductItem, CustomSearch} from '../components';
import {ProductTypes} from '../constants/types';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {homeMenu} from '../assets/svgs/homeMenu';
import {filterIcon} from '../assets/svgs/filter';
import {sortIcon} from '../assets/svgs/sortIcon';
import {images, icons} from '../constants';
import {useAppSelector} from '../store';
import {checkAuthStatus} from '../utils/authGuard';
import {getWishlist} from '../services/wishlistService';

type Props = {};

const RowSeparator = () => <View style={styles.rowSeparator} />;

const WishlistTab = (_props: Props) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const width = Dimensions.get('window').width;
  const [isLoading, setIsLoading] = useState(false);
  const [displayProducts, setDisplayProducts] = useState<ProductTypes[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Load wishlist from API when authenticated
  const loadWishlist = async () => {
    setIsLoading(true);
    try {
      const wishlistData = await getWishlist();
      if (wishlistData && wishlistData.items) {
        // Map backend wishlist items to frontend ProductTypes format
        const products = wishlistData.items.map((item: any) => {
          const product = item.product || item;
          return {
            ...product,
            _id: product._id || product.id,
            // Ensure image is an array
            image: Array.isArray(product.image) 
              ? product.image 
              : product.images 
                ? (Array.isArray(product.images) ? product.images : [product.images])
                : product.image 
                  ? [product.image] 
                  : [],
            // Map backend fields to frontend format
            title: product.name || product.title,
            description: product.description || '',
            price: product.price || 0,
            priceBeforeDeal: product.originalPrice || product.priceBeforeDeal || product.price || 0,
            priceOff: product.originalPrice && product.price
              ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`
              : '0%',
            stars: product.rating || product.stars || 0,
            numberOfReview: product.reviewsCount || product.numberOfReview || 0,
          };
        });
        setDisplayProducts(products);
      } else {
        setDisplayProducts([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setDisplayProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication and load wishlist when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const checkAuthAndLoad = async () => {
        const authStatus = await checkAuthStatus();
        setIsAuthenticated(authStatus);
        
        if (authStatus) {
          // User is authenticated, load wishlist from API
          await loadWishlist();
        } else {
          // User is not authenticated, show empty state (don't redirect)
          setDisplayProducts([]);
          setIsLoading(false);
        }
      };
      
      checkAuthAndLoad();
    }, []) // loadWishlist is now defined before useFocusEffect, so no dependency needed
  );

  const NavigateToProfile = () => {
    // Navigate to Profile tab
    (navigation as any).navigate('HomeScreen', {
      screen: 'Dashboard',
      params: {
        screen: 'Profile',
      },
    });
  };

  const handleOpenDrawer = () => {
    navigation.openDrawer();
  };

  const handleSort = () => {
  };

  const handleFilter = () => {
  };

  // Calculate item width for 2-column grid
  const itemWidth = (width - Spacing[5] * 2 - Spacing[2]) / 2;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}>
      {/* Header */}
      <View style={[styles.header, {marginTop: insets.top}]}>
        <TouchableOpacity onPress={handleOpenDrawer}>
          <SvgXml xml={homeMenu} />
        </TouchableOpacity>

        <FastImage
          source={images.homeLogo}
          style={styles.logo}
          resizeMode={FastImage.resizeMode.contain}
        />
        <TouchableOpacity onPress={NavigateToProfile}>
          <FastImage
            source={icons.profile}
            style={styles.headerIcon}
            resizeMode={FastImage.resizeMode.contain}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomSearch placeholder="Search any Product.." initialQuery="" />
      </View>

      {/* WishList Title and Buttons */}
      <View style={styles.wishlistHeader}>
        <Text style={styles.wishlistTitle}>WishList</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSort}>
            <Text style={styles.actionButtonText}>Sort</Text>
            <SvgXml xml={sortIcon} width={r(16)} height={r(16)} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFilter}>
            <Text style={styles.actionButtonText}>Filter</Text>
            <SvgXml xml={filterIcon} width={r(16)} height={r(16)} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Products Grid or Empty State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : displayProducts.length > 0 ? (
        <FlatList
          data={displayProducts}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={({item}) => (
            <ProductItem
              image={getProductImage(item)}
              title={item.title || item.name || 'Product'}
              description={item.description || ''}
              price={item.price || 0}
              priceBeforeDeal={item.priceBeforeDeal || item.price || 0}
              priceOff={item.priceOff || '0%'}
              stars={item.stars || item.rating || 0}
              numberOfReview={item.numberOfReview || item.reviewsCount || 0}
              itemDetails={item}
              currency={(item as any).currency || 'SAR'}
              width={itemWidth}
              forceFavoriteActive={true}
            />
          )}
          columnWrapperStyle={styles.row}
          ItemSeparatorComponent={RowSeparator}
          contentContainerStyle={styles.productsGrid}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {isAuthenticated ? 'Your wishlist is empty' : 'Login to view your wishlist'}
          </Text>
          <Text style={styles.emptySubtext}>
            {isAuthenticated 
              ? 'Add items to your wishlist by tapping the heart icon on products'
              : 'Sign in to save your favorite products and access them anytime'}
          </Text>
          {!isAuthenticated && (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#FDFDFD',
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing[2],
  },
  headerIcon: {
    width: r(32),
    height: r(32),
  },
  logo: {
    width: r(96),
    height: r(96),
  },
  searchContainer: {
    marginBottom: Spacing[4],
  },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  wishlistTitle: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  actionButton: {
    backgroundColor: Colors.white,
    borderRadius: r(8),
    borderWidth: r(1),
    borderColor: Colors.gray[200] || '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    gap: Spacing[1],
  },
  actionButtonText: {
    color: Colors.black[100],
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
  },
  productsGrid: {
    paddingBottom: Spacing[4],
  },
  row: {
    justifyContent: 'space-between',
  },
  rowSeparator: {
    width: Spacing[2],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[10],
  },
  emptyText: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[2],
  },
  emptySubtext: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
    textAlign: 'center',
    paddingHorizontal: Spacing[5],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[10],
  },
  loginButton: {
    marginTop: Spacing[4],
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: r(8),
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
  },
});

export default WishlistTab;
