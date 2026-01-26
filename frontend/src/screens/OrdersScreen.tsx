import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {CustomHeader, OrderCard} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {orders} from '../constants/data';
import type {OrderData} from '../components/OrderCard';
import {protectScreen} from '../utils/authGuard';
import {getUserOrders, type Order} from '../services/orderService';

const OrdersScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [ordersList, setOrdersList] = useState<OrderData[]>([]);

  // Map backend Order to frontend OrderData format
  const mapOrderToOrderData = (order: Order): OrderData => {
    return {
      id: order._id,
      orderNumber: order._id.substring(0, 8).toUpperCase(),
      status: order.status,
      total: order.total,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      images: order.items.map(item => {
        if (typeof item.product === 'object' && item.product?.images) {
          return item.product.images[0] || '';
        }
        return '';
      }).filter(Boolean),
      orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
      estimatedDelivery: order.estimatedDelivery,
      deliveryType: order.shippingAddress?.city || 'Standard',
    };
  };

  const GoBack = () => {
    navigation.goBack();
  };

  const handleOrderPress = (order: OrderData) => {
    navigation.navigate('OrderDetails', {order});
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const ordersData = await getUserOrders();
      // Map backend orders to frontend OrderData format
      const mappedOrders = ordersData.map(mapOrderToOrderData);
      setOrdersList(mappedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to empty array on error
      setOrdersList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Protect screen - require authentication
  useFocusEffect(
    React.useCallback(() => {
      protectScreen(
        async () => {
          // User is authenticated, load orders
          await loadOrders();
        },
        navigation,
        {
          redirectTo: 'login',
          actionType: 'access_orders',
          actionData: { screen: 'Orders' },
        }
      );
    }, [navigation])
  );

  const filterOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered'];

  const filteredOrders =
    selectedFilter === 'All'
      ? ordersList
      : ordersList.filter(order => order.status === selectedFilter);

  const renderOrderItem = ({item}: {item: OrderData}) => (
    <View style={styles.orderCardWrapper}>
      <OrderCard
        order={item}
        isSelected={false}
        onSelect={() => handleOrderPress(item)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title="My Orders"
        onBackPress={GoBack}
        showBorder={true}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}>
          {filterOptions.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubtext}>
            {selectedFilter === 'All'
              ? 'You haven\'t placed any orders yet'
              : `No ${selectedFilter.toLowerCase()} orders`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  filterContainer: {
    borderBottomWidth: r(1),
    borderBottomColor: Colors.gray[200] || '#E5E7EB',
    paddingVertical: Spacing[3],
  },
  filterScrollContent: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[2],
  },
  filterButton: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: r(20),
    backgroundColor: Colors.gray[100] || '#F3F4F6',
    marginRight: Spacing[2],
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.gray[600] || '#4B5563',
  },
  filterTextActive: {
    color: Colors.white,
    fontFamily: FontFamilies.msemibold,
  },
  listContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  orderCardWrapper: {
    marginBottom: Spacing[3],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
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
    color: Colors.gray[500] || '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[10],
  },
});

export default OrdersScreen;

