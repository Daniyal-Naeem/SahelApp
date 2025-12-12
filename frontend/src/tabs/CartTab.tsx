import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useSelector, useDispatch} from 'react-redux';
import {RouteStackParamList} from '../../App';
import {RootState} from '../store/store';
import {updateCartItemQuantity, removeFromCart} from '../store/cartSlice';
import {ProductCard, CustomButton, CustomHeader} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {plusIcon} from '../assets/svgs/plusIcon';
import {trashIcon} from '../assets/svgs/trashIcon';
import {ItemDetails} from '../constants/types';

type NavigationProp = StackNavigationProp<RouteStackParamList>;

const CartTab = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartTotal = useSelector((state: RootState) => state.cart.total);
  const itemCount = useSelector((state: RootState) => state.cart.itemCount);

  const handleGoBack = () => {
    // Navigate to Home tab
    (navigation as any).navigate('Home');
  };

  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    dispatch(updateCartItemQuantity({id: itemId, quantity: currentQuantity + 1}));
  };

  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      dispatch(updateCartItemQuantity({id: itemId, quantity: currentQuantity - 1}));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    
    // For now, navigate to Checkout with the first item
    // TODO: Update CheckoutScreen to handle multiple items
    const firstItem = cartItems[0];
    const itemDetails: ItemDetails = {
      _id: firstItem._id,
      title: firstItem.title,
      description: firstItem.description,
      price: firstItem.price,
      priceBeforeDeal: firstItem.priceBeforeDeal,
      priceOff: firstItem.priceOff || '',
      stars: firstItem.stars || 0,
      numberOfReview: firstItem.numberOfReview || 0,
      image: firstItem.image,
      tags: firstItem.tags || [],
      createdAt: firstItem.createdAt || '',
      updatedAt: firstItem.updatedAt || '',
      __v: firstItem.__v || 0,
      variations: firstItem.variations,
    };
    
    navigation.navigate('Checkout', {itemDetails});
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const shippingFee = cartTotal > 0 ? 15 : 0; // Example shipping fee
  const finalTotal = cartTotal + shippingFee;

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Shopping Cart"
        onBackPress={handleGoBack}
        showBorder={true}
      />

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>
            Add items to your cart to get started
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => {
              const itemDetails: ItemDetails = {
                _id: item._id,
                title: item.title,
                description: item.description,
                price: item.price,
                priceBeforeDeal: item.priceBeforeDeal,
                priceOff: item.priceOff || '',
                stars: item.stars || 0,
                numberOfReview: item.numberOfReview || 0,
                image: item.image,
                tags: item.tags || [],
                createdAt: item.createdAt || '',
                updatedAt: item.updatedAt || '',
                __v: item.__v || 0,
                variations: item.variations,
              };

              return (
                <View key={item._id} style={styles.cartItemContainer}>
                  <ProductCard
                    itemDetails={itemDetails}
                    showTotalItem={false}
                  />
                  
                  {/* Quantity Controls and Remove Button */}
                  <View style={styles.quantityContainer}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                          handleDecreaseQuantity(item._id, item.quantity)
                        }>
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                          handleIncreaseQuantity(item._id, item.quantity)
                        }>
                        <SvgXml xml={plusIcon} width={r(16)} height={r(16)} />
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item._id)}>
                      <SvgXml xml={trashIcon} width={r(20)} height={r(20)} />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Item Total */}
                  <View style={styles.itemTotalContainer}>
                    <Text style={styles.itemTotalLabel}>Item Total:</Text>
                    <Text style={styles.itemTotalPrice}>
                      SAR {formatNumber(item.price * item.quantity)}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Order Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({itemCount} items):</Text>
                <Text style={styles.summaryValue}>
                  SAR {formatNumber(cartTotal)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping Fee:</Text>
                <Text style={styles.summaryValue}>
                  SAR {formatNumber(shippingFee)}
                </Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  SAR {formatNumber(finalTotal)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Proceed to Checkout Button */}
          <View style={styles.bottomButtonContainer}>
            <CustomButton
              title={`Proceed to Checkout (${itemCount} items)`}
              handlePress={handleProceedToCheckout}
              containerStyle={styles.checkoutButton}
            />
          </View>
        </>
      )}
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
    color: Colors.gray[600] || '#4B5563',
    textAlign: 'center',
  },
  cartItemContainer: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[4],
    marginBottom: Spacing[4],
    borderWidth: r(1),
    borderColor: Colors.gray[200] || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[3],
    paddingTop: Spacing[3],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  quantityButton: {
    width: r(32),
    height: r(32),
    borderRadius: r(8),
    backgroundColor: Colors.gray[100] || '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: r(1),
    borderColor: Colors.gray[300] || '#D1D5DB',
  },
  quantityButtonText: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  quantityText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    minWidth: r(30),
    textAlign: 'center',
  },
  removeButton: {
    padding: Spacing[2],
  },
  itemTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[2],
    paddingTop: Spacing[2],
  },
  itemTotalLabel: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
  },
  itemTotalPrice: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[4],
    marginTop: Spacing[4],
    borderWidth: r(1),
    borderColor: Colors.gray[200] || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  summaryLabel: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
  },
  summaryValue: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  totalRow: {
    marginTop: Spacing[2],
    paddingTop: Spacing[3],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
  },
  totalLabel: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  totalValue: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
  },
  bottomButtonContainer: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
    backgroundColor: Colors.white,
  },
  checkoutButton: {
    marginTop: 0,
  },
});

export default CartTab;
