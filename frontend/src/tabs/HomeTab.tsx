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
import React, {useState} from 'react';
import FastImage from 'react-native-fast-image';
import Carousel from 'react-native-reanimated-carousel';
import {icons, images} from '../constants';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {ProductItem, DealBanner, SummerSaleBanner, SponsoredSection} from '../components';
import {CategoriesData, DetailedProductData} from '../constants/data';
import {removeItem} from '../utils/AsyncStorage';
import {ProductTypes} from '../constants/types';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {homeMenu} from '../assets/svgs/homeMenu';
import {filterIcon} from '../assets/svgs/filter';
import {sortIcon} from '../assets/svgs/sortIcon';

type Props = {};

const HomeTab = (_props: Props) => {
  const navigation = useNavigation<
    StackNavigationProp<RootStackParamList> & DrawerNavigationProp<any>
  >();
  const width = Dimensions.get('window').width;
  // Calculate carousel dimensions for dummy images
  const carouselWidth = width - Spacing[5] * 2;
  const carouselHeight = r(200);
  // Use e-commerce dummy images with proper aspect ratio
  const bannerImages = [
    {uri: `https://images.unsplash.com/photo-1607082349566-187342175e2f?w=${Math.round(carouselWidth)}&h=${Math.round(carouselHeight)}&fit=crop`}, // Shopping
    {uri: `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=${Math.round(carouselWidth)}&h=${Math.round(carouselHeight)}&fit=crop`}, // E-commerce
    {uri: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=${Math.round(carouselWidth)}&h=${Math.round(carouselHeight)}&fit=crop`}, // Store shopping
    {uri: `https://images.unsplash.com/photo-1556740758-90de374c12ad?w=${Math.round(carouselWidth)}&h=${Math.round(carouselHeight)}&fit=crop`}, // Retail
    {uri: `https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=${Math.round(carouselWidth)}&h=${Math.round(carouselHeight)}&fit=crop`}, // Fashion store
  ];
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  type RootStackParamList = {
    Setting: undefined;
  };
  // Use detailed product data matching UI designs
  const [products] = useState<ProductTypes[]>(DetailedProductData);

  const NavigateToProfile = async () => {
    navigation.navigate('Setting');
    await removeItem('onboarded'); // will reset to onboarding
  };
  const handleOpenDrawer = () => {
    navigation.openDrawer();
  };
  const handleSelectCategory = () => {};
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}>
      {/* header */}
      <View style={styles.header}>
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
                onPress={handleSelectCategory}
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
          renderItem={({item}) => (
            <FastImage
              source={item}
              resizeMode={FastImage.resizeMode.cover}
              style={styles.dealImage}
            />
          )}
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
      <DealBanner
        title="Deal of the Day"
        timeRemaining="22h 55m 20s remaining"
        buttonText="View all"
        onButtonPress={() => {}}
      />
      {/* Products */}
      <View style={styles.productsContainer}>
        <FlatList
          data={products}
          renderItem={({item}) => (
            <ProductItem
              image={item.image[0]}
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
      <DealBanner
        title="Under SAR 20"
        lastDate="29/02/22"
        buttonText="View all"
        onButtonPress={() => {}}
      />
      {/* Products */}
      <View style={styles.productsContainer}>
        <FlatList
          data={products}
          renderItem={({item}) => (
            <ProductItem
              image={item.image[0]}
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
    // No margin needed since ScrollView has paddingHorizontal
  },
  headerIcon: {
    width: r(32),
    height: r(32),
  },
  logo: {
    width: r(96),
    height: r(96),
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
