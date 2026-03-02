import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {ProductItem, CustomSearch, UnderPriceFilter} from '../components';
import {DetailedProductData} from '../constants/data';
import {ProductTypes} from '../constants/types';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {homeMenu} from '../assets/svgs/homeMenu';
import {filterIcon} from '../assets/svgs/filter';
import {sortIcon} from '../assets/svgs/sortIcon';
import {images, icons} from '../constants';

type Props = {};

type CategoryTabRouteParams = {
  categoryTitle: string;
  categoryId?: string;
};

const RowSeparator = () => <View style={styles.rowSeparator} />;

const CategoryTab = (_props: Props) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const route = useRoute<RouteProp<{Category: CategoryTabRouteParams}, 'Category'>>();
  const insets = useSafeAreaInsets();
  const width = Dimensions.get('window').width;
  
  const {categoryTitle, categoryId} = route.params || {categoryTitle: 'Category'};
  const [selectedUnderPrice, setSelectedUnderPrice] = useState<number | null>(null);

  // Filter products by category
  const displayProducts: ProductTypes[] = useMemo(() => {
    let filtered = DetailedProductData;
    
    if (categoryTitle) {
      const categoryTitleLower = categoryTitle.toLowerCase();
      
      // Filter products that match the category
      filtered = DetailedProductData.filter((product) => {
        // Check if product has a category field
        const productCategory = (product as any).category?.toLowerCase() || '';
        
        // Check if any tags match the category
        const productTags = product.tags?.map(tag => tag.toLowerCase()) || [];
        const hasMatchingTag = productTags.some(tag => 
          tag.includes(categoryTitleLower) || categoryTitleLower.includes(tag)
        );
        
        // Match by category name, ID, or tags
        return (
          productCategory.includes(categoryTitleLower) ||
          productCategory === categoryTitleLower ||
          hasMatchingTag ||
          (categoryId && (product as any).categoryId === categoryId)
        );
      });
    }
    
    // Apply under-price filter if selected
    if (selectedUnderPrice) {
      filtered = filtered.filter(product => product.price <= selectedUnderPrice);
    }
    
    return filtered;
  }, [categoryTitle, categoryId, selectedUnderPrice]);

  const NavigateToProfile = () => {
    navigation.navigate('Setting');
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

      {/* Category Title and Buttons */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{categoryTitle}</Text>
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

      {/* Under Price Filter */}
      <View style={styles.underPriceSection}>
        <UnderPriceFilter
          selectedValue={selectedUnderPrice}
          onSelect={setSelectedUnderPrice}
          currency="SAR"
        />
      </View>

      {/* Products Grid */}
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
          />
        )}
        columnWrapperStyle={styles.row}
        ItemSeparatorComponent={RowSeparator}
        contentContainerStyle={styles.productsGrid}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found in this category</Text>
          </View>
        }
      />
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
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  underPriceSection: {
    marginBottom: Spacing[5],
  },
  categoryTitle: {
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
    paddingVertical: Spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
  },
});

export default CategoryTab;

