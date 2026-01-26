import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {ScreenProps} from '../constants/types';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {ProductCard, CustomHeader} from '../components';

const SendGiftScreen = ({route}: ScreenProps<'SendGift'>) => {
  const navigation = useNavigation<ScreenProps<'SendGift'>['navigation']>();
  const {itemDetails} = route.params || {};
  const [email, setEmail] = useState('aashifa@gmail.com');
  const [sahalId, setSahalId] = useState('#SAH532168');

  const GoBack = () => {
    navigation.goBack();
  };

  const NavigateToCart = () => {
    // Navigate to Cart tab from nested stack
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Cart', {itemDetails: itemDetails!});
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomHeader
        title="Send as a Gift"
        onBackPress={GoBack}
        showCart={true}
        onCartPress={NavigateToCart}
        showBorder={true}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Details Card */}
        <ProductCard 
          itemDetails={itemDetails!} 
          showTotalItem={true}
          totalItems={1}
        />

        {/* Recipient Details Section */}
        <View style={styles.recipientSection}>
          <Text style={styles.recipientTitle}>Recipient Details</Text>
          
          {/* Email Address */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              placeholderTextColor="#9E9E9E"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Sahal ID */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Sahal ID</Text>
            <TextInput
              style={styles.input}
              value={sahalId}
              onChangeText={setSahalId}
              placeholder="Enter Sahal ID"
              placeholderTextColor="#9E9E9E"
            />
          </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
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
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[5],
  },
  recipientSection: {
    marginTop: Spacing[4],
    marginBottom: Spacing[4],
  },
  recipientTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[6],
  },
  inputContainer: {
    marginBottom: Spacing[4],
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    marginBottom: Spacing[2],
  },
  input: {
    borderWidth: r(1),
    borderColor: '#E5E7EB',
    borderRadius: r(8),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    backgroundColor: Colors.white,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: r(8),
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[4],
    marginBottom: Spacing[5],
  },
  sendButtonText: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.white,
  },
});

export default SendGiftScreen;

