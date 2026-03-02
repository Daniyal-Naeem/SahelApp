import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {checkmarkIcon} from '../assets/svgs/checkmarkIcon';
import {clock} from '../assets/svgs/clock';
import type {OrderData} from '../components/OrderCard';
import {
  getOrderById,
  cancelOrder,
  mapBackendStatusToDisplay,
  formatOrderDate,
  getEstimatedDelivery,
  type Order,
  type OrderStatus,
} from '../services/orderService';
import {useToast} from '../hooks/useToast';

interface TrackingStep {
  status: OrderData['status'];
  title: string;
  description: string;
  date?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  deliveryPerson?: {
    name: string;
    phone: string;
    vehicleNumber?: string;
  };
  location?: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

const OrderDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const toast = useToast();
  const orderId = route.params?.orderId || route.params?.order?.id;
  const initialOrder: OrderData | undefined = route.params?.order;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const GoBack = () => {
    navigation.goBack();
  };

  // Load order from API
  const loadOrder = async (showLoading = true) => {
    if (!orderId) {
      // If no orderId, use initial order data if available
      if (initialOrder) {
        // Convert OrderData to Order format (simplified)
        return;
      }
      return;
    }

    if (showLoading) setIsLoading(true);
    try {
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
    } catch (error: any) {
      console.error('Error loading order:', error);
      toast.showToast(error.response?.data?.error || 'Failed to load order');
      // Fallback to initial order if API fails
      if (initialOrder) {
        // Keep using initial order data
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load order on mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadOrder();
    }, [orderId])
  );

  // Refresh order data
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrder(false);
  };

  // Handle cancel order
  const handleCancelOrder = () => {
    if (!order) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await cancelOrder(order._id);
              toast.showToast('Order cancelled successfully');
              // Reload order to get updated status
              await loadOrder(false);
            } catch (error: any) {
              toast.showToast(
                error.response?.data?.error || 'Failed to cancel order'
              );
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  // Convert Order to OrderData format for display
  const getDisplayOrder = (): OrderData | null => {
    if (!order) {
      if (initialOrder) return initialOrder;
      return null;
    }

    const displayStatus = mapBackendStatusToDisplay(order.status);
    const orderDate = formatOrderDate(order.createdAt);
    const estimatedDelivery = order.deliveredAt 
      ? formatOrderDate(order.deliveredAt)
      : getEstimatedDelivery(order.createdAt);

    return {
      id: order._id,
      orderNumber: order.orderNumber || order._id.substring(0, 8).toUpperCase(),
      status: displayStatus,
      total: order.total,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      images: order.items.map(item => {
        if (typeof item.product === 'object' && item.product?.image) {
          return Array.isArray(item.product.image) 
            ? item.product.image[0] 
            : item.product.image;
        }
        return '';
      }).filter(Boolean),
      orderDate,
      estimatedDelivery,
      trackingNumber: order.trackingNumber,
      totalAmount: order.total,
      deliveryType: order.shippingAddress?.city || 'Standard',
    };
  };

  // Define tracking steps based on order status
  const getTrackingSteps = (): TrackingStep[] => {
    const orderDisplay = getDisplayOrder();
    return getTrackingStepsArray(orderDisplay, order);
  };

  // Separate function for tracking steps to avoid recursion
  const getTrackingStepsArray = (orderDisplay: any, order: Order | null): TrackingStep[] => {
    const displayOrder = getDisplayOrder();
    if (!displayOrder) return [];

    const allSteps: OrderStatus[] = [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Delivered',
    ];

    const currentStatus = displayOrder.status;
    const currentIndex = allSteps.indexOf(currentStatus);
    const cancelled = currentStatus === 'Cancelled';

    return allSteps.map((step, index) => {
      const isCompleted = !cancelled && index <= currentIndex;
      const isCurrent = !cancelled && index === currentIndex;

      let description = '';
      let date = '';

      switch (step) {
        case 'Pending':
          description = 'Your order has been placed';
          date = displayOrder.orderDate || formatOrderDate(order?.createdAt);
          break;
        case 'Confirmed':
          description = 'Your order has been confirmed';
          date = formatOrderDate(order?.createdAt);
          break;
        case 'Processing':
          description = 'We are preparing your order';
          date = formatOrderDate(order?.createdAt);
          break;
        case 'Shipped':
          description = 'Your order has been shipped';
          date = order?.shippedAt ? formatOrderDate(order.shippedAt) : '';
          break;
        case 'Delivered':
          description = 'Your order has been delivered';
          date = order?.deliveredAt ? formatOrderDate(order.deliveredAt) : '';
          break;
      }

      // Enhanced tracking with delivery info
      const enhancedStep: TrackingStep = {
        status: step,
        title: step,
        description,
        date,
        isCompleted,
        isCurrent,
      };

      // Add delivery person info for current step
      if (step === 'Shipped' && order?.deliveryPerson) {
        enhancedStep.deliveryPerson = order.deliveryPerson;
      }

      // Add location info if available
      if (order?.currentLocation) {
        enhancedStep.location = {
          address: order.currentLocation.address,
          coordinates: order.currentLocation.coordinates,
        };
      }

      return enhancedStep;
    });
  };

  const displayOrder = getDisplayOrder();
  const trackingSteps = getTrackingStepsArray(displayOrder, order);

  // Show loading state
  if (isLoading && !order && !initialOrder) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title="Order Details"
          onBackPress={GoBack}
          showBorder={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (!displayOrder) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title="Order Details"
          onBackPress={GoBack}
          showBorder={true}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </View>
    );
  }

  const canCancel = order && ['pending', 'confirmed'].includes(order.status);

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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #{displayOrder.orderNumber}</Text>
              <Text style={styles.orderDate}>
                Placed on {displayOrder.orderDate}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                displayOrder.status === 'Delivered' && styles.statusBadgeDelivered,
                displayOrder.status === 'Cancelled' && styles.statusBadgeCancelled,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  displayOrder.status === 'Delivered' && styles.statusTextDelivered,
                  displayOrder.status === 'Cancelled' && styles.statusTextCancelled,
                ]}>
                {displayOrder.status}
              </Text>
            </View>
          </View>

          {displayOrder.trackingNumber && (
            <View style={styles.trackingContainer}>
              <Text style={styles.trackingLabel}>Tracking Number:</Text>
              <Text style={styles.trackingNumber}>{displayOrder.trackingNumber}</Text>
            </View>
          )}

          {displayOrder.totalAmount && (
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total Amount:</Text>
              <Text style={styles.amountValue}>SAR {displayOrder.totalAmount.toFixed(2)}</Text>
            </View>
          )}

          {order && (
            <>
              {order.subtotal && (
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Subtotal:</Text>
                  <Text style={styles.amountValue}>SAR {order.subtotal.toFixed(2)}</Text>
                </View>
              )}
              {order.shippingCost !== undefined && order.shippingCost > 0 && (
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Shipping:</Text>
                  <Text style={styles.amountValue}>SAR {order.shippingCost.toFixed(2)}</Text>
                </View>
              )}
              {order.discount && order.discount > 0 && (
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Discount:</Text>
                  <Text style={styles.amountValue}>- SAR {order.discount.toFixed(2)}</Text>
                </View>
              )}
              {order.creditUsed && order.creditUsed > 0 && (
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Credit Used:</Text>
                  <Text style={styles.amountValue}>- SAR {order.creditUsed.toFixed(2)}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Order Items ({displayOrder.itemCount})</Text>
          <View style={styles.itemsGrid}>
            {displayOrder.images.length > 0 ? (
              displayOrder.images.map((image, index) => (
                <FastImage
                  key={index}
                  source={{uri: image}}
                  style={styles.itemImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No images available</Text>
            )}
          </View>
        </View>

        {/* Delivery Info */}
        {order?.shippingAddress && (
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>
                {order.shippingAddress.street}, {order.shippingAddress.city}
                {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                {order.shippingAddress.zipCode && ` ${order.shippingAddress.zipCode}`}
              </Text>
            </View>
            {order.shippingAddress.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{order.shippingAddress.phone}</Text>
              </View>
            )}
            {displayOrder.estimatedDelivery && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Delivery:</Text>
                <Text style={styles.infoValue}>{displayOrder.estimatedDelivery}</Text>
              </View>
            )}
          </View>
        )}

        {/* Tracking Timeline */}
        <View style={styles.trackingSection}>
          <Text style={styles.sectionTitle}>Track Your Order</Text>
          <DeliveryTimeline
            steps={trackingSteps.map(step => ({
              ...step,
              deliveryPerson: step.isCurrent && order?.deliveryPerson ? order.deliveryPerson : undefined,
              location: order?.currentLocation ? {
                address: order.currentLocation.address,
                coordinates: order.currentLocation.coordinates,
              } : undefined,
            }))}
            showDeliveryPerson={true}
            showLocation={true}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {displayOrder.trackingNumber && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              activeOpacity={0.7}
              onPress={async () => {
                // Copy tracking number to clipboard and show toast
                try {
                  // For now, just show the tracking number since clipboard package might not be installed
                  toast.showToast(`Tracking: ${displayOrder.trackingNumber}`);
                } catch (error) {
                  toast.showToast(`Tracking: ${displayOrder.trackingNumber}`);
                }
              }}>
              <Text style={styles.primaryButtonText}>Track Package</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              activeOpacity={0.7}
              onPress={handleCancelOrder}
              disabled={isCancelling}>
              {isCancelling ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Navigate to support/chat screen
              navigation.navigate('Support');
            }}>
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
  cancelButton: {
    backgroundColor: Colors.red[600] || '#DC2626',
  },
  cancelButtonText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[12],
  },
  loadingText: {
    marginTop: Spacing[4],
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[12],
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[1],
  },
});

export default OrderDetailsScreen;

