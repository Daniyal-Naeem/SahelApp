import {RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState, useEffect} from 'react';
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Carousel from 'react-native-reanimated-carousel';
import {SvgXml} from 'react-native-svg';
import {RouteStackParamList} from '../../App';
import {icons, images} from '../constants';
import {RouteTabsParamList} from './HomeScreen';
import {ProductItem} from '../components';
import {DetailedProductData} from '../constants/data';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {activeStar} from '../assets/svgs/activeStar';
import {inactiveStar} from '../assets/svgs/inactiveStar';
import {halfStar} from '../assets/svgs/halfstar';
import {rightArrow} from '../assets/svgs/rightArrow';
import {sendGifts} from '../assets/svgs/sendGifts';
import {FeaturesData} from '../tabs/HomeTab';
import {api} from '../services/api';

type ScreenRouteProps = RouteProp<RouteStackParamList, 'ProductDetails'>;

type ProductDetailsProps = {
  route: ScreenRouteProps;
};

const ProductsDetailsScreen: React.FC<ProductDetailsProps> = ({route}) => {
  const {itemDetails, productId} = route.params || {};
  const navigation =
    useNavigation<StackNavigationProp<RouteTabsParamList, 'Cart'>>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [product, setProduct] = useState<any>(itemDetails);
  const [loading, setLoading] = useState(!!productId && !itemDetails);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  // Fetch product details if productId is provided
  useEffect(() => {
    if (productId && !itemDetails) {
      fetchProductDetails();
    } else if (itemDetails) {
      setProduct(itemDetails);
      fetchSimilarProducts();
    }
  }, [productId, itemDetails]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const productData = await api.getProductById(productId);
      if (productData) {
        setProduct(productData);
        fetchSimilarProducts(productData.category?._id || productData.category);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async (categoryId?: string) => {
    try {
      const allProducts = await api.getProducts();
      // Filter similar products (same category or random if no category)
      const similar = categoryId
        ? allProducts.filter((p: any) => 
            (p.category?._id === categoryId || p.category === categoryId) && 
            p._id !== product?._id
          ).slice(0, 5)
        : allProducts.filter((p: any) => p._id !== product?._id).slice(0, 5);
      setSimilarProducts(similar);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  };

  const productImages = product?.image || [];
  const currency = (product as any)?.currency || 'SAR';
  const screenWidth = Dimensions.get('window').width;
  const carouselWidth = screenWidth - Spacing[5] * 2; // Subtract horizontal padding

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary || '#007AFF'} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const GoBack = () => {
    navigation.goBack();
  };

  const NavigateToCart = () => {
    navigation.navigate('Cart', {itemDetails: product!});
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starsArray = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsArray.push(
          <SvgXml key={i} xml={activeStar} width={r(16)} height={r(16)} />
        );
      } else if (i === fullStars && hasHalfStar) {
        starsArray.push(
          <SvgXml key={i} xml={halfStar} width={r(16)} height={r(16)} />
        );
      } else {
        starsArray.push(
          <SvgXml key={i} xml={inactiveStar} width={r(16)} height={r(16)} />
        );
      }
    }
    return starsArray;
  };

  // Get selected variations
  const selectedVariations = product?.variations
    ?.map((variation: any) => {
      const selected = variation.options.find((opt: any) => opt.isSelected);
      return selected ? selected.label : null;
    })
    .filter(Boolean) || [];


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={GoBack} style={styles.backButton}>
          <FastImage
            source={icons.next1}
            style={[styles.backIcon, {transform: [{rotate: '180deg'}]}]}
            resizeMode={FastImage.resizeMode.contain}
          />
        </TouchableOpacity>
        <FastImage
          source={images.homeLogo}
          style={styles.logo}
          resizeMode={FastImage.resizeMode.contain}
        />
        <TouchableOpacity onPress={NavigateToCart} style={styles.cartButton}>
          <FastImage
            source={icons.cart}
            style={styles.cartIcon}
            resizeMode={FastImage.resizeMode.contain}
          />
        </TouchableOpacity>
      </View>

      {/* Image Carousel */}
      <View style={styles.carouselContainer}>
        <Carousel
          loop={false}
          width={carouselWidth}
          height={r(236)}
          data={productImages}
          scrollAnimationDuration={1000}
          onSnapToItem={index => setCurrentImageIndex(index)}
          renderItem={({item}) => (
            <FastImage
              source={{uri: item}}
              style={styles.carouselImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}
        />
        {/* Pagination dots */}
        <View style={styles.paginationContainer}>
          {productImages.length <= 5
            ? productImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))
            : Array.from({length: 5}, (_, i) => {
                const startIndex =
                  currentImageIndex <= 2
                    ? 0
                    : currentImageIndex >= productImages.length - 3
                    ? productImages.length - 5
                    : currentImageIndex - 2;
                const index = startIndex + i;
                return (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                );
              })}
        </View>
      </View>

      {/* Price Section */}
      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {currency} {product?.price}
            </Text>
            <Text style={styles.priceBeforeDeal}>
              {currency} {product?.priceBeforeDeal}
            </Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product?.priceOff} Off</Text>
          </View>
        </View>
      </View>

      {/* Product Name and Subtitle */}
      <Text style={styles.productName}>{product?.title}</Text>
      <Text style={styles.subtitle}>{product?.subtitle}</Text>

      {/* Rating */}
      <View style={styles.ratingRow}>
        <View style={styles.starsContainer}>
          {renderStars(product?.stars || 0)}
        </View>
        <Text style={styles.reviewCount}>
          {formatNumber(product?.numberOfReview || 0)}
        </Text>
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description:</Text>
        <Text
          style={styles.descriptionText}
          numberOfLines={isDescriptionExpanded ? undefined : 3}>
          {product?.description}
        </Text>
        <TouchableOpacity
          onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
          <Text style={styles.moreText}>
            {isDescriptionExpanded ? 'Less' : 'More'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Three Buttons: Nearest Store, VIP, Return policy */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.infoButton}>
          <FastImage
            source={icons.offer}
            style={styles.infoButtonIcon}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={styles.infoButtonText}>Nearest Store</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoButton}>
          <FastImage
            source={icons.lock}
            style={styles.infoButtonIcon}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={styles.infoButtonText}>VIP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoButton}>
          <FastImage
            source={icons.show_all}
            style={styles.infoButtonIcon}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={styles.infoButtonText}>Return policy</Text>
        </TouchableOpacity>
      </View>

      {/* Variations Section */}
      {product?.variations && selectedVariations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Variations</Text>
          <TouchableOpacity style={styles.variationsRow}>
            <View style={styles.variationsContainer}>
              {selectedVariations.map((variation, index) => (
                <View key={index} style={styles.variationChip}>
                  <Text style={styles.variationText}>{variation}</Text>
                </View>
              ))}
            </View>
            <SvgXml xml={rightArrow} width={r(20)} height={r(20)} />
          </TouchableOpacity>
        </View>
      )}

      {/* Specifications Section */}
      {product?.specifications && product.specifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specificationsContainer}>
            {product.specifications
              .filter(spec => spec.label === 'Material')
              .map((spec, index) => (
                <View key={index} style={styles.specChip}>
                  <Text style={styles.specText}>{spec.value}</Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Delivery Section */}
      {product?.deliveryOptions && product.deliveryOptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery:</Text>
          <View style={styles.deliveryOptionsContainer}>
            {product.deliveryOptions.map((option: any, index: number) => (
              <View key={index} style={styles.deliveryOption}>
                <Text style={styles.deliveryType}>{option.type}</Text>
                <Text style={styles.deliveryDuration}>{option.duration}</Text>
                <Text style={styles.deliveryPrice}>
                  {currency} {option.price}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Color Section */}
      {product?.colorOptions && product.colorOptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color:</Text>
          <View style={styles.colorContainer}>
            {product.colorOptions.map((colorOption: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorSwatch,
                  colorOption.isSelected && styles.colorSwatchSelected,
                  {backgroundColor: colorOption.color},
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Rating & Reviews Section */}
      {product?.reviews && product.reviews.length > 0 && (
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Rating & Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ratingDisplay}>
            <View style={styles.starsContainer}>
              {renderStars(product.stars || 0)}
            </View>
            <Text style={styles.ratingNumber}>
              {product.stars}/5
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <FastImage
              source={{uri: product.reviews[0].userAvatar}}
              style={styles.reviewAvatar}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.reviewContent}>
              <Text style={styles.reviewerName}>
                {product.reviews[0].userName}
              </Text>
              <View style={styles.reviewStars}>
                {renderStars(product.reviews[0].rating)}
              </View>
              <Text style={styles.reviewText} numberOfLines={3}>
                {product.reviews[0].comment}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.sendGiftButton}>
          <SvgXml xml={sendGifts} width={r(20)} height={r(20)} />
          <Text style={styles.sendGiftText}>Send as Gift</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={NavigateToCart}>
          <FastImage
            source={icons.cart_circle}
            style={styles.actionButtonIcon}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.buyNowButton}>
        <Text style={styles.buyNowText}>Buy Now</Text>
      </TouchableOpacity>

      {/* Similar Items Section */}
      <View style={styles.similarSection}>
        <View style={styles.similarHeader}>
          <Text style={styles.similarTitle}>Similar Items</Text>
          <View style={styles.similarActions}>
            {FeaturesData.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.similarActionButton}>
                <FastImage
                  source={item.image as any}
                  style={styles.similarActionIcon}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.similarActionText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.similarProductsContainer}>
          {similarProducts.length > 0 ? (
            <FlatList
              data={similarProducts}
              renderItem={({item}) => (
                <ProductItem
                  image={item.image && item.image.length > 0 ? item.image[0] : 'https://via.placeholder.com/200'}
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  priceBeforeDeal={item.priceBeforeDeal}
                  priceOff={item.priceOff}
                  stars={item.stars}
                  numberOfReview={item.numberOfReview}
                  itemDetails={item}
                  currency={(item as any).currency || 'SAR'}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListFooterComponent={<View style={styles.separator} />}
              ListHeaderComponent={<View style={styles.separator} />}
            />
          ) : (
            <Text style={styles.emptyText}>No similar products found</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[5],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing[5],
    paddingBottom: Spacing[3],
  },
  backButton: {
    width: r(32),
    height: r(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: r(24),
    height: r(24),
  },
  logo: {
    width: r(96),
    height: r(32),
  },
  cartButton: {
    width: r(32),
    height: r(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    width: r(24),
    height: r(24),
  },
  carouselContainer: {
    marginTop: Spacing[3],
    marginBottom: Spacing[4],
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: r(12),
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: r(6),
    marginTop: Spacing[4],
  },
  paginationDot: {
    width: r(12),
    height: r(12),
    borderRadius: r(6),
    backgroundColor: Colors.gray[300] || '#D3D3D3',
  },
  paginationDotActive: {
    backgroundColor: '#FF69B4',
    width: r(12),
    height: r(12),
    borderRadius: r(6),
  },
  priceSection: {
    marginBottom: Spacing[4],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flex: 1,
  },
  price: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  discountBadge: {
    backgroundColor: '#FFE6EB',
    paddingHorizontal: r(12),
    paddingVertical: r(6),
    borderRadius: r(6),
  },
  discountText: {
    color: '#FA7189',
    fontSize: r(14),
    fontFamily: FontFamilies.msemibold,
    fontWeight: '600',
  },
  priceBeforeDeal: {
    fontSize: r(18),
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  productName: {
    fontSize: r(22),
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    fontWeight: '700',
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontSize: r(14),
    fontFamily: FontFamilies.pregular,
    color: Colors.black[100],
    marginBottom: Spacing[3],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r(2),
  },
  reviewCount: {
    fontSize: r(14),
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#9CA3AF',
  },
  section: {
    marginBottom: Spacing[5],
  },
  sectionTitle: {
    fontSize: r(18),
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    fontWeight: '700',
    marginBottom: Spacing[3],
  },
  descriptionText: {
    fontSize: r(14),
    fontFamily: FontFamilies.pregular,
    color: Colors.black[100],
    lineHeight: r(22),
    marginBottom: Spacing[2],
  },
  moreText: {
    fontSize: r(14),
    fontFamily: FontFamilies.pmedium,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[5],
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r(8),
    paddingVertical: r(10),
    paddingHorizontal: r(14),
    borderRadius: r(8),
    borderWidth: r(1),
    borderColor: Colors.gray[300] || '#E5E7EB',
    backgroundColor: Colors.white,
    flex: 1,
  },
  infoButtonIcon: {
    width: r(18),
    height: r(18),
  },
  infoButtonText: {
    fontSize: r(13),
    fontFamily: FontFamilies.pregular,
    color: Colors.black[100],
  },
  variationsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variationsContainer: {
    flexDirection: 'row',
    gap: Spacing[2],
    flex: 1,
  },
  variationChip: {
    backgroundColor: Colors.gray[200] || '#E5E7EB',
    paddingHorizontal: r(12),
    paddingVertical: r(6),
    borderRadius: r(8),
  },
  variationText: {
    fontSize: r(14),
    fontFamily: FontFamilies.pmedium,
    color: Colors.black[100],
  },
  specificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  specChip: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: r(12),
    paddingVertical: r(6),
    borderRadius: r(8),
  },
  specText: {
    fontSize: r(14),
    fontFamily: FontFamilies.pregular,
    color: Colors.black[100],
  },
  deliveryOptionsContainer: {
    gap: Spacing[3],
  },
  deliveryOption: {
    borderWidth: r(1),
    borderColor: '#FF69B4',
    borderRadius: r(8),
    padding: r(12),
  },
  deliveryType: {
    fontSize: r(16),
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    fontWeight: '600',
    marginBottom: r(4),
  },
  deliveryDuration: {
    fontSize: r(14),
    fontFamily: FontFamilies.pregular,
    color: Colors.gray[600] || '#4B5563',
    marginBottom: r(4),
  },
  deliveryPrice: {
    fontSize: r(16),
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
    fontWeight: '500',
  },
  colorContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  colorSwatch: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
    borderWidth: r(2),
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: Colors.red[500],
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  viewAllText: {
    fontSize: r(14),
    fontFamily: FontFamilies.pmedium,
    color: Colors.red[500],
    fontWeight: '500',
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  ratingNumber: {
    fontSize: r(18),
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    fontWeight: '700',
  },
  reviewItem: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  reviewAvatar: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
  },
  reviewContent: {
    flex: 1,
  },
  reviewerName: {
    fontSize: r(16),
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    fontWeight: '600',
    marginBottom: r(4),
  },
  reviewStars: {
    flexDirection: 'row',
    gap: r(2),
    marginBottom: r(4),
  },
  reviewText: {
    fontSize: r(14),
    fontFamily: FontFamilies.pregular,
    color: Colors.gray[600] || '#4B5563',
    lineHeight: r(20),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  sendGiftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: r(8),
    backgroundColor: '#10B981',
    paddingVertical: r(14),
    borderRadius: r(12),
  },
  sendGiftText: {
    fontSize: r(16),
    fontFamily: FontFamilies.msemibold,
    color: Colors.white,
    fontWeight: '600',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: r(8),
    backgroundColor: Colors.red[500],
    paddingVertical: r(14),
    borderRadius: r(12),
  },
  actionButtonIcon: {
    width: r(20),
    height: r(20),
  },
  addToCartText: {
    fontSize: r(16),
    fontFamily: FontFamilies.msemibold,
    color: Colors.white,
    fontWeight: '600',
  },
  buyNowButton: {
    borderWidth: r(2),
    borderColor: '#FF69B4',
    backgroundColor: 'transparent',
    paddingVertical: r(14),
    borderRadius: r(12),
    alignItems: 'center',
    marginBottom: Spacing[5],
  },
  buyNowText: {
    fontSize: r(16),
    fontFamily: FontFamilies.msemibold,
    color: '#FF69B4',
    fontWeight: '600',
  },
  similarSection: {
    marginBottom: Spacing[8],
  },
  similarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  similarTitle: {
    fontSize: r(20),
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    fontWeight: '700',
  },
  similarActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  similarActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r(4),
    paddingVertical: r(6),
    paddingHorizontal: r(10),
    borderRadius: r(8),
    borderWidth: r(1),
    borderColor: Colors.gray[300] || '#D3D3D3',
    backgroundColor: Colors.white,
  },
  similarActionIcon: {
    width: r(16),
    height: r(16),
  },
  similarActionText: {
    fontSize: r(12),
    fontFamily: FontFamilies.pmedium,
    color: Colors.black[100],
  },
  similarProductsContainer: {
    marginTop: Spacing[3],
  },
  separator: {
    width: Spacing[2],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[5],
  },
  loadingText: {
    marginTop: Spacing[3],
    fontSize: FontSizes.base,
    color: Colors.gray[500] || '#999',
    fontFamily: FontFamilies.pregular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[5],
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.error || '#FF0000',
    fontFamily: FontFamilies.pmedium,
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.gray[500] || '#999',
    fontFamily: FontFamilies.pregular,
    textAlign: 'center',
    padding: Spacing[4],
  },
});

export default ProductsDetailsScreen;
