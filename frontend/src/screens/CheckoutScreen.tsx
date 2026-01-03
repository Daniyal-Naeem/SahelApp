import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useToast} from '../hooks/useToast';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteStackParamList} from '../../App';
import {ItemDetails} from '../constants/types';
import {ProductCard, CustomButton, CustomHeader, ConfirmationModal} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {deliveritIcon} from '../assets/svgs/deliveritIcon';
import { plusIcon } from '../assets/svgs/plusIcon';
import { editIcon } from '../assets/svgs/editIcon';
import {trashIcon} from '../assets/svgs/trashIcon';

type ScreenRouteProps = RouteProp<RouteStackParamList, 'Checkout'>;
type ScreenNavigationProps = StackNavigationProp<
  RouteStackParamList,
  'Checkout'
>;

interface Address {
  id: string;
  address: string;
  isSelected: boolean;
}

const CheckoutScreen = () => {
  const navigation = useNavigation<ScreenNavigationProps>();
  const route = useRoute<ScreenRouteProps>();
  const toast = useToast();

  const itemDetails: ItemDetails | undefined = route.params?.itemDetails;

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      address: "216 St Paul's Rd, London N1 2LL, UK",
      isSelected: true,
    },
  ]);

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEditAddress = (_addressId: string) => {
    (navigation as any).navigate('HomeScreen', {
      screen: 'Dashboard',
      params: {
        screen: 'Profile',
        scrollToAddress: true,
      },
    });
  };

  const handleAddAddress = () => {
    if (addresses.length >= 2) {
      toast.showToast('Only 2 addresses can be added');
      return;
    }
    setShowAddAddressModal(true);
  };

  const handleSaveNewAddress = () => {
    if (!newAddress.trim()) {
      toast.showToast('Please enter an address');
      return;
    }
    if (newAddress.length > 150) {
      toast.showToast('Address must be 150 characters or less');
      return;
    }

    const newAddressItem: Address = {
      id: Date.now().toString(),
      address: newAddress.trim(),
      isSelected: false,
    };

    setAddresses([...addresses, newAddressItem]);
    setNewAddress('');
    setShowAddAddressModal(false);
    toast.showToast('Address added successfully');
  };

  const handleSelectAddress = (addressId: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isSelected: addr.id === addressId,
    })));
  };

  const handleRemoveAddress = (addressId: string) => {
    if (addresses.length <= 1) {
      toast.showToast('You must have at least one address');
      return;
    }

    const addressToRemove = addresses.find(addr => addr.id === addressId);
    const isSelected = addressToRemove?.isSelected;

    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);

    if (isSelected && updatedAddresses.length > 0) {
      updatedAddresses[0].isSelected = true;
    }

    setAddresses(updatedAddresses);
  };

  const handleProceed = () => {
    navigation.navigate('PlaceOrder', {itemDetails: itemDetails!});
  };

  const totalItems = 1;

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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SvgXml xml={deliveritIcon} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>

          <View style={[
            styles.addressCardWrapper,
            addresses.length === 2 && styles.addressCardWrapperColumn
          ]}>
            {addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressCard,
                  addresses.length > 1 && address.isSelected && styles.addressCardSelected,
                ]}
                onPress={() => {
                  if (addresses.length > 1) {
                    handleSelectAddress(address.id);
                  }
                }}
                activeOpacity={addresses.length > 1 ? 0.7 : 1}>
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    onPress={() => handleEditAddress(address.id)}
                    style={styles.editButton}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <SvgXml xml={editIcon} />
                  </TouchableOpacity>
                  {addresses.length === 2 && !address.isSelected && (
                    <TouchableOpacity
                      onPress={() => handleRemoveAddress(address.id)}
                      style={styles.removeButton}
                      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                      <SvgXml xml={trashIcon} width={r(16)} height={r(16)} />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.addressLabel}>Address:</Text>
                <Text style={styles.addressText}>{address.address}</Text>
              </TouchableOpacity>
            ))}

            {addresses.length < 2 && (
              <TouchableOpacity
                onPress={handleAddAddress}
                style={styles.addAddressButtonContainer}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FFCA28', '#F1D534']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.addAddressButton}
                  pointerEvents="none">
                  <SvgXml xml={plusIcon} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

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

      <View style={styles.bottomButtonContainer}>
        <CustomButton
          title="Proceed"
          handlePress={handleProceed}
          containerStyle={styles.proceedButton}
        />
      </View>

      <ConfirmationModal
        visible={showAddAddressModal}
        title="Add New Address"
        showIcon={false}
        showInput={true}
        inputValue={newAddress}
        onInputChange={setNewAddress}
        inputPlaceholder="Enter address"
        primaryButtonText="Save"
        onPrimaryPress={handleSaveNewAddress}
        secondaryButtonText="Cancel"
        onSecondaryPress={() => {
          setShowAddAddressModal(false);
          setNewAddress('');
        }}
        onClose={() => {
          setShowAddAddressModal(false);
          setNewAddress('');
        }}
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
  addressCardWrapperColumn: {
    flexDirection: 'column',
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
  addressCardSelected: {
    borderColor: Colors.primary,
    borderWidth: r(1.5),
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[0],
    zIndex: 10,
  },
  editButton: {
    padding: Spacing[2],
    minWidth: r(32),
    minHeight: r(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    padding: Spacing[2],
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
    paddingRight: Spacing[2],
  },
  addressCounter: {
    position: 'absolute',
    bottom: Spacing[2],
    right: Spacing[3],
  },
  addressCounterText: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.msemibold,
    color: Colors.gray[600] || '#4B5563',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: r(16),
    padding: Spacing[5],
    width: '90%',
    maxWidth: r(400),
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[4],
    textAlign: 'center',
  },
  addressInput: {
    borderWidth: r(1),
    borderColor: Colors.gray[300] || '#D1D5DB',
    borderRadius: r(8),
    padding: Spacing[3],
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    minHeight: r(80),
    textAlignVertical: 'top',
    marginBottom: Spacing[4],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing[3],
    borderRadius: r(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.gray[200] || '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.white,
  },
});

export default CheckoutScreen;
