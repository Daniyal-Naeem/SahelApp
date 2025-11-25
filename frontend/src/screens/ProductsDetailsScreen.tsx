import {RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {AirbnbRating} from 'react-native-ratings';
import {RouteStackParamList} from '../../App';
import {icons} from '../constants';
import LinearGradient from 'react-native-linear-gradient';
import {FeaturesData} from '../tabs/HomeTab';
import {ProductItem} from '../components';
import {ProductData} from '../constants/data';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';

type ScreenRouteProps = RouteProp<RouteStackParamList, 'ProductDetails'>;

type ProductDetailsProps = {
  route: ScreenRouteProps;
};

const ProductsDetailsScreen: React.FC<ProductDetailsProps> = ({route}) => {
  const {itemDetails} = route.params || {};
  const navigation =
    useNavigation<StackNavigationProp<RouteStackParamList>>();
  
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState(1);
  const [selectedDelivery, setSelectedDelivery] = React.useState(0);

  const GoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeScreen');
    }
  };
  const NavigateToCart = () => {
    // Navigate to HomeScreen first, then to Cart tab
    navigation.navigate('HomeScreen');
    // Note: Cart is a tab, so we need to navigate to HomeScreen and then switch to Cart tab
    // This will be handled by the tab navigator
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const discountPercent = itemDetails?.priceBeforeDeal && itemDetails?.price
    ? Math.round(((itemDetails.priceBeforeDeal - itemDetails.price) / itemDetails.priceBeforeDeal) * 100)
    : 0;

  const productImages = itemDetails?.image || [];
  const colors = ['#FF0000', '#FFD700', '#00FF00', '#000000', '#800080'];
  const sizes = itemDetails?.ukSide || ['6', '7', '8', '9', '10'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={GoBack}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}>
          <Image
            source={icons.next1}
            style={[styles.backIcon, {transform: [{rotate: '180deg'}]}]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={NavigateToCart}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}>
          <Image source={icons.cart} style={styles.cartIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
      
      {/* image carousel */}
      <View style={styles.imageContainer}>
        <Image
          source={{uri: productImages[selectedImageIndex] || productImages[0]}}
          style={styles.productImage}
          resizeMode="cover"
        />
        {/* Image indicators */}
        {productImages.length > 1 && (
          <View style={styles.imageIndicators}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  selectedImageIndex === index && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
      {/* size uk */}
      <View>
        <Text style={styles.sizeTitle}>Size: 7UK</Text>
        <View style={styles.sizeContainer}>
          {sizeData.map(item => (
            <View
              key={item.id}
              style={styles.sizeButton}>
              <Text style={styles.sizeText}>
                {item.size} uk
              </Text>
            </View>
          ))}
        </View>
      </View>
      {/* details */}
      <View style={styles.detailsContainer}>
        {/* Price Row */}
        <View style={styles.priceRow}>
          <View style={styles.priceLeft}>
            <Text style={styles.price}>
              SAR {itemDetails?.price?.toFixed(2) || '0.00'}
            </Text>
            {itemDetails?.priceBeforeDeal && itemDetails?.priceBeforeDeal > itemDetails?.price && (
              <Text style={styles.priceBeforeDeal}>
                SAR {itemDetails.priceBeforeDeal.toFixed(2)}
              </Text>
            )}
          </View>
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% Off</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {itemDetails?.title}
        </Text>
        <Text style={styles.subtitle}>
          {(itemDetails as any)?.category?.name || 'All Categories'} - Size (All Colours)
        </Text>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            <AirbnbRating
              count={5}
              defaultRating={itemDetails?.stars || 0}
              size={16}
              showRating={false}
              isDisabled={true}
              selectedColor="#FFD700"
              ratingContainerStyle={styles.ratingStars}
            />
          </View>
          <Text style={styles.reviewCount}>
            {formatNumber(itemDetails?.numberOfReview || 0)}
          </Text>
        </View>
        {/* Description */}
        <View style={styles.productDetailsContainer}>
          <Text style={styles.productDetailsTitle}>
            Description:
          </Text>
          <Text style={styles.productDetailsText} numberOfLines={3}>
            {itemDetails?.description || 'No description available.'}
          </Text>
          <Text style={styles.moreText}>...More</Text>
        </View>

        {/* Status Tags */}
        <View style={styles.statusContainer}>
          <FlatList
            data={StatusData}
            renderItem={({item}) => (
              <View style={styles.statusItem}>
                <Image
                  style={styles.statusIcon}
                  resizeMode="contain"
                  source={item.icon}
                />
                <Text style={styles.statusText}>
                  {item.name}
                </Text>
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.statusSeparator} />}
          />
        </View>

        {/* Variations */}
        <View style={styles.variationsContainer}>
          <Text style={styles.sectionTitle}>Variations</Text>
          <View style={styles.variationsRow}>
            <View style={styles.variationChip}>
              <Text style={styles.variationText}>{colors[selectedColor] === '#FF0000' ? 'Pink' : 'Color'}</Text>
            </View>
            <View style={styles.variationChip}>
              <Text style={styles.variationText}>{sizes[selectedSize] || 'M'}</Text>
            </View>
            <Image source={icons.next1} style={styles.variationArrow} resizeMode="contain" />
          </View>
          {/* Variation Images */}
          <View style={styles.variationImagesContainer}>
            {[1, 2, 3].map((item, index) => (
              <View key={index} style={styles.variationImageWrapper}>
                <Image
                  source={{uri: productImages[index] || productImages[0]}}
                  style={styles.variationImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Specifications */}
        <View style={styles.specificationsContainer}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Material:</Text>
            <Text style={styles.specValue}>Cotton 95%, Nylon 5%</Text>
          </View>
        </View>

        {/* Delivery Options */}
        <View style={styles.deliveryOptionsContainer}>
          <Text style={styles.sectionTitle}>Delivery:</Text>
          <View style={styles.deliveryOptions}>
            <TouchableOpacity
              style={[styles.deliveryOption, selectedDelivery === 0 && styles.deliveryOptionSelected]}
              onPress={() => setSelectedDelivery(0)}>
              <Text style={styles.deliveryOptionTitle}>Standard</Text>
              <Text style={styles.deliveryOptionTime}>5-7 days</Text>
              <Text style={styles.deliveryOptionPrice}>SAR 10</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deliveryOption, selectedDelivery === 1 && styles.deliveryOptionSelected]}
              onPress={() => setSelectedDelivery(1)}>
              <Text style={styles.deliveryOptionTitle}>Express</Text>
              <Text style={styles.deliveryOptionTime}>1-2 days</Text>
              <Text style={styles.deliveryOptionPrice}>SAR 25</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Color Selector */}
        <View style={styles.colorContainer}>
          <Text style={styles.sectionTitle}>Color:</Text>
          <View style={styles.colorSwatches}>
            {colors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorSwatch,
                  {backgroundColor: color},
                  selectedColor === index && styles.colorSwatchSelected,
                ]}
                onPress={() => setSelectedColor(index)}
              />
            ))}
          </View>
        </View>

        {/* Rating & Reviews */}
        <View style={styles.reviewsContainer}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Rating & Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.overallRating}>
            <View style={styles.starsContainer}>
              <AirbnbRating
                count={5}
                defaultRating={itemDetails?.stars || 0}
                size={16}
                showRating={false}
                isDisabled={true}
                selectedColor="#FFD700"
                ratingContainerStyle={styles.ratingStars}
              />
            </View>
            <Text style={styles.ratingText}>4/5</Text>
          </View>
          {/* Sample Review */}
          <View style={styles.reviewItem}>
            <Image
              source={{uri: 'https://i.pravatar.cc/150?img=1'}}
              style={styles.reviewAvatar}
            />
            <View style={styles.reviewContent}>
              <Text style={styles.reviewName}>Veronika</Text>
              <View style={styles.reviewRating}>
                <AirbnbRating
                  count={5}
                  defaultRating={4}
                  size={12}
                  showRating={false}
                  isDisabled={true}
                  selectedColor="#FFD700"
                  ratingContainerStyle={styles.ratingStars}
                />
              </View>
              <Text style={styles.reviewText} numberOfLines={3}>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed...
              </Text>
            </View>
          </View>
        </View>
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.giftButton}>
            <Image source={icons.cart_circle} style={styles.giftIcon} resizeMode="contain" />
            <Text style={styles.giftButtonText}>Send as Gift</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addToCartButton} onPress={NavigateToCart}>
            <Image source={icons.cart} style={styles.cartButtonIcon} resizeMode="contain" />
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buyNowButton}>
          <Image source={icons.buy} style={styles.buyNowIcon} resizeMode="contain" />
          <Text style={styles.buyNowButtonText}>Buy Now</Text>
        </TouchableOpacity>
        {/* View similar */}
        <View style={styles.similarActionsContainer}>
          <FlatList
            data={similarData}
            renderItem={({item}) => (
              <View style={styles.similarActionItem}>
                <Image
                  source={item.icon}
                  style={styles.similarActionIcon}
                  resizeMode="contain"
                />
                <Text style={styles.similarActionText}>
                  {item.name}
                </Text>
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.similarSeparator} />}
          />
        </View>
        {/* Similar Items */}
        <View style={styles.similarSection}>
          <View style={styles.similarHeader}>
            <Text style={styles.similarTitle}>
              Similar Items
            </Text>
            <View style={styles.similarActions}>
              <TouchableOpacity style={styles.similarActionButton}>
                <Image source={icons.sort} style={styles.similarActionIcon} resizeMode="contain" />
                <Text style={styles.similarActionText}>Sort</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.similarActionButton}>
                <Image source={icons.filter} style={styles.similarActionIcon} resizeMode="contain" />
                <Text style={styles.similarActionText}>Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* similar products */}
        <View style={styles.similarProductsContainer}>
          <FlatList
            data={itemDetails ? [itemDetails] : []}
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
            ListFooterComponent={<View style={styles.separator} />}
            ListHeaderComponent={<View style={styles.separator} />}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Spacing[5],
    paddingHorizontal: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  backIcon: {
    width: r(24),
    height: r(24),
    tintColor: Colors.black[100],
  },
  cartIcon: {
    width: r(24),
    height: r(24),
    tintColor: Colors.black[100],
  },
  imageContainer: {
    marginTop: Spacing[3],
    marginBottom: Spacing[4],
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: r(380),
    borderRadius: r(16),
    backgroundColor: Colors.gray[100],
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[3],
    gap: Spacing[2],
  },
  indicator: {
    width: r(8),
    height: r(8),
    borderRadius: r(4),
    backgroundColor: Colors.neutral[400],
  },
  indicatorActive: {
    backgroundColor: Colors.action,
    width: r(24),
  },
  sizeTitle: {
    color: Colors.black[100],
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: Spacing[5],
    marginTop: Spacing[5],
    alignItems: 'center',
  },
  sizeButton: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[2],
    borderRadius: r(8),
    borderWidth: 1,
    borderColor: Colors.red[500],
  },
  sizeText: {
    color: Colors.action,
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.pmedium,
  },
  detailsContainer: {
    marginTop: Spacing[2],
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  price: {
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    fontSize: FontSizes['3xl'],
  },
  priceBeforeDeal: {
    color: Colors.neutral[400],
    fontFamily: FontFamilies.pregular,
    fontSize: FontSizes.lg,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: Spacing[3],
    paddingVertical: r(6),
    borderRadius: r(8),
  },
  discountText: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.psemibold,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  subtitle: {
    color: Colors.neutral[500],
    fontFamily: FontFamilies.pmedium,
    fontSize: FontSizes.base,
    marginBottom: Spacing[3],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[4],
    gap: Spacing[2],
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: r(2),
  },
  reviewCount: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.pregular,
    color: Colors.neutral[500],
    marginLeft: Spacing[1],
  },
  productDetailsContainer: {
    marginBottom: Spacing[4],
  },
  productDetailsTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.psemibold,
    color: Colors.black[100],
    marginBottom: Spacing[2],
  },
  productDetailsText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.pregular,
    color: Colors.neutral[500],
    lineHeight: r(22),
  },
  moreText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.pmedium,
    color: Colors.action,
    marginTop: Spacing[1],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginTop: Spacing[5],
  },
  statusItem: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[2],
    borderWidth: 1,
    flexDirection: 'row',
    gap: r(4),
    borderRadius: r(8),
    borderColor: Colors.neutral[500],
  },
  statusIcon: {
    width: r(24),
    height: r(24),
  },
  statusText: {
    color: Colors.neutral[400],
    fontFamily: FontFamilies.pmedium,
    fontSize: FontSizes.lg,
  },
  statusSeparator: {
    width: Spacing[3],
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginTop: Spacing[5],
    marginBottom: Spacing[3],
  },
  giftButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[3],
    borderRadius: r(12),
    gap: Spacing[2],
  },
  giftIcon: {
    width: r(20),
    height: r(20),
    tintColor: Colors.white,
  },
  giftButtonText: {
    color: Colors.white,
    fontFamily: FontFamilies.psemibold,
    fontSize: FontSizes.base,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: Colors.action,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[3],
    borderRadius: r(12),
    gap: Spacing[2],
  },
  cartButtonIcon: {
    width: r(20),
    height: r(20),
    tintColor: Colors.white,
  },
  addToCartButtonText: {
    color: Colors.white,
    fontFamily: FontFamilies.psemibold,
    fontSize: FontSizes.base,
  },
  buyNowButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: '#FF6B9D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[3],
    borderRadius: r(12),
    gap: Spacing[2],
    marginBottom: Spacing[5],
  },
  buyNowIcon: {
    width: r(20),
    height: r(20),
    tintColor: '#FF6B9D',
  },
  buyNowButtonText: {
    color: '#FF6B9D',
    fontFamily: FontFamilies.psemibold,
    fontSize: FontSizes.base,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.psemibold,
    color: Colors.black[100],
    marginBottom: Spacing[3],
  },
  variationsContainer: {
    marginBottom: Spacing[5],
  },
  variationsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  variationChip: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: r(8),
  },
  variationText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.pmedium,
    color: Colors.black[100],
  },
  variationArrow: {
    width: r(16),
    height: r(16),
    tintColor: Colors.neutral[500],
  },
  variationImagesContainer: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  variationImageWrapper: {
    width: r(80),
    height: r(80),
    borderRadius: r(8),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  variationImage: {
    width: '100%',
    height: '100%',
  },
  specificationsContainer: {
    marginBottom: Spacing[5],
  },
  specRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  specLabel: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.psemibold,
    color: Colors.black[100],
  },
  specValue: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.pregular,
    color: Colors.neutral[500],
  },
  deliveryOptionsContainer: {
    marginBottom: Spacing[5],
  },
  deliveryOptions: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  deliveryOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: r(8),
    padding: Spacing[3],
  },
  deliveryOptionSelected: {
    borderColor: Colors.action,
    backgroundColor: '#FFF5F5',
  },
  deliveryOptionTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.psemibold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  deliveryOptionTime: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.pregular,
    color: Colors.neutral[500],
    marginBottom: Spacing[1],
  },
  deliveryOptionPrice: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.psemibold,
    color: Colors.action,
  },
  colorContainer: {
    marginBottom: Spacing[5],
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  colorSwatch: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
    borderWidth: 2,
    borderColor: Colors.gray[300],
  },
  colorSwatchSelected: {
    borderColor: Colors.action,
    borderWidth: 3,
  },
  reviewsContainer: {
    marginBottom: Spacing[5],
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  viewAllText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.pmedium,
    color: Colors.action,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  ratingText: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.psemibold,
    color: Colors.black[100],
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
  reviewName: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.psemibold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  reviewRating: {
    marginBottom: Spacing[1],
  },
  reviewText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.pregular,
    color: Colors.neutral[500],
    lineHeight: r(18),
  },
  similarActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[8],
  },
  similarActionItem: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[3],
    borderRadius: r(8),
    borderWidth: 1,
    borderColor: Colors.gray[200],
    flexDirection: 'row',
    gap: Spacing[2],
  },
  similarActionIcon: {
    width: r(24),
    height: r(24),
  },
  similarActionText: {
    color: Colors.black[100],
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.pmedium,
  },
  similarSeparator: {
    width: Spacing[3],
  },
  similarSection: {
    marginBottom: Spacing[5],
  },
  similarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  similarTitle: {
    fontSize: FontSizes['2xl'],
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
  },
  similarActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  similarActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: r(6),
    backgroundColor: Colors.gray[100],
  },
  similarProductsContainer: {
    marginVertical: Spacing[8],
  },
  separator: {
    width: Spacing[8],
  },
});

export default ProductsDetailsScreen;

interface similarDataType {
  icon: ImageSourcePropType;
  name: string;
}

const similarData: similarDataType[] = [
  {
    icon: icons.eye,
    name: 'View Similar',
  },
  {
    icon: icons.components,
    name: 'Add to Compare',
  },
];

const sizeData = [
  {
    id: 0,
    size: 6,
  },
  {
    id: 1,
    size: 7,
  },
  {
    id: 2,
    size: 8,
  },
  {
    id: 3,
    size: 9,
  },
  {
    id: 4,
    size: 10,
  },
];
interface StatusDataType {
  id: number;
  icon: ImageSourcePropType;
  name: string;
}

const StatusData: StatusDataType[] = [
  {
    id: 0,
    icon: icons.lock,
    name: 'Nearest Store',
  },
  {
    id: 1,
    icon: icons.lock,
    name: 'VIP',
  },
  {
    id: 2,
    icon: icons.lock,
    name: 'Return policy',
  },
];
