import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ImageSourcePropType,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect, useMemo} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Carousel from 'react-native-reanimated-carousel';
import {icons, images} from '../constants';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {ProductItem, DealBanner, SummerSaleBanner, SponsoredSection, UnderPriceFilter, DealCard, DealCountdown, CelebrationCard, AppAdSlider} from '../components';
import {CategoriesData, DetailedProductData} from '../constants/data';
import {ProductTypes} from '../constants/types';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {homeMenu} from '../assets/svgs/homeMenu';
import {filterIcon} from '../assets/svgs/filter';
import {sortIcon} from '../assets/svgs/sortIcon';
import {getAllProducts} from '../services/productService';
import {getProductImage} from '../utils/productHelpers';
import {getLocalizedProducts} from '../utils/productTranslations';
import {getAllBanners, trackBannerClick, Banner} from '../services/bannerService';
import {getAllDeals, getDealsByType, Deal, getTimeRemaining, formatDealDiscount, getDealTypeLabel} from '../services/dealService';
import {getPinnedProducts, PinnedProduct} from '../services/pinnedProductService';
import {getCelebrationCampaigns, type CelebrationCampaign} from '../services/celebrationService';
import {getAppAds, type AppAd} from '../services/appAdService';
import {useI18n} from '../contexts/I18nContext';

type Props = {};

const HomeTab = (_props: Props) => {
  const navigation = useNavigation<
    StackNavigationProp<RootStackParamList> & DrawerNavigationProp<any>
  >();
  const insets = useSafeAreaInsets();
  const { t, language } = useI18n();
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
  const [selectedDealType, setSelectedDealType] = useState<string | null>(null);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  type RootStackParamList = {
    Setting: undefined;
  };
  
  // State for products from API
  const [products, setProducts] = useState<ProductTypes[]>(DetailedProductData);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);
  const [selectedUnderPrice, setSelectedUnderPrice] = useState<number | null>(null);
  const [underPriceProducts, setUnderPriceProducts] = useState<ProductTypes[]>([]);
  const [isLoadingUnderPrice, setIsLoadingUnderPrice] = useState(false);
  const [celebrationCampaigns, setCelebrationCampaigns] = useState<CelebrationCampaign[]>([]);
  const [isLoadingCelebrations, setIsLoadingCelebrations] = useState(false);
  const [appAds, setAppAds] = useState<AppAd[]>([]);
  const [isLoadingAppAds, setIsLoadingAppAds] = useState(false);

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
          // Set filtered deals initially to all deals
          setFilteredDeals(dealsData);
        }
      } catch (error) {
        console.error('Error loading deals:', error);
      } finally {
        setIsLoadingDeals(false);
      }
    };

    loadDeals();
  }, []);

  // Filter deals by type
  useEffect(() => {
    if (selectedDealType) {
      const filtered = deals.filter(deal => deal.type === selectedDealType);
      setFilteredDeals(filtered);
    } else {
      setFilteredDeals(deals);
    }
  }, [selectedDealType, deals]);

  // Handle deal type filter
  const handleDealTypeFilter = (type: string | null) => {
    setSelectedDealType(type);
  };

  // Navigate to deal details
  const handleDealPress = (deal: Deal) => {
    navigation.navigate('DealDetails', {dealId: deal._id});
  };

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

  // Load celebration campaigns from API
  useEffect(() => {
    const loadCelebrationCampaigns = async () => {
      setIsLoadingCelebrations(true);
      try {
        const campaigns = await getCelebrationCampaigns();
        if (campaigns && campaigns.length > 0) {
          setCelebrationCampaigns(campaigns);
        }
      } catch (error) {
        console.error('Error loading celebration campaigns:', error);
      } finally {
        setIsLoadingCelebrations(false);
      }
    };

    loadCelebrationCampaigns();
  }, []);

  // Load app ads from API
  useEffect(() => {
    const loadAppAds = async () => {
      setIsLoadingAppAds(true);
      try {
        const ads = await getAppAds('homepage');
        if (ads && ads.length > 0) {
          setAppAds(ads);
        }
      } catch (error) {
        console.error('Error loading app ads:', error);
      } finally {
        setIsLoadingAppAds(false);
      }
    };

    loadAppAds();
  }, []);

  // Load products under specific price
  const loadUnderPriceProducts = async (maxPrice: number) => {
    setIsLoadingUnderPrice(true);
    try {
      const filteredProducts = await getAllProducts({
        maxPrice,
        limit: 20,
        sortBy: 'price',
        sortOrder: 'asc',
      });
      
      // Map backend products to frontend format (preserve translations)
      const mappedProducts = (Array.isArray(filteredProducts) ? filteredProducts : []).map((product: any) => ({
        _id: product._id,
        title: product.title || product.name || 'Untitled Product',
        description: product.description || '',
        titleTranslations: product.titleTranslations,
        descriptionTranslations: product.descriptionTranslations,
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
      
      setUnderPriceProducts(mappedProducts);
    } catch (error: any) {
      console.error('Error loading under-price products:', error);
      // Filter local products as fallback
      const filtered = products.filter(p => p.price <= maxPrice);
      setUnderPriceProducts(filtered.slice(0, 20));
    } finally {
      setIsLoadingUnderPrice(false);
    }
  };

  // Handle under-price filter selection
  const handleUnderPriceSelect = (value: number | null) => {
    setSelectedUnderPrice(value);
    if (value) {
      loadUnderPriceProducts(value);
    } else {
      setUnderPriceProducts([]);
    }
  };

  // Load products from API
  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshingProducts(true);
    } else {
      setIsLoadingProducts(true);
    }
    
    try {
      // Backend doesn't support query parameters, so just call /products
      const productsData = await getAllProducts();
      
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
        // Map backend products to frontend ProductTypes format (preserve translations)
        const mappedProducts = productsArray.map((product: any) => ({
          _id: product._id,
          title: product.title || product.name || 'Untitled Product',
          description: product.description || '',
          titleTranslations: product.titleTranslations,
          descriptionTranslations: product.descriptionTranslations,
          price: product.price || 0,
          priceBeforeDeal: product.priceBeforeDeal || product.originalPrice || product.price || 0,
          priceOff: product.priceOff || (product.priceBeforeDeal && product.price 
            ? `${Math.round(((product.priceBeforeDeal - product.price) / product.priceBeforeDeal) * 100)}%`
            : '0%'),
          stars: product.stars || product.rating || 0,
          numberOfReview: product.numberOfReview || product.reviewsCount || 0,
          image: product.image || product.images || [],
          tags: product.tags || [],
          status: product.status,
          category: product.category,
          vendor: product.vendor,
          createdAt: product.createdAt || '',
          updatedAt: product.updatedAt || '',
          __v: product.__v || 0,
          variations: product.variations || [],
          colorOptions: product.colors || [],
          deliveryOptions: [],
        }));
        setProducts(mappedProducts);
        console.log(`✅ Loaded ${mappedProducts.length} products from API`);
      } else {
        console.log('No products found in API response - using dummy data');
        // Keep dummy data if no products returned
      }
    } catch (error: any) {
      console.error('❌ Error loading products:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error details:', error.response?.data || error.message);
      console.error('API URL:', error.config?.url || 'Unknown');
      
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
      setIsRefreshingProducts(false);
    }
  };

  // Localize products based on current language
  const localizedProducts = useMemo(
    () => getLocalizedProducts(products, language),
    [products, language],
  );
  const localizedUnderPriceProducts = useMemo(
    () => getLocalizedProducts(underPriceProducts, language),
    [underPriceProducts, language],
  );

  // Load products on mount and when language changes (backend returns localized content via Accept-Language header)
  useEffect(() => {
    loadProducts();
    if (selectedUnderPrice) {
      loadUnderPriceProducts(selectedUnderPrice);
    }
  }, [language, selectedUnderPrice]);

  // Reload products when screen is focused (to get new products added via admin panel)
  useFocusEffect(
    React.useCallback(() => {
      // Reload products when screen comes into focus
      loadProducts();
    }, [])
  );

  // Handle pull to refresh
  const handleRefresh = () => {
    loadProducts(true);
  };

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
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshingProducts}
          onRefresh={handleRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }>
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
      {/* Deal Type Filters */}
      {deals.length > 0 && (
        <View style={styles.dealFiltersContainer}>
          <Text style={styles.dealFiltersTitle}>{t('home.deals')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dealFiltersContent}>
            <TouchableOpacity
              style={[
                styles.dealFilterButton,
                !selectedDealType && styles.dealFilterButtonActive,
              ]}
              onPress={() => handleDealTypeFilter(null)}>
              <Text
                style={[
                  styles.dealFilterText,
                  !selectedDealType && styles.dealFilterTextActive,
                ]}>
                All Deals
              </Text>
            </TouchableOpacity>
            {['daily', 'weekly', 'monthly', 'flash'].map(type => {
              const dealTypeExists = deals.some(d => d.type === type);
              if (!dealTypeExists) return null;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.dealFilterButton,
                    selectedDealType === type && styles.dealFilterButtonActive,
                  ]}
                  onPress={() => handleDealTypeFilter(type)}>
                  <Text
                    style={[
                      styles.dealFilterText,
                      selectedDealType === type && styles.dealFilterTextActive,
                    ]}>
                    {getDealTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* deal of the day */}
      {deals.length > 0 && deals[0] ? (
        <DealBanner
          title={deals[0].title || "Deal of the Day"}
          endDate={deals[0].endDate}
          useCountdown={true}
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

      {/* Deals List */}
      {filteredDeals.length > 0 && (
        <View style={styles.dealsListContainer}>
          <Text style={styles.sectionTitle}>
            {selectedDealType ? getDealTypeLabel(selectedDealType) : 'All Deals'}
          </Text>
          <FlatList
            data={filteredDeals.slice(0, 5)} // Show first 5 deals
            renderItem={({item}) => (
              <DealCard
                deal={item}
                onPress={() => handleDealPress(item)}
                showCountdown={true}
              />
            )}
            keyExtractor={item => item._id}
            scrollEnabled={false}
          />
          {filteredDeals.length > 5 && (
            <TouchableOpacity
              style={styles.viewAllDealsButton}
              onPress={() => navigation.navigate('DealDetails', {dealType: selectedDealType})}>
              <Text style={styles.viewAllDealsText}>
                View All {selectedDealType ? getDealTypeLabel(selectedDealType) : 'Deals'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* App Ads Slider */}
      {appAds.length > 0 && (
        <AppAdSlider
          ads={appAds}
          position="homepage"
          height={r(150)}
          autoPlay={true}
          autoPlayInterval={4000}
          showPagination={true}
        />
      )}

      {/* Celebration Campaigns */}
      {celebrationCampaigns.length > 0 && (
        <View style={styles.celebrationSection}>
          <View style={styles.celebrationHeader}>
            <Text style={styles.sectionTitle}>🎉 {t('celebrations.celebrationDeals')}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CelebrationRegistration')}>
              <Text style={styles.registerCelebrationLink}>
                {t('celebrations.registerCelebration')}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={celebrationCampaigns.slice(0, 3)} // Show first 3 campaigns
            renderItem={({item}) => (
              <CelebrationCard
                campaign={item}
                onPress={() => {
                  navigation.navigate('DealDetails', {dealType: item.type});
                }}
              />
            )}
            keyExtractor={item => item._id}
            scrollEnabled={false}
          />
          {celebrationCampaigns.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('CelebrationRegistration')}>
              <Text style={styles.viewAllButtonText}>
                View All Celebration Deals
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Products */}
      <View style={styles.productsContainer}>
        <FlatList
          data={localizedProducts}
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
      {/* Under Price Filter */}
      <View style={styles.underPriceSection}>
        <UnderPriceFilter
          selectedValue={selectedUnderPrice}
          onSelect={handleUnderPriceSelect}
          currency="SAR"
        />
        {selectedUnderPrice && localizedUnderPriceProducts.length > 0 && (
          <View style={styles.productsContainer}>
            <Text style={styles.sectionTitle}>
              Products Under SAR {selectedUnderPrice}
            </Text>
            <FlatList
              data={localizedUnderPriceProducts}
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
        )}
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
              onButtonPress={() => {
                // Navigate to category with price filter
                handleSelectCategory('Under Price');
              }}
            />
          );
        })()
      ) : (
        <DealBanner
          title="Under SAR 20"
          lastDate="29/02/22"
          buttonText="View all"
          onButtonPress={() => {
            // Navigate to category with price filter
            handleSelectCategory('Under Price');
          }}
        />
      )}
      {/* Products */}
      <View style={styles.productsContainer}>
        <FlatList
          data={localizedProducts}
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
  underPriceSection: {
    marginBottom: Spacing[5],
    paddingHorizontal: Spacing[5],
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[4],
    marginTop: Spacing[4],
  },
  productsContainer: {
    marginTop: Spacing[1],
    marginBottom: Spacing[5],
  },
  dealFiltersContainer: {
    marginBottom: Spacing[5],
    paddingHorizontal: Spacing[5],
  },
  dealFiltersTitle: {
    fontSize: FontSizes.lg,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[4],
  },
  dealFiltersContent: {
    gap: Spacing[3],
  },
  dealFilterButton: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: r(20),
    backgroundColor: Colors.white,
    borderWidth: r(1.5),
    borderColor: Colors.gray[300],
    marginRight: Spacing[2],
  },
  dealFilterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dealFilterText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    fontFamily: FontFamilies.msemibold,
  },
  dealFilterTextActive: {
    color: Colors.white,
  },
  dealsListContainer: {
    marginBottom: Spacing[5],
    paddingHorizontal: Spacing[5],
  },
  viewAllDealsButton: {
    marginTop: Spacing[4],
    paddingVertical: Spacing[3],
    alignItems: 'center',
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200],
    paddingTop: Spacing[4],
  },
  viewAllDealsText: {
    fontSize: FontSizes.base,
    color: Colors.primary,
    fontFamily: FontFamilies.mbold,
  },
  celebrationSection: {
    marginBottom: Spacing[5],
    paddingHorizontal: Spacing[5],
  },
  celebrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  registerCelebrationLink: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontFamily: FontFamilies.msemibold,
    textDecorationLine: 'underline',
  },
  viewAllButton: {
    marginTop: Spacing[4],
    paddingVertical: Spacing[3],
    alignItems: 'center',
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200],
    paddingTop: Spacing[4],
  },
  viewAllButtonText: {
    fontSize: FontSizes.base,
    color: Colors.primary,
    fontFamily: FontFamilies.mbold,
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
