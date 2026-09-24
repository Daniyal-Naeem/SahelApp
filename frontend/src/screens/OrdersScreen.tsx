import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {CustomHeader, OrderCard} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import type {OrderData} from '../components/OrderCard';
import {getMyOrders} from '../services/orderService';
import {useAppSelector} from '../store';

const statusMap = (status?: string): OrderData['status'] => {
  const s = (status || 'pending').toLowerCase();
  if (s === 'confirmed' || s === 'processing') return 'Processing';
  if (s === 'shipped') return 'Shipped';
  if (s === 'delivered') return 'Delivered';
  if (s === 'cancelled') return 'Cancelled';
  if (s === 'out_for_delivery') return 'Out for Delivery';
  return 'Pending';
};

const mapOrder = (order: any): OrderData => {
  const images = (order.items || [])
    .flatMap((item: any) => {
      const imgs = item.product?.image;
      if (Array.isArray(imgs)) return imgs;
      return imgs ? [imgs] : [];
    })
    .filter(Boolean);

  return {
    id: String(order._id),
    orderNumber: order.orderNumber || String(order._id).slice(-6),
    deliveryType: order.shippingAddress?.city
      ? `Ship to ${order.shippingAddress.city}`
      : 'Standard Delivery',
    itemCount: (order.items || []).reduce(
      (sum: number, i: any) => sum + (i.quantity || 1),
      0,
    ),
    status: statusMap(order.status),
    images: images.length ? images : ['https://via.placeholder.com/100'],
    orderDate: order.createdAt,
    estimatedDelivery: order.estimatedDelivery,
    trackingNumber: order.trackingNumber,
    totalAmount: order.totalAmount || order.total,
  };
};

const OrdersScreen = () => {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      navigation.navigate('Login');
      return;
    }
    setLoading(true);
    try {
      const data = await getMyOrders();
      const list = Array.isArray(data) ? data : data?.orders || [];
      setRawOrders(list);
      setOrders(list.map(mapOrder));
    } catch (error: any) {
      Alert.alert(
        'Orders',
        error?.response?.data?.error || 'Could not load orders',
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const GoBack = () => navigation.goBack();

  const handleOrderPress = (order: OrderData) => {
    const full = rawOrders.find(o => String(o._id) === order.id);
    navigation.navigate('OrderDetails', {order: full || order});
  };

  const filterOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered'];

  const filteredOrders =
    selectedFilter === 'All'
      ? orders
      : orders.filter(order => order.status === selectedFilter);

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
      <CustomHeader title="My Orders" onBackPress={GoBack} showBorder />

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

      {loading ? (
        <ActivityIndicator style={{marginTop: 40}} color={Colors.primary} />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No orders yet</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.white},
  filterContainer: {
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  filterScrollContent: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[2],
  },
  filterButton: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: r(20),
    backgroundColor: Colors.gray[100],
    marginRight: Spacing[2],
  },
  filterButtonActive: {backgroundColor: Colors.primary},
  filterText: {
    fontFamily: FontFamilies.mmedium,
    color: Colors.gray[600],
    fontSize: FontSizes.sm,
  },
  filterTextActive: {color: Colors.white},
  list: {padding: Spacing[5], paddingBottom: Spacing[12]},
  orderCardWrapper: {marginBottom: Spacing[4]},
  empty: {
    textAlign: 'center',
    marginTop: Spacing[10],
    color: Colors.gray[500],
    fontFamily: FontFamilies.mregular,
  },
});

export default OrdersScreen;
