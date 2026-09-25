import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp, CommonActions} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteStackParamList} from '../../App';
import {CustomHeader, CustomButton, ConfirmationModal} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {useAppDispatch, useAppSelector} from '../store';
import {clearCart} from '../store/cartSlice';
import {
  checkoutWithCredits,
  getWalletBalance,
} from '../services/checkoutService';
import {requireCheckoutAuth} from '../utils/requireCheckoutAuth';
import {formatMoneyGrouped, roundMoney} from '../utils/formatMoney';

type ScreenRouteProps = RouteProp<RouteStackParamList, 'Payment'>;
type ScreenNavigationProps = StackNavigationProp<RouteStackParamList, 'Payment'>;

const PaymentScreen = () => {
  const navigation = useNavigation<ScreenNavigationProps>();
  const route = useRoute<ScreenRouteProps>();
  const dispatch = useAppDispatch();
  const reduxCart = useAppSelector(state => state.cart.items);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  const cartItems = route.params?.cartItems?.length
    ? route.params.cartItems
    : reduxCart;
  const shippingAddress = route.params?.shippingAddress;

  const [selectedPayment, setSelectedPayment] = useState<'credits' | 'card'>(
    'credits',
  );
  const [balance, setBalance] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const orderAmount = useMemo(
    () =>
      roundMoney(
        cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      ),
    [cartItems],
  );
  const shippingFee = orderAmount > 0 ? 10 : 0;
  const orderTotal = roundMoney(orderAmount + shippingFee);

  useEffect(() => {
    if (!requireCheckoutAuth(isAuthenticated, navigation)) {
      navigation.goBack();
      return;
    }
    getWalletBalance()
      .then(setBalance)
      .catch(() => setBalance(0));
  }, [isAuthenticated, navigation]);

  const handleGoBack = () => navigation.goBack();

  const handleContinue = async () => {
    if (!cartItems.length) {
      Alert.alert('Empty cart', 'Add products before checkout.');
      return;
    }
    if (selectedPayment !== 'credits') {
      Alert.alert(
        'Demo payment',
        'Card gateways are not connected in this demo. Please pay with Sahal Credits.',
      );
      setSelectedPayment('credits');
      return;
    }
    if (balance !== null && balance < orderTotal) {
      Alert.alert(
        'Insufficient credits',
        `You need SAR ${orderTotal.toFixed(2)} but only have SAR ${balance.toFixed(2)}. Ask admin to top up your wallet.`,
      );
      return;
    }

    setPaying(true);
    try {
      await checkoutWithCredits({
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: shippingAddress || {
          street: "216 St Paul's Rd",
          city: 'London',
          country: 'UK',
          zipCode: 'N1 2LL',
        },
        totalAmount: orderTotal,
        creditAmount: orderTotal,
      });
      dispatch(clearCart());
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert(
        'Payment failed',
        error?.response?.data?.error ||
          error?.message ||
          'Could not complete checkout',
      );
    } finally {
      setPaying(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'HomeScreen',
            state: {
              routes: [{name: 'Orders'}],
            },
          },
        ],
      }),
    );
  };

  const formatNumber = (num: number): string => formatMoneyGrouped(num);

  return (
    <View style={styles.container}>
      <CustomHeader title="Payment" onBackPress={handleGoBack} showBorder />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.orderSummarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order</Text>
            <Text style={styles.summaryValue}>SAR {formatNumber(orderAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.shippingLabel}>Shipping</Text>
            <Text style={styles.shippingValue}>SAR {formatNumber(shippingFee)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>SAR {formatNumber(orderTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Wallet balance</Text>
            <Text style={styles.summaryValue}>
              {balance === null ? '…' : `SAR ${formatNumber(balance)}`}
            </Text>
          </View>
          <View style={styles.divider} />
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment method</Text>

          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPayment === 'credits' && styles.paymentMethodCardSelected,
            ]}
            onPress={() => setSelectedPayment('credits')}>
            <View style={styles.paymentMethodContent}>
              <Text style={styles.paymentLogo}>Sahal Credits</Text>
              <Text style={styles.paymentCardNumber}>Wallet</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPayment === 'card' && styles.paymentMethodCardSelected,
            ]}
            onPress={() => setSelectedPayment('card')}>
            <View style={styles.paymentMethodContent}>
              <Text style={styles.paymentLogo}>VISA</Text>
              <Text style={styles.paymentCardNumber}>Demo only</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {paying ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <CustomButton
            title={`Pay SAR ${formatNumber(orderTotal)}`}
            handlePress={handleContinue}
            containerStyle={styles.continueButton}
          />
        )}
      </View>

      <ConfirmationModal
        visible={showSuccessModal}
        title="Payment done successfully."
        onClose={handleModalClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.white},
  scrollView: {flex: 1},
  scrollViewContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  orderSummarySection: {marginBottom: Spacing[6]},
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  summaryLabel: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mregular,
    color: '#A8A8A9',
  },
  shippingLabel: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mregular,
    color: '#A8A8A9',
  },
  summaryValue: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mregular,
    color: '#A8A8A9',
  },
  shippingValue: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mregular,
    color: '#A8A8A9',
  },
  divider: {
    height: r(1),
    backgroundColor: Colors.gray[200] || '#E5E7EB',
    marginTop: Spacing[2],
  },
  totalLabel: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: '#4C5059',
  },
  totalValue: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: '#4C5059',
  },
  paymentSection: {marginTop: Spacing[0]},
  paymentTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
    marginBottom: Spacing[4],
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r(8),
    width: '100%',
    minHeight: r(48),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: Spacing[3],
  },
  paymentMethodCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  paymentLogo: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: '#1A1F71',
  },
  paymentCardNumber: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.gray[600] || '#6B7280',
  },
  footer: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
    backgroundColor: Colors.white,
  },
  continueButton: {marginTop: 0},
});

export default PaymentScreen;
