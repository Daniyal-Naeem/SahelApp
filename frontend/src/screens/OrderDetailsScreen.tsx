import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {checkmarkIcon} from '../assets/svgs/checkmarkIcon';
import {clock} from '../assets/svgs/clock';
import type {OrderData} from '../components/OrderCard';

interface TrackingStep {
  status: OrderData['status'];
  title: string;
  description: string;
  date?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

const OrderDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const order: OrderData = route.params?.order;

  const GoBack = () => {
    navigation.goBack();
  };

  // Define tracking steps based on order status
  const getTrackingSteps = (): TrackingStep[] => {
    const allSteps: OrderData['status'][] = [
      'Pending',
      'Processing',
      'Shipped',
      'In Transit',
      'Out for Delivery',
      'Delivered',
    ];

    const currentIndex = allSteps.indexOf(order.status);
    const cancelled = order.status === 'Cancelled';

    return allSteps.map((step, index) => {
      const isCompleted = !cancelled && index <= currentIndex;
      const isCurrent = !cancelled && index === currentIndex;

      let description = '';
      let date = '';

      switch (step) {
        case 'Pending':
          description = 'Your order has been placed';
          date = order.orderDate || 'Jan 15, 2024';
          break;
        case 'Processing':
          description = 'We are preparing your order';
          date = 'Jan 16, 2024';
          break;
        case 'Shipped':
          description = 'Your order has been shipped';
          date = 'Jan 17, 2024';
          break;
        case 'In Transit':
          description = 'Your order is on the way';
          date = 'Jan 18, 2024';
          break;
        case 'Out for Delivery':
          description = 'Your order is out for delivery';
          date = order.estimatedDelivery || 'Jan 19, 2024';
          break;
        case 'Delivered':
          description = 'Your order has been delivered';
          date = 'Jan 20, 2024';
          break;
      }

      return {
        status: step,
        title: step,
        description,
        date,
        isCompleted,
        isCurrent,
      };
    });
  };

  const trackingSteps = getTrackingSteps();

  const renderTrackingStep = (step: TrackingStep, index: number) => {
    const isLast = index === trackingSteps.length - 1;

    return (
      <View key={index} style={styles.stepContainer}>
        <View style={styles.stepLeft}>
          <View
            style={[
              styles.stepIcon,
              step.isCompleted && styles.stepIconCompleted,
              step.isCurrent && styles.stepIconCurrent,
            ]}>
            {step.isCompleted ? (
              <SvgXml xml={checkmarkIcon} width={r(20)} height={r(20)} />
            ) : (
              <SvgXml xml={clock} width={r(20)} height={r(20)} />
            )}
          </View>
          {!isLast && (
            <View
              style={[
                styles.stepLine,
                step.isCompleted && styles.stepLineCompleted,
              ]}
            />
          )}
        </View>
        <View style={styles.stepContent}>
          <Text
            style={[
              styles.stepTitle,
              step.isCompleted && styles.stepTitleCompleted,
              step.isCurrent && styles.stepTitleCurrent,
            ]}>
            {step.title}
          </Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
          {step.date && (
            <Text style={styles.stepDate}>{step.date}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Order Details"
        onBackPress={GoBack}
        showBorder={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
              <Text style={styles.orderDate}>
                Placed on {order.orderDate || 'Jan 15, 2024'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                order.status === 'Delivered' && styles.statusBadgeDelivered,
                order.status === 'Cancelled' && styles.statusBadgeCancelled,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  order.status === 'Delivered' && styles.statusTextDelivered,
                  order.status === 'Cancelled' && styles.statusTextCancelled,
                ]}>
                {order.status}
              </Text>
            </View>
          </View>

          {order.trackingNumber && (
            <View style={styles.trackingContainer}>
              <Text style={styles.trackingLabel}>Tracking Number:</Text>
              <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
            </View>
          )}

          {order.totalAmount && (
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total Amount:</Text>
              <Text style={styles.amountValue}>${order.totalAmount.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Order Items ({order.itemCount})</Text>
          <View style={styles.itemsGrid}>
            {order.images.map((image, index) => (
              <FastImage
                key={index}
                source={{uri: image}}
                style={styles.itemImage}
                resizeMode={FastImage.resizeMode.cover}
              />
            ))}
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery Type:</Text>
            <Text style={styles.infoValue}>{order.deliveryType}</Text>
          </View>
          {order.estimatedDelivery && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Delivery:</Text>
              <Text style={styles.infoValue}>{order.estimatedDelivery}</Text>
            </View>
          )}
        </View>

        {/* Tracking Timeline */}
        <View style={styles.trackingSection}>
          <Text style={styles.sectionTitle}>Track Your Order</Text>
          <View style={styles.timelineContainer}>
            {trackingSteps.map((step, index) => renderTrackingStep(step, index))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            activeOpacity={0.7}>
            <Text style={styles.primaryButtonText}>Track Package</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing[8],
  },
  orderSummary: {
    backgroundColor: Colors.white,
    padding: Spacing[5],
    borderBottomWidth: r(1),
    borderBottomColor: Colors.gray[200] || '#E5E7EB',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[3],
  },
  orderNumber: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  orderDate: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: r(12),
    backgroundColor: Colors.gray[100] || '#F3F4F6',
  },
  statusBadgeDelivered: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  statusTextDelivered: {
    color: '#059669',
  },
  statusTextCancelled: {
    color: Colors.red[600] || '#DC2626',
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing[2],
    paddingTop: Spacing[3],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
  },
  trackingLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.gray[600] || '#4B5563',
    marginRight: Spacing[2],
  },
  trackingNumber: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[2],
    paddingTop: Spacing[3],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
  },
  amountLabel: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mmedium,
    color: Colors.gray[600] || '#4B5563',
  },
  amountValue: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  itemsSection: {
    padding: Spacing[5],
    borderBottomWidth: r(1),
    borderBottomColor: Colors.gray[200] || '#E5E7EB',
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[4],
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  itemImage: {
    width: r(80),
    height: r(80),
    borderRadius: r(8),
    backgroundColor: Colors.gray[100] || '#F3F4F6',
  },
  deliverySection: {
    padding: Spacing[5],
    borderBottomWidth: r(1),
    borderBottomColor: Colors.gray[200] || '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  infoLabel: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mmedium,
    color: Colors.gray[600] || '#4B5563',
  },
  infoValue: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  trackingSection: {
    padding: Spacing[5],
  },
  timelineContainer: {
    marginTop: Spacing[2],
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: Spacing[4],
  },
  stepLeft: {
    width: r(40),
    alignItems: 'center',
    marginRight: Spacing[3],
  },
  stepIcon: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
    backgroundColor: Colors.gray[200] || '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconCompleted: {
    backgroundColor: Colors.primary,
  },
  stepIconCurrent: {
    backgroundColor: Colors.primary,
    borderWidth: r(3),
    borderColor: '#FFE5E8',
  },
  stepLine: {
    width: r(2),
    flex: 1,
    backgroundColor: Colors.gray[200] || '#E5E7EB',
    marginTop: Spacing[1],
    minHeight: r(40),
  },
  stepLineCompleted: {
    backgroundColor: Colors.primary,
  },
  stepContent: {
    flex: 1,
    paddingTop: r(4),
  },
  stepTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.gray[400] || '#9CA3AF',
    marginBottom: Spacing[1],
  },
  stepTitleCompleted: {
    color: Colors.black[100],
  },
  stepTitleCurrent: {
    color: Colors.primary,
    fontFamily: FontFamilies.mbold,
  },
  stepDescription: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
    marginBottom: Spacing[1],
  },
  stepDate: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[400] || '#9CA3AF',
  },
  actionsContainer: {
    padding: Spacing[5],
    gap: Spacing[3],
  },
  actionButton: {
    paddingVertical: Spacing[4],
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: r(1),
    borderColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.white,
  },
  secondaryButtonText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
  },
});

export default OrderDetailsScreen;

