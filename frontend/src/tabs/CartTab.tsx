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
import {
  updateCartItem,
  removeCartItem,
} from '../services/cartService';
import {useAppSelector} from '../store';
import {requireCheckoutAuth} from '../utils/requireCheckoutAuth';

type NavigationProp = StackNavigationProp<RouteStackParamList>;

const CartTab = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartTotal = useSelector((state: RootState) => state.cart.total);
  const itemCount = useSelector((state: RootState) => state.cart.itemCount);

  const handleGoBack = () => {
    (navigation as any).navigate('Home');
  };

  const handleIncreaseQuantity = async (
    itemId: string,
    currentQuantity: number,
    cartItemId?: string,
  ) => {
    const next = currentQuantity + 1;
    dispatch(updateCartItemQuantity({id: itemId, quantity: next}));
    if (cartItemId && isAuthenticated) {
      try {
        await updateCartItem(cartItemId, next);
      } catch {
        // keep local
      }
    }
  };

  const handleDecreaseQuantity = async (
    itemId: string,
    currentQuantity: number,
    cartItemId?: string,
  ) => {
    if (currentQuantity <= 1) return;
    const next = currentQuantity - 1;
    dispatch(updateCartItemQuantity({id: itemId, quantity: next}));
    if (cartItemId && isAuthenticated) {
      try {
        await updateCartItem(cartItemId, next);
      } catch {
        // keep local
      }
    }
  };

  const handleRemoveItem = async (itemId: string, cartItemId?: string) => {
    dispatch(removeFromCart(itemId));
    if (cartItemId && isAuthenticated) {
      try {
        await removeCartItem(cartItemId);
      } catch {
        // keep local
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    if (!requireCheckoutAuth(isAuthenticated, navigation)) return;
    // Use Redux cart on Checkout — do not pass heavy item payloads via navigation.
    navigation.navigate('Checkout');
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const shippingFee = cartTotal > 0 ? 15 : 0;
  const finalTotal = cartTotal + shippingFee;

  return (
    <View style={styles.container}>
      <CustomHeader title="Shopping Bag" onBackPress={handleGoBack} showBorder />
      <ScrollView contentContainerStyle={styles.content}>
        {cartItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <CustomButton
              title="Continue Shopping"
              handlePress={() => (navigation as any).navigate('Home')}
            />
          </View>
        ) : (
          <>
            {cartItems.map(item => (
              <View key={item.cartItemId || item._id} style={styles.row}>
                <ProductCard itemDetails={item} showTotalItem totalItems={item.quantity} />
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    onPress={() =>
                      handleDecreaseQuantity(
                        item._id,
                        item.quantity,
                        item.cartItemId,
                      )
                    }>
                    <Text style={styles.qtyBtn}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleIncreaseQuantity(
                        item._id,
                        item.quantity,
                        item.cartItemId,
                      )
                    }>
                    <SvgXml xml={plusIcon} width={r(18)} height={r(18)} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleRemoveItem(item._id, item.cartItemId)
                    }
                    style={styles.trash}>
                    <SvgXml xml={trashIcon} width={r(18)} height={r(18)} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                Items ({itemCount}): SAR {formatNumber(cartTotal)}
              </Text>
              <Text style={styles.summaryText}>
                Shipping: SAR {formatNumber(shippingFee)}
              </Text>
              <Text style={styles.total}>
                Total: SAR {formatNumber(finalTotal)}
              </Text>
            </View>

            <CustomButton
              title="Proceed to Checkout"
              handlePress={handleProceedToCheckout}
              containerStyle={styles.checkoutButton}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.white},
  content: {padding: Spacing[5], paddingBottom: Spacing[12]},
  empty: {alignItems: 'center', marginTop: Spacing[16], gap: Spacing[4]},
  emptyText: {
    fontFamily: FontFamilies.mmedium,
    color: Colors.gray[500],
    marginBottom: Spacing[4],
  },
  row: {
    marginBottom: Spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    paddingBottom: Spacing[4],
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginTop: Spacing[2],
  },
  qtyBtn: {fontSize: FontSizes.xl, paddingHorizontal: Spacing[2]},
  qty: {fontFamily: FontFamilies.mbold, minWidth: 24, textAlign: 'center'},
  trash: {marginLeft: 'auto'},
  summary: {
    marginTop: Spacing[4],
    marginBottom: Spacing[6],
    gap: Spacing[2],
  },
  summaryText: {
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
  },
  total: {
    fontFamily: FontFamilies.mbold,
    fontSize: FontSizes.lg,
    marginTop: Spacing[2],
  },
  checkoutButton: {marginTop: Spacing[2]},
});

export default CartTab;
