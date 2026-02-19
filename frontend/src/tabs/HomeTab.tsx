import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ImageSourcePropType,
  StyleSheet,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Carousel from 'react-native-reanimated-carousel';
import {icons, images} from '../constants';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {ProductItem, DealBanner, SummerSaleBanner, SponsoredSection} from '../components';
import {CategoriesData, DetailedProductData} from '../constants/data';
import {ProductTypes} from '../constants/types';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {homeMenu} from '../assets/svgs/homeMenu';
import {filterIcon} from '../assets/svgs/filter';
import {sortIcon} from '../assets/svgs/sortIcon';
import {getAllProducts} from '../services/productService';
import {getProductImage} from '../utils/productHelpers';
import {getAllBanners, trackBannerClick, Banner} from '../services/bannerService';
import {getAllDeals, Deal, getTimeRemaining} from '../services/dealService';
import {getPinnedProducts, PinnedProduct} from '../services/pinnedProductService';

type Props = {};

const HomeTab = (_props: Props) => {
  const navigation = useNavigation<
    StackNavigationProp<RootStackParamList> & DrawerNavigationProp<any>
  >();
  const insets = useSafeAreaInsets();
  const width = Dimensions.get('window').width;
  // Calculate carousel dimensions for dummy images
  const carouselWidth = width - Spacing[5] * 2;
  const carouselHeight = r(200);
  
  // Fallback banner images if API fails
  const fallbackBannerImages = [
    {uri: `https://images.unsplash.com/photo-1607082349566-187342175e2f?w=${Math.round(carouselWidth)}&h=${Math.round(carouselHeight)}&fit=crop`}, // Shopping
    {uri: `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=${Math.round(carouselWidth)}&h=${Math.round(carouselHeight)}&fit=crop`}, // E-commerce
    {uri: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=${Math.round(carouselWidth)}&h=${Math.round(carouselHeight)}&fit=crop`}, // Store shopping
  ];
  
  // State for banners, deals, and pinned products
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerImages, setBannerImages] = useState<Array<{uri: string; id?: string}>>(fallbackBannerImages);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pinnedProducts, setPinnedProducts] = useState<PinnedProduct[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);
  type RootStackParamList = {
    Setting: undefined;
  };
  
  // State for products from API
  const [products, setProducts] = useState<ProductTypes[]>(DetailedProductData);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Load banners from API
  useEffect(() => {
    const loadBanners = async () => {
      setIsLoadingBanners(true);
      try {
        const bannersData = await getAllBanners();
        if (bannersData && bannersData.length > 0) {
          setBanners(bannersData);
          // Map banners to image format for carousel
          const bannerImagesData = bannersData
            .filter(banner => banner.image) // Only banners with images
            .map(banner => ({
              uri: banner.image,
              id: banner._id,
            }));
          
          if (bannerImagesData.length > 0) {
            setBannerImages(bannerImagesData);
          }
        }
      } catch (error) {
        console.error('Error loading banners:', error);
        // Keep fallback images on error
      } finally {
        setIsLoadingBanners(false);
      }
    };

    loadBanners();
  }, []);

  // Load deals from API
  useEffect(() => {
    const loadDeals = async () => {
      setIsLoadingDeals(true);
      try {
        const dealsData = await getAllDeals();
        if (dealsData && dealsData.length > 0) {
          setDeals(dealsData);
        }
      } catch (error) {
        console.error('Error loading deals:', error);
      } finally {
        setIsLoadingDeals(false);
      }
    };

    loadDeals();
  }, []);

  // Load pinned products from API
  useEffect(() => {
    const loadPinnedProducts = async () => {
      try {
        const pinnedData = await getPinnedProducts();
        if (pinnedData && pinnedData.length > 0) {
          setPinnedProducts(pinnedData);
        }
      } catch (error) {
        console.error('Error loading pinned products:', error);
      }
    };

    loadPinnedProducts();
  }, []);

  // Load products from API on component mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const productsData = await getAllProducts({
          limit: 20, // Load first 20 products
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        
        // Backend returns array directly when products exist
        // Backend returns {message: " No Products Found "} when no products (404)
        // Handle both array response and object with products property
        let productsArray: any[] = [];
        
        if (Array.isArray(productsData)) {
          // Backend returns array directly when products exist
          productsArray = productsData;
        } else if (productsData && productsData.products && Array.isArray(productsData.products)) {
          // Backend returns object with products property
          productsArray = productsData.products;
        } else if (productsData && Array.isArray(productsData.data)) {
          // Backend returns object with data property
          productsArray = productsData.data;
        } else if (productsData && productsData.message) {
          // Backend returns {message: " No Products Found "} when no products
          console.log('Backend message:', productsData.message);
          // Keep dummy data if no products in database
          return; // Exit early, keep dummy data
        }
        
        if (productsArray && productsArray.length > 0) {
          // Map backend products to frontend ProductTypes format
          const mappedProducts = productsArray.map((product: any) => ({
            _id: product._id,
            title: product.title || product.name || 'Untitled Product', // Backend uses 'title'
            description: product.description || '',
            price: product.price || 0,
            priceBeforeDeal: product.priceBeforeDeal || product.originalPrice || product.price || 0,
            priceOff: product.priceOff || (product.priceBeforeDeal && product.price 
              ? `${Math.round(((product.priceBeforeDeal - product.price) / product.priceBeforeDeal) * 100)}%`
              : '0%'),
            stars: product.stars || product.rating || 0,
            numberOfReview: product.numberOfReview || product.reviewsCount || 0,
            image: product.image || product.images || [],
            tags: product.tags || [],
            createdAt: product.createdAt || '',
            updatedAt: product.updatedAt || '',
            __v: product.__v || 0,
            variations: product.variations || [],
            colorOptions: product.colors || [],
            deliveryOptions: [],
          }));
          setProducts(mappedProducts);
          console.log(`Loaded ${mappedProducts.length} products from API`);
        } else {
          console.log('No products found in API response - using dummy data');
          // Keep dummy data if no products returned
        }
      } catch (error: any) {
        console.error('Error loading products:', error);
        console.error('Error status:', error.response?.status);
        console.error('Error details:', error.response?.data || error.message);
        
        // Handle 404 specifically (no products found)
        if (error.response?.status === 404) {
          console.log('No products found (404) - using dummy data');
          // Keep dummy data
        } else {
          // Other errors - keep dummy data as fallback
          console.log('API error - using dummy data as fallback');
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // Handle banner click
  const handleBannerPress = async (banner: Banner | {id?: string}) => {
    if (banner && '_id' in banner && banner._id) {
      try {
        await trackBannerClick(banner._id);
        // Navigate to banner targetUrl if available
        if (banner.targetUrl) {
          try {
            const url = banner.targetUrl;
            
            // Handle different URL formats
            if (url.startsWith('/products/') || url.includes('product')) {
              // Navigate to product details
              const productId = url.split('/products/')[1]?.split('/')[0] || url.split('product=')[1]?.split('&')[0];
              if (productId) {
                // Would need to fetch product details first
                // For now, navigate to product details screen with ID
                navigation.navigate('ProductDetails', {
                  itemDetails: {_id: productId} as any,
                });
              }
            } else if (url.startsWith('/categories/') || url.includes('category')) {
              // Navigate to category
              const categoryTitle = url.split('/categories/')[1]?.split('/')[0] || url.split('category=')[1]?.split('&')[0];
              if (categoryTitle) {
                handleSelectCategory(decodeURIComponent(categoryTitle));
              }
            } else if (url.includes('deal') || url.includes('deals')) {
              // Navigate to deals
              handleDealOfTheDayPress();
            } else if (url.startsWith('http')) {
              // External URL - could open in browser
              // For now, just log it
              console.log('External URL:', url);
            } else {
              // Default: just log
              console.log('Navigate to:', url);
            }
          } catch (error) {
            console.error('Error navigating from banner:', error);
          }
        }
      } catch (error) {
        console.error('Error tracking banner click:', error);
      }
    }
  };

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
  const handleSelectCategory = (categoryTitle: string) => {
    try {
      // Navigate to Category within the Home stack
      navigation.getParent()?.navigate('Home', {
        screen: 'Category',
        params: {categoryTitle},
      });
    } catch {
      // Fallback to direct navigation
      navigation.navigate('Category' as any, {categoryTitle});
    }
  };
  const handleDealOfTheDayPress = () => {
    try {
      // Navigate to DealOfTheDay within the Home stack
      navigation.getParent()?.navigate('Home', {
        screen: 'DealOfTheDay',
      });
    } catch {
      // Fallback to direct navigation
      navigation.navigate('DealOfTheDay' as any);
    }
  };
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}>
      {/* header */}
      <View style={[styles.header, {paddingTop: insets.top}]}>
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
      {/* greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Hello, Jhon!!</Text>
      </View>
      {/* categories section */}
      <View style={styles.categoriesHeaderContainer}>
        <Text style={styles.categoriesTitle}>Categories</Text>
        <View style={styles.categoriesButtons}>
          {FeaturesData.map(item => (
            <TouchableOpacity
              style={styles.categoryButton}
              key={item.id}
              onPress={() => {}}>
              <Text style={styles.categoryButtonText}>{item.title}</Text>
              {item.svg ? (
                <SvgXml xml={item.svg} width={r(16)} height={r(16)} />
              ) : (
                <FastImage
                  source={item.image as any}
                  style={styles.categoryButtonIcon}
                  resizeMode={FastImage.resizeMode.contain}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* categories */}
      <View style={styles.categoriesListContainer}>
        <FlatList
          data={CategoriesData}
          renderItem={({item}) => (
            <View style={styles.categoryItemContainer}>
              <TouchableOpacity
                onPress={() => handleSelectCategory(item.title)}
                style={styles.categoryTouchable}>
                <FastImage
                  source={{uri: item.image}}
                  style={styles.categoryImage}
                />
                <Text
                  style={styles.categoryText}
                  numberOfLines={2}
                  ellipsizeMode="tail">
                  {item.title}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={styles.categorySeparator} />
          )}
          ListFooterComponent={<View style={styles.categorySeparator} />}
        />
      </View>
      {/* promotional banner */}
      <View style={styles.bannerContainer}>
        <Carousel
          loop
          width={width - Spacing[5] * 2} // Account for horizontal padding
          height={r(200)} // Same height as before
          autoPlay={true}
          autoPlayInterval={3000} // 3 seconds
          data={bannerImages}
          scrollAnimationDuration={1000}
          onSnapToItem={index => {
            // Handle loop mode - ensure index is within valid range
            const actualIndex = ((index % bannerImages.length) + bannerImages.length) % bannerImages.length;
            setCurrentBannerIndex(actualIndex);
          }}
          renderItem={({item, index}) => {
            const banner = banners.find(b => b._id === item.id) || null;
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  if (banner) {
                    handleBannerPress(banner);
                  }
                }}>
                <FastImage
                  source={item}
                  resizeMode={FastImage.resizeMode.cover}
                  style={styles.dealImage}
                />
              </TouchableOpacity>
            );
          }}
        />
        {/* Pagination dots */}
        <View style={styles.paginationContainer}>
          {bannerImages.length <= 5 ? (
            // Show all dots if 5 or fewer
            bannerImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentBannerIndex && styles.paginationDotActive,
                ]}
              />
            ))
          ) : (
            // Show limited dots (max 5) with sliding window for 5+ items
            (() => {
              const maxDots = 5;
              const totalItems = bannerImages.length;
              let startIndex = 0;
              let endIndex = maxDots;

              // Calculate which dots to show based on current position
              if (currentBannerIndex <= 2) {
                // Show first 5 dots
                startIndex = 0;
                endIndex = maxDots;
              } else if (currentBannerIndex >= totalItems - 3) {
                // Show last 5 dots
                startIndex = totalItems - maxDots;
                endIndex = totalItems;
              } else {
                // Show dots around current index
                startIndex = currentBannerIndex - 2;
                endIndex = currentBannerIndex + 3;
              }

              return Array.from({length: endIndex - startIndex}, (_, i) => {
                const index = startIndex + i;
                return (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentBannerIndex && styles.paginationDotActive,
                    ]}
                  />
                );
              });
            })()
          )}
        </View>
      </View>
      {/* deal of the day */}
      {deals.length > 0 && deals[0] ? (
        <DealBanner
          title={deals[0].title || "Deal of the Day"}
          timeRemaining={getTimeRemaining(deals[0].endDate)}
          buttonText="View all"
          onButtonPress={handleDealOfTheDayPress}
        />
      ) : (
        <DealBanner
          title="Deal of the Day"
          timeRemaining="22h 55m 20s remaining"
          buttonText="View all"
          onButtonPress={handleDealOfTheDayPress}
        />
      )}
      {/* Products */}
      <View style={styles.productsContainer}>
        <FlatList
          data={products}
          renderItem={({item}) => (
            <ProductItem
              image={getProductImage(item)}
              title={item.title}
              description={item.description}
              price={item.price}
              priceBeforeDeal={item.priceBeforeDeal}
              priceOff={item.priceOff}
              stars={item.stars}
              numberOfReview={item.numberOfReview}
              itemDetails={item}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
      {/* Under Price Deal */}
      {deals.find(deal => deal.type === 'under_price') ? (
        (() => {
          const underPriceDeal = deals.find(deal => deal.type === 'under_price')!;
          return (
            <DealBanner
              title={underPriceDeal.title || "Under SAR 20"}
              lastDate={new Date(underPriceDeal.endDate).toLocaleDateString('en-GB')}
              buttonText="View all"
              onButtonPress={() => {}}
            />
          );
        })()
      ) : (
        <DealBanner
          title="Under SAR 20"
          lastDate="29/02/22"
          buttonText="View all"
          onButtonPress={() => {}}
        />
      )}
      {/* Products */}
      <View style={styles.productsContainer}>
        <FlatList
          data={products}
          renderItem={({item}) => (
            <ProductItem
              image={getProductImage(item)}
              title={item.title}
              description={item.description}
              price={item.price}
              priceBeforeDeal={item.priceBeforeDeal}
              priceOff={item.priceOff}
              stars={item.stars}
              numberOfReview={item.numberOfReview}
              itemDetails={item}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
      {/* Hot Summer Sale Banner */}
      <SummerSaleBanner onViewAllPress={() => {}} />
      {/* Sponsored Section */}
      <SponsoredSection onPress={() => {}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing[3],
    // paddingTop will be set dynamically with safe area insets
  },
  headerIcon: {
    width: r(40),
    height: r(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: r(130),
    height: r(46),
  },
  greetingContainer: {
    marginTop: Spacing[2],
    marginBottom: Spacing[5],
  },
  greetingText: {
    fontSize: FontSizes['2xl'], // 24px as per Figma design
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  categoriesHeaderContainer: {
    flexDirection: 'row',
    marginTop: Spacing[1],
    marginBottom: Spacing[4],
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesTitle: {
    fontSize: FontSizes['xl'],
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  categoriesButtons: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  categoryButton: {
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
  categoryButtonText: {
    color: Colors.black[100],
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
  },
  categoryButtonIcon: {
    width: r(16),
    height: r(16),
  },
  categoriesListContainer: {
    marginBottom: Spacing[5],
  },
  categoryItemContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: r(62), // Fixed width to prevent layout shifts
  },
  categoryTouchable: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: r(62), // Fixed width matching image
  },
  categoryImage: {
    width: r(62),
    height: r(62),
    borderRadius: r(31), // Half of width/height for perfect circle
    alignSelf: 'center',
  },
  categoryText: {
    color: 'rgba(0, 0, 0, 0.8)',
    textAlign: 'center',
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.pmedium,
    marginTop: Spacing[2],
    width: r(62), // Fixed width matching image
  },
  categorySeparator: {
    width: Spacing[2], // Reduced spacing between category items
  },
  separator: {
    width: Spacing[2], // Spacing between product cards
  },
  scrollView: {
    backgroundColor: '#FDFDFD',
  },
  scrollViewContent: {
    paddingHorizontal: Spacing[5], // Consistent horizontal padding
    paddingBottom: Spacing[8], // Space at the bottom
  },
  bannerContainer: {
    marginTop: Spacing[1],
    marginBottom: Spacing[5],
  },
  dealImage: {
    width: '100%',
    height: '100%',
    borderRadius: r(12),
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: r(6),
    marginTop: Spacing[6],
  },
  paginationDot: {
    width: r(10),
    height: r(10),
    borderRadius: r(5),
    backgroundColor: Colors.gray[300] || '#D3D3D3',
  },
  paginationDotActive: {
    backgroundColor: Colors.gray[500] || '#808080',
    width: r(10),
    height: r(10),
    borderRadius: r(5),
  },
  productsContainer: {
    marginTop: Spacing[1],
    marginBottom: Spacing[5],
  },
});

export default HomeTab;

type FeaturesDataProps = {
  id: number;
  title: string;
  image?: ImageSourcePropType;
  svg?: string;
};

export const FeaturesData: FeaturesDataProps[] = [
  {
    id: 1,
    title: 'Sort',
    svg: sortIcon,
  },
  {
    id: 2,
    title: 'Filter',
    svg: filterIcon,
  },
];
