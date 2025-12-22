import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {CustomHeader, OrderCard} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {orders} from '../constants/data';
import type {OrderData} from '../components/OrderCard';

const OrdersScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const GoBack = () => {
    navigation.goBack();
  };

  const handleOrderPress = (order: OrderData) => {
    navigation.navigate('OrderDetails', {order});
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
      {filteredOrders.length > 0 ? (
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
    backgroundColor: Colors.primary || '#F83758',
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
});

export default OrdersScreen;

