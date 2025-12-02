import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useMemo} from 'react';
import {RouteProp} from '@react-navigation/native';
import {CustomSearch, ProductItem} from '../components';
import {DetailedProductData} from '../constants/data';
import {ProductTypes} from '../constants/types';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {searchTrashIcon} from '../assets/svgs/searchTrashIcon';

type RootStackParamList = {
  Search: {query: string} | undefined;
};
type ScreenRouteProps = RouteProp<RootStackParamList, 'Search'>;

interface SearchProps {
  route: ScreenRouteProps;
}

const Separator = () => <View style={styles.separator} />;
const RowSeparator = () => <View style={styles.rowSeparator} />;

const SearchTab = ({route}: SearchProps) => {
  const {query: routeQuery} = route.params || {};
  const width = Dimensions.get('window').width;
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>(routeQuery || '');
  
  // Track if query came from recommendation (to show tag)
  const [isFromRecommendation, setIsFromRecommendation] = useState<boolean>(false);
  
  // Search history state - starts empty, populated as user searches
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Recommendations
  const recommendations = [
    'Winter Collection',
    'Electronics',
    'Fashion Accessories',
    'Home Decor',
    'Sports Equipment',
    'Beauty Products',
    'Mobile Phones',
  ];

  // Products for Discover section
  const discoverProducts: ProductTypes[] = DetailedProductData.slice(0, 5);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const query = searchQuery.toLowerCase().trim();
    return DetailedProductData.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product as any).category?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Calculate item width for 2-column grid
  const itemWidth = (width - Spacing[5] * 2 - Spacing[2]) / 2;

  // Update search query when route params change
  useEffect(() => {
    if (routeQuery) {
      setSearchQuery(routeQuery);
      // Add to search history if not already present
      if (routeQuery) {
        setSearchHistory((prev) => {
          if (!prev.includes(routeQuery)) {
            return [routeQuery, ...prev.slice(0, 6)];
          }
          return prev;
        });
      }
    }
  }, [routeQuery]);

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    setSearchQuery(trimmedQuery);
    
    // Add to search history if not already present and query is not empty
    if (trimmedQuery) {
      setSearchHistory((prev) => {
        if (!prev.includes(trimmedQuery)) {
          return [trimmedQuery, ...prev.slice(0, 6)];
        }
        return prev;
      });
    }
    // Don't reset isFromRecommendation here - let it persist so tag shows
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handleHistoryItemPress = (item: string) => {
    setSearchQuery(item);
    setIsFromRecommendation(false); // History items don't show tag
    handleSearch(item);
  };

  const handleRecommendationPress = (item: string) => {
    setSearchQuery(item);
    setIsFromRecommendation(true); // Recommendations show tag
    handleSearch(item);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsFromRecommendation(false);
  };

  // Show search results if there's a search query
  if (searchQuery.trim()) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {/* Search Heading */}
        <Text style={styles.heading}>Search</Text>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <CustomSearch 
            placeholder="Search any Product.." 
            initialQuery={searchQuery}
            onSearch={(query) => {
              // When user manually searches (Enter/icon), reset recommendation flag
              setIsFromRecommendation(false);
              handleSearch(query);
            }}
            onClear={handleClearSearch}
            showTag={isFromRecommendation && searchQuery.trim().length > 0}
          />
        </View>

        {/* Search Results */}
        <View style={styles.resultsContainer}>
          <FlatList
            data={filteredProducts}
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
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    );
  }

  // Default view when no search query
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}>
      {/* Search Heading */}
      <Text style={styles.heading}>Search</Text>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <CustomSearch 
          placeholder="Search any Product.." 
          initialQuery=""
          onSearch={handleSearch}
          showTag={false}
        />
      </View>

      {/* Search History Section */}
      {searchHistory.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Search history</Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <SvgXml xml={searchTrashIcon}  />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {searchHistory.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => handleHistoryItemPress(item)}>
                <Text style={styles.tagText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Recommendations Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <View style={styles.tagsContainer}>
          {recommendations.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tag}
              onPress={() => handleRecommendationPress(item)}>
              <Text style={styles.tagText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Discover Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discover</Text>
        <View style={styles.productsContainer}>
          <FlatList
            data={discoverProducts}
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
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={Separator}
            contentContainerStyle={styles.flatListContent}
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
  },
  scrollViewContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[8],
  },
  heading: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[4],
  },
  searchBarContainer: {
    marginTop: Spacing[2],
    marginBottom: Spacing[4],
  },
  section: {
    marginBottom: Spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[4],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1],
  },
  tag: {
    backgroundColor: '#F4F4F4',
    borderRadius: r(8),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    marginBottom: Spacing[2],
  },
  tagText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mmedium,
    color: '#000000',
  },
  productsContainer: {
    marginTop: Spacing[2],
  },
  flatListContent: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  separator: {
    width: Spacing[3],
  },
  resultsContainer: {
    marginTop: Spacing[2],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing[3],
  },
  rowSeparator: {
    height: Spacing[3],
  },
  productsGrid: {
    paddingBottom: Spacing[4],
  },
  emptyContainer: {
    paddingVertical: Spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
  },
});

export default SearchTab;
