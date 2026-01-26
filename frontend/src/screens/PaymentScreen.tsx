import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute, RouteProp, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteStackParamList} from '../../App';
import {ItemDetails} from '../constants/types';
import {CustomHeader, CustomButton, ConfirmationModal} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {checkAuthStatus} from '../utils/authGuard';
import {storePendingAction, storeNavigationState} from '../utils/pendingActions';

type ScreenRouteProps = RouteProp<RouteStackParamList, 'Payment'>;
type ScreenNavigationProps = StackNavigationProp<
  RouteStackParamList,
  'Payment'
>;

type PaymentMethod = {
  id: string;
  type: 'visa' | 'paypal' | 'mastercard' | 'apple';
  cardNumber: string;
};

const PaymentScreen = () => {
  const navigation = useNavigation<ScreenNavigationProps>();
  const route = useRoute<ScreenRouteProps>();
  const itemDetails: ItemDetails | undefined = route.params?.itemDetails;

  const [selectedPayment, setSelectedPayment] = useState<string>('visa1');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication on screen focus
  useFocusEffect(
    React.useCallback(() => {
      const checkAuth = async () => {
        setIsCheckingAuth(true);
        const authStatus = await checkAuthStatus();
        setIsAuthenticated(authStatus);
        
        if (!authStatus) {
          // Store pending action and navigation state
          await storePendingAction({
            type: 'proceed_to_checkout',
            data: { itemDetails, screen: 'Payment' },
            redirectTo: 'login',
            timestamp: Date.now(),
          });
          
          try {
            const navigationState = navigation.getState();
            await storeNavigationState(navigationState);
          } catch (error) {
            console.error('Error storing navigation state:', error);
          }
          
          // Redirect to login
          navigation.navigate('Login');
        }
        
        setIsCheckingAuth(false);
      };
      
      checkAuth();
    }, [navigation, itemDetails])
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleContinue = async () => {
    // Double-check authentication before proceeding
    const authStatus = await checkAuthStatus();
    if (!authStatus) {
      // Store pending action
      await storePendingAction({
        type: 'proceed_to_checkout',
        data: { itemDetails, screen: 'Payment', action: 'complete_payment' },
        redirectTo: 'login',
        timestamp: Date.now(),
      });
      
      navigation.navigate('Login');
      return;
    }
    
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const currency = (itemDetails as any)?.currency || 'SAR';
  const orderAmount = itemDetails?.price || 80;
  const shippingFee = 30; // Shipping fee
  const orderTotal = orderAmount + shippingFee;

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'visa1',
      type: 'visa',
      cardNumber: '**********2109',
    },
  ];

  const getPaymentLogo = (type: string) => {
    switch (type) {
      case 'visa':
        return 'VISA';
      case 'paypal':
        return 'PayPal';
      case 'mastercard':
        return 'Mastercard';
      case 'apple':
        return 'Apple';
      default:
        return 'VISA';
    }
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title="Checkout"
          onBackPress={handleGoBack}
          showBorder={true}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Don't render payment screen if not authenticated
  if (!isAuthenticated) {
    return null;
  }

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
        {/* Order Summary Section */}
        <View style={styles.orderSummarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order</Text>
            <Text style={styles.summaryValue}>
              {currency} {formatNumber(orderAmount)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.shippingLabel}>Shipping</Text>
            <Text style={styles.shippingValue}>
              {currency} {formatNumber(shippingFee)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {currency} {formatNumber(orderTotal)}
            </Text>
          </View>

          <View style={styles.divider} />
        </View>

        {/* Payment Section */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                selectedPayment === method.id && styles.paymentMethodCardSelected,
              ]}
              onPress={() => setSelectedPayment(method.id)}>
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentLogo}>{getPaymentLogo(method.type)}</Text>
                <Text style={styles.paymentCardNumber}>{method.cardNumber}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Continue Button */}
      <View style={styles.footer}>
        <CustomButton
          title="Continue"
          handlePress={handleContinue}
          containerStyle={styles.continueButton}
        />
      </View>

      {/* Success Modal */}
      <ConfirmationModal
        visible={showSuccessModal}
        title="Payment done successfully."
        onClose={handleModalClose}
      />
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
  orderSummarySection: {
    marginBottom: Spacing[6],
  },
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
    marginBottom: 0,
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
  paymentSection: {
    marginTop: Spacing[0],
  },
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
    borderWidth: 1,
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
    color: '#1A1F71', // VISA blue color
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
  continueButton: {
    marginTop: 0,
  },
});

export default PaymentScreen;

