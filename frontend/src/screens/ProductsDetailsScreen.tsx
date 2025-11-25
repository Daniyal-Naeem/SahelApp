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
import {RouteTabsParamList} from './HomeScreen';
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
    useNavigation<StackNavigationProp<RouteTabsParamList, 'Cart'>>();

  const GoBack = () => {
    navigation.goBack();
  };
  const NavigateToCart = () => {
    navigation.navigate('Cart', {itemDetails: itemDetails!});
  };
  return (
    <ScrollView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={GoBack}>
          <Image
            source={icons.next1}
            style={[styles.backIcon, {transform: [{rotate: '180deg'}]}]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={NavigateToCart}>
          <Image source={icons.cart} style={styles.cartIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
      {/* image slider */}
      <View style={styles.imageContainer}>
        <Image
          source={{uri: itemDetails?.image[0]}}
          style={styles.productImage}
        />
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
        <Text style={styles.title}>
          {itemDetails?.title}
        </Text>
        <Text style={styles.subtitle}>
          Vision Alta Men's Shoes Size (All Colours)
        </Text>
        <View style={styles.ratingContainer}>
          <View>
            <AirbnbRating
              count={itemDetails?.stars}
              reviews={['Terrible', 'Bad', 'Okay', 'Good', 'Great']}
              defaultRating={itemDetails?.stars}
              size={20}
              ratingContainerStyle={{flex: 1, flexDirection: 'row'}}
            />
          </View>

          <Text style={styles.reviewCount}>
            {itemDetails?.numberOfReview}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            ${itemDetails?.price}
          </Text>
          <Text style={styles.priceBeforeDeal}>
            {itemDetails?.priceBeforeDeal}
          </Text>
          <Text style={styles.priceOff}>
            {itemDetails?.priceOff}
          </Text>
        </View>
        <View style={styles.productDetailsContainer}>
          <Text style={styles.productDetailsTitle}>
            Product Details
          </Text>
          <Text style={styles.productDetailsText}>
            {itemDetails?.description}
          </Text>
        </View>
        {/* status */}
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
        {/* go to cart/ buy now */}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonWrapper}>
            <View style={styles.actionIconContainer}>
              <Image
                source={icons.cart_circle}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.cartButton}>
              <Text style={styles.actionButtonText}>
                Go To Cart
              </Text>
            </View>
          </View>
          <View style={styles.actionButtonWrapper}>
            <View style={styles.actionIconContainer}>
              <Image
                source={icons.buy}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.buyButton}>
              <Text style={styles.actionButtonText}>
                Buy Now
              </Text>
            </View>
          </View>
        </View>
        {/* delivery in ... */}
        <View style={styles.deliveryContainer}>
          <Text style={styles.deliveryText}>Delivery in </Text>
          <Text style={styles.deliveryTime}>
            1 within Hour
          </Text>
        </View>
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
        {/* similar to */}
        <View style={styles.similarSection}>
          <Text style={styles.similarTitle}>
            Similar To
          </Text>
          {/* features */}
          <View style={styles.similarFeaturesContainer}>
            <Text style={styles.similarItemsCount}>282+ Items </Text>
            <View style={styles.similarFeaturesButtons}>
              {FeaturesData.map(item => (
                <View
                  style={styles.similarFeatureButton}
                  key={item.id}>
                  <Text style={styles.similarFeatureText}> {item.title} </Text>
                  <Image
                    source={item.image}
                    style={styles.similarFeatureIcon}
                    resizeMode="contain"
                  />
                </View>
              ))}
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
    paddingTop: Spacing[5],
    paddingHorizontal: Spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backIcon: {
    width: r(32),
    height: r(32),
  },
  cartIcon: {
    width: r(24),
    height: r(24),
  },
  imageContainer: {
    marginTop: Spacing[5],
  },
  productImage: {
    height: r(288),
    borderRadius: r(16),
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
    marginTop: Spacing[5],
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  subtitle: {
    color: Colors.neutral[400],
    fontFamily: FontFamilies.pmedium,
    fontSize: FontSizes.lg,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  reviewCount: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mthin,
    color: 'rgba(0, 0, 0, 0.9)',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  price: {
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    fontSize: FontSizes['2xl'],
    textAlign: 'left',
  },
  priceBeforeDeal: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontFamily: FontFamilies.mthin,
    fontSize: FontSizes.xl,
    textDecorationLine: 'line-through',
    textAlign: 'left',
  },
  priceOff: {
    color: Colors.action,
    fontFamily: FontFamilies.mthin,
    fontSize: FontSizes.xl,
  },
  productDetailsContainer: {
    marginTop: Spacing[3],
  },
  productDetailsTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.psemibold,
    color: Colors.black[100],
  },
  productDetailsText: {
    fontSize: r(16),
    fontFamily: FontFamilies.pmedium,
    color: Colors.neutral[400],
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
    gap: Spacing[5],
    alignItems: 'center',
    marginTop: Spacing[5],
  },
  actionButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    zIndex: 20,
  },
  actionIcon: {
    width: r(48),
    height: r(48),
    marginRight: r(-4),
  },
  cartButton: {
    backgroundColor: '#2563EB',
    paddingVertical: r(6),
    paddingHorizontal: Spacing[4],
    marginLeft: r(-16),
    borderRadius: r(12),
    zIndex: 10,
  },
  buyButton: {
    backgroundColor: '#10B981',
    paddingVertical: r(6),
    paddingHorizontal: Spacing[4],
    marginLeft: r(-16),
    borderRadius: r(12),
    zIndex: 10,
  },
  actionButtonText: {
    color: Colors.white,
    fontFamily: FontFamilies.pmedium,
    fontSize: FontSizes['2xl'],
  },
  deliveryContainer: {
    backgroundColor: '#FCA5A5',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    marginVertical: Spacing[5],
  },
  deliveryText: {
    color: Colors.black[100],
    fontSize: FontSizes.lg,
  },
  deliveryTime: {
    color: Colors.black[100],
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
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
    borderColor: Colors.neutral[200],
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
  similarTitle: {
    fontSize: FontSizes['2xl'],
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    textAlign: 'left',
  },
  similarFeaturesContainer: {
    flexDirection: 'row',
    marginVertical: Spacing[5],
    marginHorizontal: Spacing[5],
    justifyContent: 'space-between',
  },
  similarItemsCount: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
  },
  similarFeaturesButtons: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  similarFeatureButton: {
    backgroundColor: Colors.white,
    borderRadius: r(8),
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing[2],
  },
  similarFeatureText: {
    color: Colors.black[100],
  },
  similarFeatureIcon: {
    width: r(16),
    height: r(16),
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
