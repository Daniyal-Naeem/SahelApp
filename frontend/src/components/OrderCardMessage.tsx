import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import type {OrderData} from './OrderCard';

interface OrderCardMessageProps {
  order: OrderData;
}

const OrderCardMessage: React.FC<OrderCardMessageProps> = ({order}) => {
  return (
    <View style={styles.orderCardMessageContainer}>
      <View style={styles.orderCardMessage}>
        <View style={styles.orderCardMessageImagesContainer}>
          {order.images.slice(0, 4).map((image, imgIndex) => (
            <FastImage
              key={imgIndex}
              source={{uri: image}}
              style={[
                styles.orderCardMessageImage,
                (imgIndex === 1 || imgIndex === 3) &&
                  styles.orderCardMessageImageRight,
                (imgIndex === 2 || imgIndex === 3) &&
                  styles.orderCardMessageImageBottom,
              ]}
              resizeMode={FastImage.resizeMode.cover}
            />
          ))}
        </View>

        <View style={styles.orderCardMessageDetails}>
          <Text style={styles.orderCardMessageNumber}>
            Order #{order.orderNumber}
          </Text>
          <Text style={styles.orderCardMessageDelivery}>
            {order.deliveryType}
          </Text>
          <Text style={styles.orderCardMessageStatus}>{order.status}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderCardMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: Spacing[3],
    paddingRight: Spacing[5],
  },
  orderCardMessage: {
    backgroundColor: Colors.white,
    borderRadius: r(10),
    borderWidth: r(1),
    borderColor: '#FFB6C1',
    padding: Spacing[3],
    flexDirection: 'row',
    maxWidth: '85%',
    minHeight: r(100),
  },
  orderCardMessageImagesContainer: {
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
  orderCardMessageImage: {
    width: r(34),
    height: r(34),
    borderRadius: r(6),
  },
  orderCardMessageImageRight: {
    marginRight: 0,
  },
  orderCardMessageImageBottom: {
    marginBottom: 0,
  },
  orderCardMessageDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderCardMessageNumber: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  orderCardMessageDelivery: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: '#202020',
    marginBottom: Spacing[2],
  },
  orderCardMessageStatus: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
});

export default OrderCardMessage;

