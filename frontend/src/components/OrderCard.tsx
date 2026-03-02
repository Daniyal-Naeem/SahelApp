import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import CheckRedIcon from '../assets/svgs/checkRed.svg';

export interface OrderData {
  id: string;
  orderNumber: string;
  deliveryType: string;
  itemCount: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  images: string[];
  orderDate?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  totalAmount?: number;
}

interface OrderCardProps {
  order: OrderData;
  isSelected: boolean;
  onSelect: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({order, isSelected, onSelect}) => {
  return (
    <TouchableOpacity
      style={[styles.orderCard, isSelected && styles.orderCardSelected]}
      onPress={() => onSelect(order.id)}
      activeOpacity={0.7}>
      <View style={styles.orderImagesContainer}>
        {order.images.slice(0, 4).map((image, index) => (
          <FastImage
            key={index}
            source={{uri: image}}
            style={[
              styles.orderImage,
              (index === 1 || index === 3) && styles.orderImageRight,
              (index === 2 || index === 3) && styles.orderImageBottom,
            ]}
            resizeMode={FastImage.resizeMode.cover}
          />
        ))}
      </View>

      <View style={styles.orderDetailsContainer}>
        <View style={styles.orderHeaderRow}>
          <Text style={styles.orderNumber} numberOfLines={1}>
            Order #{order.orderNumber}
          </Text>
          <View style={styles.itemCountContainer}>
            <Text style={styles.itemCount}>{order.itemCount} items</Text>
          </View>
        </View>
        <Text style={styles.deliveryType}>{order.deliveryType}</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusContainer}>
          
            <Text style={styles.orderStatus}>{order.status}</Text>
            {order.status === 'Delivered' && (
              <CheckRedIcon width={r(26)} height={r(26)} />
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.selectButton,
              isSelected && styles.selectButtonSelected,
            ]}
            onPress={e => {
              e.stopPropagation();
              onSelect(order.id);
            }}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.selectButtonText,
                isSelected && styles.selectButtonTextSelected,
              ]}>
              {isSelected ? 'Selected' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    flexDirection: 'row',
    borderRadius: r(10),
    borderWidth: r(1),
    borderColor: Colors.gray[300] || '#D1D5DB',
    padding: Spacing[3],
    marginBottom: Spacing[3],
    minHeight: r(120),
    alignItems: 'center',
    width: '100%',
  },
  orderCardSelected: {
    borderWidth: r(1),
    borderColor: Colors.red[500] || '#EF4444',
  },
  orderImagesContainer: {
    width: r(80),
    height: r(80),
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginRight: Spacing[3],
    backgroundColor: Colors.white,
    borderRadius: r(10),
    padding: r(4),
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  orderImage: {
    width: r(34),
    height: r(34),
    borderRadius: r(6),
  },
  orderImageRight: {
    marginRight: 0,
  },
  orderImageBottom: {
    marginBottom: 0,
  },
  orderDetailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: r(80),
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[1],
  },
  orderNumber: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    flex: 1,
    marginRight: Spacing[2],
  },
  itemCountContainer: {
    backgroundColor: Colors.gray[100] || '#F3F4F6',
    paddingHorizontal: Spacing[2],
    paddingVertical: r(2),
    borderRadius: r(12),
  },
  itemCount: {
    fontSize: FontSizes.xs || r(12),
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  deliveryType: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: '#202020',
    marginBottom: Spacing[2],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    justifyContent: 'center',

  },
  orderStatus: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  checkmarkIconContainer: {
    marginRight: Spacing[1],
    width: r(16),
    height: r(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButton: {
    paddingVertical: r(6),
    paddingHorizontal: Spacing[3],
    borderRadius: r(6),
    borderWidth: r(1),
    borderColor: Colors.red[500] || '#EF4444',
    backgroundColor: Colors.white,
    minWidth: r(70),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonSelected: {
    backgroundColor: Colors.red[500] || '#EF4444',
  },
  selectButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.red[500] || '#EF4444',
  },
  selectButtonTextSelected: {
    color: Colors.white,
    fontFamily: FontFamilies.mmedium,
    fontSize: FontSizes.sm,
  },
});

export default OrderCard;
