import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  getDealById,
  getDealsByType,
  getAllDeals,
  formatDealDiscount,
  getDealTypeLabel,
  type Deal,
} from '../services/dealService';
import {getAllProducts, type Product} from '../services/productService';
import {ProductItem} from '../components';
import {getProductImage} from '../utils/productHelpers';
import DealCountdown from '../components/DealCountdown';
import {useToast} from '../hooks/useToast';

const DealDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const toast = useToast();
  const dealId = route.params?.dealId;
  const dealType = route.params?.dealType;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDealType, setSelectedDealType] = useState<string | null>(dealType || null);

  const GoBack = () => {
    navigation.goBack();
  };

  // Load deal details if dealId provided
  const loadDealDetails = async () => {
    if (!dealId) return;

    setIsLoading(true);
    try {
      const dealData = await getDealById(dealId);
      setDeal(dealData);

      // Load products for this deal if product IDs are available
      if (dealData?.products && dealData.products.length > 0) {
        const productPromises = dealData.products.map((productId: string) =>
          getAllProducts().then(products =>
            products.find((p: any) => p._id === productId)
          )
        );
        const dealProducts = (await Promise.all(productPromises)).filter(Boolean);
        setProducts(dealProducts as Product[]);
      }
    } catch (error: any) {
      console.error('Error loading deal details:', error);
      toast.showToast('Failed to load deal details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load deals list if dealType provided or showing all deals
  const loadDealsList = async () => {
    setIsLoading(true);
    try {
      let dealsData: Deal[] = [];
      if (selectedDealType) {
        dealsData = await getDealsByType(selectedDealType as any);
      } else {
        dealsData = await getAllDeals();
      }
      setDeals(dealsData);
    } catch (error: any) {
      console.error('Error loading deals:', error);
      toast.showToast('Failed to load deals', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (dealId) {
        loadDealDetails();
      } else {
        loadDealsList();
      }
    }, [dealId, selectedDealType])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (dealId) {
      loadDealDetails().finally(() => setIsRefreshing(false));
    } else {
      loadDealsList().finally(() => setIsRefreshing(false));
    }
  };

  // If showing single deal details
  if (dealId && deal) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title={deal.title}
          onBackPress={GoBack}
          showBorder={true}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
              />
            }>
            {/* Deal Info Card */}
            <View style={styles.dealCard}>
              <View style={styles.dealHeader}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {getDealTypeLabel(deal.type)}
                  </Text>
                </View>
                <Text style={styles.dealTitle}>{deal.title}</Text>
                {deal.description && (
                  <Text style={styles.dealDescription}>{deal.description}</Text>
                )}
                <View style={styles.discountContainer}>
                  <Text style={styles.discountText}>
                    {formatDealDiscount(deal)}
                  </Text>
                </View>
              </View>

              {/* Countdown */}
              <View style={styles.countdownSection}>
                <Text style={styles.countdownLabel}>Time Remaining</Text>
                <DealCountdown endDate={deal.endDate} />
              </View>

              {/* Deal Details */}
              <View style={styles.detailsSection}>
                {deal.minPurchase && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Minimum Purchase:</Text>
                    <Text style={styles.detailValue}>
                      SAR {deal.minPurchase}
                    </Text>
                  </View>
                )}
                {deal.maxDiscount && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Max Discount:</Text>
                    <Text style={styles.detailValue}>
                      SAR {deal.maxDiscount}
                    </Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Valid Until:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(deal.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Products in Deal */}
            {products.length > 0 && (
              <View style={styles.productsSection}>
                <Text style={styles.sectionTitle}>Products in This Deal</Text>
                <FlatList
                  data={products}
                  renderItem={({item}) => (
                    <ProductItem
                      image={getProductImage(item as any)}
                      title={(item as any).title || (item as any).name}
                      description={(item as any).description}
                      price={(item as any).price}
                      priceBeforeDeal={(item as any).priceBeforeDeal}
                      priceOff={(item as any).priceOff}
                      stars={(item as any).stars || (item as any).rating}
                      numberOfReview={(item as any).numberOfReview}
                      itemDetails={item as any}
                    />
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => (item as any)._id}
                />
              </View>
            )}
          </ScrollView>
        )}
      </View>
    );
  }

  // If showing deals list
  return (
    <View style={styles.container}>
      <CustomHeader
        title={selectedDealType ? getDealTypeLabel(selectedDealType) : 'All Deals'}
        onBackPress={GoBack}
        showBorder={true}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
            />
          }>
          {/* Deal Type Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  !selectedDealType && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedDealType(null)}>
                <Text
                  style={[
                    styles.filterText,
                    !selectedDealType && styles.filterTextActive,
                  ]}>
                  All
                </Text>
              </TouchableOpacity>
              {['daily', 'weekly', 'monthly', 'flash'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterButton,
                    selectedDealType === type && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedDealType(type)}>
                  <Text
                    style={[
                      styles.filterText,
                      selectedDealType === type && styles.filterTextActive,
                    ]}>
                    {getDealTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Deals List */}
          {deals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No deals available</Text>
            </View>
          ) : (
            deals.map(item => (
              <TouchableOpacity
                key={item._id}
                onPress={() => navigation.navigate('DealDetails', {dealId: item._id})}>
                <View style={styles.dealCard}>
                  <View style={styles.dealHeader}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {getDealTypeLabel(item.type)}
                      </Text>
                    </View>
                    <Text style={styles.dealTitle}>{item.title}</Text>
                    {item.description && (
                      <Text style={styles.dealDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                    <View style={styles.discountContainer}>
                      <Text style={styles.discountText}>
                        {formatDealDiscount(item)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.countdownSection}>
                    <DealCountdown endDate={item.endDate} compact={true} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background[200],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[5],
  },
  dealCard: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[5],
    marginBottom: Spacing[4],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealHeader: {
    marginBottom: Spacing[4],
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: r(12),
    marginBottom: Spacing[2],
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
  },
  dealTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[2],
  },
  dealDescription: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    marginBottom: Spacing[3],
    lineHeight: FontSizes.base * 1.5,
  },
  discountContainer: {
    marginBottom: Spacing[3],
  },
  discountText: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
    color: Colors.primary,
  },
  countdownSection: {
    paddingTop: Spacing[4],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200],
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    marginBottom: Spacing[2],
  },
  detailsSection: {
    marginTop: Spacing[4],
    paddingTop: Spacing[4],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
  },
  detailLabel: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
  },
  detailValue: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  productsSection: {
    marginTop: Spacing[5],
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[4],
  },
  filtersContainer: {
    marginBottom: Spacing[5],
  },
  filtersContent: {
    gap: Spacing[3],
  },
  filterButton: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: r(20),
    backgroundColor: Colors.white,
    borderWidth: r(1.5),
    borderColor: Colors.gray[300],
    marginRight: Spacing[2],
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    fontFamily: FontFamilies.msemibold,
  },
  filterTextActive: {
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[10],
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.gray[500],
    fontFamily: FontFamilies.mregular,
  },
});

export default DealDetailsScreen;
