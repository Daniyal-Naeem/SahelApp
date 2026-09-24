import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteStackParamList} from '../../App';
import {ItemDetails} from '../constants/types';
import {CustomHeader, CustomButton} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {dropdownArrow} from '../assets/svgs/dropdownArrow';
import { coupon } from '../assets/svgs/coupon';

type ScreenRouteProps = RouteProp<RouteStackParamList, 'PlaceOrder'>;
type ScreenNavigationProps = StackNavigationProp<
  RouteStackParamList,
  'PlaceOrder'
>;

const PlaceOrder = () => {
  const navigation = useNavigation<ScreenNavigationProps>();
  const route = useRoute<ScreenRouteProps>();
  const itemDetails: ItemDetails | undefined = route.params?.itemDetails;

  const [selectedSize, setSelectedSize] = useState('Medium');
  const [selectedQty, setSelectedQty] = useState('1');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showQtyModal, setShowQtyModal] = useState(false);

  const sizes = ['Small', 'Medium', 'Large', 'XL'];
  const quantities = ['1', '2', '3', '4', '5'];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleProceedToPayment = () => {
    navigation.navigate('Payment', {itemDetails: itemDetails!});
  };

  const handleViewDetails = () => {
  };

  const handleApplyCoupon = () => {
  };

  const handleKnowMore = () => {
  };

  const handleEMIDetails = () => {
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const currency = (itemDetails as any)?.currency || 'SAR';
  const orderAmount = itemDetails?.price || 80;
  const deliveryFee = 0; // Free delivery
  const orderTotal = orderAmount + deliveryFee;

  // Calculate delivery date (10 May 2025 as per design)
  const deliveryDate = '10 May 2025';

  const productImage = itemDetails?.image?.[0] || '';
  const productTitle = itemDetails?.title || 'Product';
  const rawVendor = (itemDetails as any)?.vendor;
  const productVendor =
    typeof rawVendor === 'string'
      ? rawVendor
      : rawVendor?.businessName || rawVendor?.name || '';

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Checkout"
        onBackPress={handleGoBack}
        showBorder={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {/* Product Summary */}
        <View style={styles.productSection}>
          <FastImage
            source={{uri: productImage}}
            style={styles.productImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.productDetails}>
            <Text style={styles.categoryTitle}>Women's Casual Wear</Text>
            <Text style={styles.productTitle}>{productTitle}</Text>
            {productVendor && (
              <View style={styles.vendorContainer}>
                <Text style={styles.vendorPrefix}>by </Text>
                <Text style={styles.vendorName}>{productVendor}</Text>
              </View>
            )}

            <View style={styles.dropdownsContainer}>
              <TouchableOpacity
                style={[styles.dropdown, styles.sizeDropdown]}
                onPress={() => setShowSizeModal(true)}>
                <View style={[styles.dropdownContent, styles.sizeDropdownContent]}>
                  <Text style={styles.dropdownLabel}>Size</Text>
                  <View style={styles.dropdownValueContainer}>
                    <Text style={styles.dropdownValue} >{selectedSize}</Text>
                    <View style={styles.dropdownIconContainer}>
                      <SvgXml xml={dropdownArrow} width={r(16)} height={r(16)} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dropdown, styles.qtyDropdown]}
                onPress={() => setShowQtyModal(true)}>
                <View style={styles.dropdownContent}>
                  <Text style={styles.dropdownLabel}>Qty</Text>
                  <View style={styles.dropdownValueContainer}>
                    <Text style={styles.dropdownValue} numberOfLines={1} ellipsizeMode="tail">{selectedQty}</Text>
                    <View style={styles.dropdownIconContainer}>
                      <SvgXml xml={dropdownArrow} width={r(16)} height={r(16)} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.deliveryText}>
              Delivery by: <Text style={styles.deliveryDate}>{deliveryDate}</Text>
            </Text>
          </View>
        </View>

        <View style={{ marginVertical: Spacing[3]}} />

        {/* Coupon Section */}
        <TouchableOpacity
          style={styles.couponSection}
          onPress={handleApplyCoupon}>
          <View style={styles.couponIcon}>
            <SvgXml xml={coupon}  />
          </View>
          <Text style={styles.couponText}>Apply Coupons</Text>
          <Text style={styles.selectText}>Select</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Order Payment Details */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Order Payment Details</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Order Amounts</Text>
            <Text style={styles.paymentValue}>
              {currency} {formatNumber(orderAmount)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <View style={styles.paymentLabelContainer}>
              <Text style={styles.paymentLabel}>Convenience</Text>
              <TouchableOpacity onPress={handleKnowMore}>
                <Text style={styles.linkText}>Know More</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleApplyCoupon}>
              <Text style={styles.linkText}>Apply Coupon</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Delivery Fee</Text>
            <Text style={styles.freeText}>Free</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Order Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalTitleRow}>
            <Text style={styles.totalSectionTitle}>Order Total</Text>
            <Text style={styles.paymentValue}>
              {currency} {formatNumber(orderTotal)}
            </Text>
          </View>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>EMI Available</Text>
            <TouchableOpacity onPress={handleEMIDetails}>
              <Text style={styles.linkText}>Details</Text>
            </TouchableOpacity>
          </View>

      
        </View>
        <View style={styles.divider} />
      </ScrollView>

      {/* Bottom Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerAmount}>
            {currency} {formatNumber(orderTotal)}
          </Text>
          <TouchableOpacity onPress={handleViewDetails}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
        <CustomButton
          title="Proceed to Payment"
          handlePress={handleProceedToPayment}
          containerStyle={styles.proceedButton}
          textStyle={styles.proceedButtonText}
        />
      </View>

      {/* Size Dropdown Modal */}
      <Modal
        visible={showSizeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSizeModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSizeModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Size</Text>
            <FlatList
              data={sizes}
              keyExtractor={(item) => item}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedSize === item && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedSize(item);
                    setShowSizeModal(false);
                  }}>
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedSize === item && styles.modalItemTextSelected,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Quantity Dropdown Modal */}
      <Modal
        visible={showQtyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQtyModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowQtyModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Quantity</Text>
            <FlatList
              data={quantities}
              keyExtractor={(item) => item}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedQty === item && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedQty(item);
                    setShowQtyModal(false);
                  }}>
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedQty === item && styles.modalItemTextSelected,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  scrollViewContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  productSection: {
    flexDirection: 'row',
  },
  productImage: {
    width: r(160),
    height: r(200),
    borderRadius: r(12),
    marginRight: Spacing[4],
  },
  productDetails: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  categoryTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  productTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    marginBottom: Spacing[2],
  },
  vendorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  vendorPrefix: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#6B7280',
  },
  vendorName: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  dropdownsContainer: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  dropdown: {
    backgroundColor: Colors.primaryLight,
    borderRadius: r(8),
    borderWidth: 0,
  },
  sizeDropdown: {
    flex: 1,
  },
  qtyDropdown: {
    flex: 1,
    maxWidth: r(90),
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    minHeight: r(40),
  },
  sizeDropdownContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: Spacing[2],
    paddingRight: Spacing[3],
    paddingVertical: Spacing[2],
    minHeight: r(40),
  },
  dropdownLabel: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#6B7280',
    marginRight: Spacing[1],
    flexShrink: 0,
  },
  dropdownValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  dropdownValue: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
    flexShrink: 0,
  },
  dropdownIconContainer: {
    width: r(16),
    height: r(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing[2], // fixed spacing
    flexShrink: 0,          // icon never shrinks
  },
  deliveryText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  deliveryDate: {
    fontFamily: FontFamilies.msemibold,
    fontWeight: '600',
  },
  divider: {
    borderBottomWidth:1,
    borderBottomColor: '#E5E7EB',
    marginVertical: Spacing[3],
  },
  couponSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    overflow: 'hidden',
  },
  couponIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[2],
    overflow: 'hidden',
  },
  couponText: {
    flex: 1,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
    marginLeft: Spacing[2],
  },
  selectText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
  },
  paymentSection: {
    marginBottom: Spacing[2],
  },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
    marginBottom: Spacing[4],
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  paymentLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  paymentLabel: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  paymentValue: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  linkText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
  },
  freeText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
  },
  totalSection: {
    marginBottom: Spacing[4],
  },
  totalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  totalSectionTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
    backgroundColor: Colors.white,
  },
  footerLeft: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  footerAmount: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: r(2),
  },
  viewDetailsText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
  },
  proceedButton: {
    flex: 1,
    marginLeft: Spacing[3],
    marginTop: 0,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
  },
  proceedButtonText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: r(20),
    borderTopRightRadius: r(20),
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[4],
  },
  modalItem: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: r(1),
    borderBottomColor: Colors.gray[200] || '#E5E7EB',
  },
  modalItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  modalItemText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  modalItemTextSelected: {
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
  },
});

export default PlaceOrder;
