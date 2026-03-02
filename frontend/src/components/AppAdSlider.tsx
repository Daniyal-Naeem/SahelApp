import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import FastImage from 'react-native-fast-image';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  type AppAd,
  trackAppAdClick,
  trackAppAdView,
} from '../services/appAdService';
import {useNavigation} from '@react-navigation/native';

interface AppAdSliderProps {
  ads: AppAd[];
  position?: 'homepage' | 'product_detail' | 'cart' | 'checkout' | 'category' | 'search';
  height?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showPagination?: boolean;
}

const AppAdSlider: React.FC<AppAdSliderProps> = ({
  ads,
  position = 'homepage',
  height = r(150),
  autoPlay = true,
  autoPlayInterval = 3000,
  showPagination = true,
}) => {
  const navigation = useNavigation<any>();
  const width = Dimensions.get('window').width;
  const carouselWidth = width - Spacing[5] * 2;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const viewedAdsRef = useRef<Set<string>>(new Set());

  // Track view when ad becomes visible
  useEffect(() => {
    if (ads.length > 0 && currentIndex < ads.length) {
      const currentAd = ads[currentIndex];
      if (currentAd && !viewedAdsRef.current.has(currentAd._id)) {
        trackAppAdView(currentAd._id);
        viewedAdsRef.current.add(currentAd._id);
      }
    }
  }, [currentIndex, ads]);

  // Filter ads by position
  const filteredAds = ads.filter(ad => ad.position === position);

  if (!filteredAds || filteredAds.length === 0) {
    return null;
  }

  const handleAdPress = async (ad: AppAd) => {
    // Track click
    await trackAppAdClick(ad._id);

    // Handle navigation based on targetUrl
    if (ad.targetUrl) {
      try {
        // Handle different URL formats
        if (ad.targetUrl.startsWith('/products/') || ad.targetUrl.includes('product')) {
          // Navigate to product details
          const productId = ad.targetUrl.split('/products/')[1]?.split('/')[0] || 
                           ad.targetUrl.split('product=')[1]?.split('&')[0];
          if (productId) {
            navigation.navigate('ProductDetails', {
              itemDetails: {_id: productId} as any,
            });
          }
        } else if (ad.targetUrl.startsWith('/categories/') || ad.targetUrl.includes('category')) {
          // Navigate to category
          const categoryTitle = ad.targetUrl.split('/categories/')[1]?.split('/')[0] || 
                               ad.targetUrl.split('category=')[1]?.split('&')[0];
          if (categoryTitle) {
            // Navigate to category tab
            navigation.navigate('HomeScreen', {
              screen: 'Dashboard',
              params: {
                screen: 'Category',
                params: {category: decodeURIComponent(categoryTitle)},
              },
            });
          }
        } else if (ad.targetUrl.includes('deal') || ad.targetUrl.includes('deals')) {
          // Navigate to deals
          navigation.navigate('DealDetails');
        } else if (ad.targetUrl.startsWith('http')) {
          // External URL - could open in browser
          console.log('External URL:', ad.targetUrl);
          // For now, just log it
        }
      } catch (error) {
        console.error('Error handling ad navigation:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Carousel
        width={carouselWidth}
        height={height}
        data={filteredAds}
        renderItem={({item, index}) => (
          <TouchableOpacity
            key={item._id}
            style={styles.adContainer}
            onPress={() => handleAdPress(item)}
            activeOpacity={0.9}>
            <FastImage
              source={{uri: item.image}}
              style={[styles.adImage, {height}]}
              resizeMode={FastImage.resizeMode.cover}
            />
            {(item.title || item.description) && (
              <View style={styles.adOverlay}>
                {item.title && (
                  <Text style={styles.adTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                )}
                {item.description && (
                  <Text style={styles.adDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        )}
        autoPlay={autoPlay && filteredAds.length > 1}
        autoPlayInterval={autoPlayInterval}
        onSnapToItem={index => setCurrentIndex(index)}
        scrollAnimationDuration={500}
        pagingEnabled
        loop={filteredAds.length > 1}
      />
      {showPagination && filteredAds.length > 1 && (
        <View style={styles.paginationContainer}>
          {filteredAds.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing[4],
    paddingHorizontal: Spacing[5],
  },
  adContainer: {
    borderRadius: r(12),
    overflow: 'hidden',
    backgroundColor: Colors.white,
    shadowColor: Colors.black[100],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adImage: {
    width: '100%',
    borderRadius: r(12),
  },
  adOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomLeftRadius: r(12),
    borderBottomRightRadius: r(12),
  },
  adTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.white,
    marginBottom: Spacing[1],
  },
  adDescription: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.white,
    opacity: 0.9,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: r(6),
    marginTop: Spacing[3],
  },
  paginationDot: {
    width: r(8),
    height: r(8),
    borderRadius: r(4),
    backgroundColor: Colors.gray[300],
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    width: r(10),
    height: r(10),
    borderRadius: r(5),
  },
});

export default AppAdSlider;
