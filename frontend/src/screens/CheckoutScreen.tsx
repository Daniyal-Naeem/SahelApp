import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteStackParamList} from '../../App';
import {ItemDetails} from '../constants/types';
import {ProductCard, CustomButton, CustomHeader} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {deliveritIcon} from '../assets/svgs/deliveritIcon';
import { plusIcon } from '../assets/svgs/plusIcon';
import { editIcon } from '../assets/svgs/editIcon';

type ScreenRouteProps = RouteProp<RouteStackParamList, 'Checkout'>;
type ScreenNavigationProps = StackNavigationProp<
  RouteStackParamList,
  'Checkout'
>;

const CheckoutScreen = () => {
  const navigation = useNavigation<ScreenNavigationProps>();
  const route = useRoute<ScreenRouteProps>();

  // Get itemDetails from route params
  const itemDetails: ItemDetails | undefined = route.params?.itemDetails;

  // Default address data
  const [deliveryAddress] = useState({
    address: "216 St Paul's Rd, London N1 2LL, UK",
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEditAddress = () => {
    // Navigate to HomeScreen (which contains DrawerNavigator -> Dashboard -> Profile tab)
    // Navigate to HomeScreen, then to Dashboard with Profile tab and scrollToAddress params
    (navigation as any).navigate('HomeScreen', {
      screen: 'Dashboard',
      params: {
        screen: 'Profile',
        scrollToAddress: true,
      },
    });
  };

  const handleAddAddress = () => {
    // TODO: Navigate to add address screen
  };

  const handleProceed = () => {
    // TODO: Navigate to payment/place order screen
    navigation.navigate('PlaceOrder', {itemDetails: itemDetails!});
  };

  // For now, single item checkout
  const totalItems = 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomHeader
        title="Checkout"
        onBackPress={handleGoBack}
        showBorder={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SvgXml xml={deliveritIcon} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>

          <View style={styles.addressCardWrapper}>
              <View style={styles.addressCard}>
                <TouchableOpacity
                  onPress={handleEditAddress}
                  style={styles.editButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                  <SvgXml xml={editIcon} />
                </TouchableOpacity>

                <Text style={styles.addressLabel}>Address:</Text>
                <Text style={styles.addressText}>
                  {deliveryAddress.address}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleAddAddress}
                style={styles.addAddressButtonContainer}>
                <LinearGradient
                  colors={['#FFCA28', '#F1D534']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.addAddressButton}>
                
                    <SvgXml xml={plusIcon} />
              
                </LinearGradient>
              </TouchableOpacity>
            </View>
        </View>

        {/* Shopping List Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shopping List</Text>

          {itemDetails && (
            <ProductCard 
              itemDetails={itemDetails} 
              showTotalItem={true}
              totalItems={totalItems}
            />
          )}
        </View>
      </ScrollView>

      {/* Proceed Button */}
      <View style={styles.bottomButtonContainer}>
        <CustomButton
          title="Proceed"
          handlePress={handleProceed}
          containerStyle={styles.proceedButton}
        />
      </View>
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
  section: {
    marginBottom: Spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  addressCardWrapper: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'stretch',
  },
  addressCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[4],
    borderWidth: r(1),
    borderColor: Colors.gray[200] || '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    padding: Spacing[2],
    zIndex: 10,
    minWidth: r(32),
    minHeight: r(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
    marginBottom: Spacing[1],
  },
  addressText: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    marginBottom: Spacing[2],
    lineHeight: r(20),
  },
  addAddressButtonContainer: {
    width: r(100),
  },
  addAddressButton: {
    flex: 1,
    borderRadius: r(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonContainer: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
    backgroundColor: Colors.white,
  },
  proceedButton: {
    marginTop: 0,
  },
});

export default CheckoutScreen;
