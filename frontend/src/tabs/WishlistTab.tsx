import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
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

type Props = {};

const RowSeparator = () => <View style={styles.rowSeparator} />;

const WishlistTab = (_props: Props) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const width = Dimensions.get('window').width;
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  
  // Use wishlist items from Redux store
  const displayProducts: ProductTypes[] = wishlistItems;

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
      {displayProducts.length > 0 ? (
        <FlatList
          data={displayProducts}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={(item, index) => item._id || index.toString()}
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
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>
            Add items to your wishlist by tapping the heart icon on products
          </Text>
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
});

export default WishlistTab;
