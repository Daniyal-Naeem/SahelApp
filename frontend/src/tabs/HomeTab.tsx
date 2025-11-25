import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ImageSourcePropType,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {icons, images} from '../constants';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CustomSearch, ProductItem} from '../components';
import {CategoriesData, ProductData} from '../constants/data';
import {removeItem} from '../utils/AsyncStorage';
import {ProductTypes} from '../constants/types';
import {Colors, Spacing, FontSizes, FontFamilies} from '../constants/styles';

type Props = {};

const HomeTab = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList> & DrawerNavigationProp<any>>();
  type RootStackParamList = {
    Setting: undefined;
  };
  // real data
  const [products, setProducts] = useState<ProductTypes[]>([]);
  useEffect(() => {
    // fetch data
    const fetchData = async () => {
      const data = await fetch('http://10.0.2.2:4000/api/products/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      const response = await data.json();
      console.log(response);
      setProducts(response);
    };
    fetchData();
  }, [products]); // update when products items updated

  const NavigateToProfile = async () => {
    navigation.navigate('Setting');
    await removeItem('onboarded'); // will reset to onboarding
  };
  const handleOpenDrawer = () => {
    navigation.openDrawer();
  };
  const handleSelectCategory = () => {};
  return (
    <ScrollView>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleOpenDrawer}>
          <Image source={icons.menu} style={styles.headerIcon} resizeMode="contain" />
        </TouchableOpacity>

        <Image
          source={images.homeLogo}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={NavigateToProfile}>
          <Image
            source={icons.profile}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      {/* search */}
      <CustomSearch initialQuery="" />
      {/* features */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>All Features </Text>
        <View style={styles.featuresButtons}>
          {FeaturesData.map(item => (
            <View
              style={styles.featureButton}
              key={item.id}>
              <Text style={styles.featureButtonText}> {item.title} </Text>
              <Image
                source={item.image}
                style={styles.featureIcon}
                resizeMode="contain"
              />
            </View>
          ))}
        </View>
      </View>
      {/* categories */}
      <View>
        <FlatList
          data={CategoriesData}
          renderItem={({item}) => (
            <TouchableOpacity onPress={handleSelectCategory}>
              <Image
                source={{uri: item.image}}
                style={styles.categoryImage}
              />
              <Text style={styles.categoryText}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={<View style={styles.separator} />}
          ListHeaderComponent={<View style={styles.separator} />}
        />
      </View>
      {/* offer */}
      <View>
        <Image
          source={images.deal_off}
          resizeMode="contain"
          style={styles.dealImage}
        />
      </View>
      {/* daily .. */}
      <View style={styles.dailyContainer}>
        <View>
          <Text style={styles.dailyTitle}>
            Deals of the Day
          </Text>
          <View style={styles.dailyTimeContainer}>
            <Image
              source={icons.calender}
              resizeMode="contain"
              style={styles.dailyIcon}
            />
            <Text style={styles.dailyTime}>
              22h 55m 20s remaining
            </Text>
          </View>
        </View>
        <View style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View all</Text>
          <Image
            source={icons.show_all}
            resizeMode="contain"
            style={styles.viewAllIcon}
          />
        </View>
      </View>
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
          ListFooterComponent={<View style={styles.separator} />}
          ListHeaderComponent={<View style={styles.separator} />}
        />
      </View>
      {/* special Offer */}
      <View style={styles.specialOfferContainer}>
        <Image
          source={icons.offer}
          style={styles.offerIcon}
          resizeMode="contain"
        />
        <View>
          <Text style={styles.specialOfferTitle}>
            Special Offers
          </Text>
          <Text style={styles.specialOfferText}>
            We make sure you get the offer you need at best prices
          </Text>
        </View>
      </View>
      {/* Flat Shoes Offer */}
      <View style={styles.flatContainer}>
        <Image
          source={images.flat}
          style={styles.flatImage}
          resizeMode="contain"
        />
      </View>
      {/* Trending Products */}
      <View style={styles.trendingContainer}>
        <View>
          <Text style={styles.trendingTitle}>
            Daily of the Day
          </Text>
          <View style={styles.trendingTimeContainer}>
            <Image
              source={icons.calender}
              resizeMode="contain"
              style={styles.trendingIcon}
            />
            <Text style={styles.trendingTime}>
              22h 55m 20s remaining
            </Text>
          </View>
        </View>
        <View style={styles.trendingViewAllButton}>
          <Text style={styles.trendingViewAllText}>View all</Text>
          <Image
            source={icons.show_all}
            resizeMode="contain"
            style={styles.trendingViewAllIcon}
          />
        </View>
      </View>
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
          ListFooterComponent={<View style={styles.separator} />}
          ListHeaderComponent={<View style={styles.separator} />}
        />
      </View>
      {/* .... */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing[5],
  },
  headerIcon: {
    width: 32,
    height: 32,
  },
  logo: {
    width: 96,
    height: 96,
  },
  featuresContainer: {
    flexDirection: 'row',
    marginVertical: Spacing[5],
    marginHorizontal: Spacing[5],
    justifyContent: 'space-between',
  },
  featuresTitle: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
  },
  featuresButtons: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  featureButton: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing[2],
  },
  featureButtonText: {
    color: Colors.black[100],
  },
  featureIcon: {
    width: 16,
    height: 16,
  },
  categoryImage: {
    width: 96,
    height: 96,
    borderRadius: 9999,
  },
  categoryText: {
    color: 'rgba(0, 0, 0, 0.8)',
    textAlign: 'center',
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.pmedium,
  },
  separator: {
    width: Spacing[8],
  },
  dealImage: {
    width: '100%',
    marginTop: Spacing[8],
  },
  dailyContainer: {
    backgroundColor: '#FFCA28',
    borderRadius: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: Spacing[5],
    paddingLeft: Spacing[5],
    paddingVertical: Spacing[5],
  },
  dailyTitle: {
    color: Colors.white,
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.psemibold,
  },
  dailyTimeContainer: {
    flexDirection: 'row',
    marginTop: Spacing[3],
    alignItems: 'center',
    gap: 4,
  },
  dailyIcon: {
    width: 24,
    height: 24,
  },
  dailyTime: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.pmedium,
  },
  viewAllButton: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.white,
    marginRight: Spacing[3],
    height: 48,
    paddingHorizontal: Spacing[3],
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  },
  viewAllText: {
    color: Colors.white,
    fontFamily: FontFamilies.pmedium,
    fontSize: FontSizes.lg,
  },
  viewAllIcon: {
    width: 24,
    height: 24,
  },
  productsContainer: {
    marginVertical: Spacing[8],
  },
  specialOfferContainer: {
    flexDirection: 'row',
    marginVertical: Spacing[5],
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    marginHorizontal: Spacing[5],
    borderRadius: 8,
  },
  offerIcon: {
    width: 96,
    height: 96,
  },
  specialOfferTitle: {
    fontSize: FontSizes['2xl'],
    marginBottom: Spacing[1],
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
  },
  specialOfferText: {
    color: Colors.neutral[500],
    fontSize: FontSizes.base,
    width: 208,
  },
  flatContainer: {
    marginVertical: Spacing[5],
  },
  flatImage: {
    alignSelf: 'center',
  },
  trendingContainer: {
    backgroundColor: Colors.red[500],
    borderRadius: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: Spacing[5],
    paddingLeft: Spacing[5],
    paddingVertical: Spacing[5],
  },
  trendingTitle: {
    color: Colors.white,
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.psemibold,
  },
  trendingTimeContainer: {
    flexDirection: 'row',
    marginTop: Spacing[3],
    alignItems: 'center',
    gap: 4,
  },
  trendingIcon: {
    width: 24,
    height: 24,
  },
  trendingTime: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.pmedium,
  },
  trendingViewAllButton: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.white,
    marginRight: Spacing[3],
    height: 48,
    paddingHorizontal: Spacing[3],
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  },
  trendingViewAllText: {
    color: Colors.white,
    fontFamily: FontFamilies.pmedium,
    fontSize: FontSizes.lg,
  },
  trendingViewAllIcon: {
    width: 24,
    height: 24,
  },
});

export default HomeTab;

type FeaturesDataProps = {
  id: number;
  title: string;
  image: ImageSourcePropType;
};

export const FeaturesData: FeaturesDataProps[] = [
  {
    id: 1,
    title: 'Sort',
    image: icons.sort,
  },
  {
    id: 2,
    title: 'Filter',
    image: icons.filter,
  },
];
