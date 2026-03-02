import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {ItemDetails} from '../constants/types';
import {checkAuthStatus} from '../utils/authGuard';
import {useToast} from '../hooks/useToast';

interface RouteParams {
  itemDetails: ItemDetails;
}

const WRAP_OPTIONS = [
  {
    id: 'classic',
    name: 'Classic White',
    color: '#FFFFFF',
    price: 0,
    image: '🎁', // Placeholder emoji
  },
  {
    id: 'birthday',
    name: 'Birthday Fun',
    color: '#FFB6C1',
    price: 15,
    image: '🎂',
  },
  {
    id: 'wedding',
    name: 'Wedding Elegant',
    color: '#E6E6FA',
    price: 25,
    image: '💒',
  },
  {
    id: 'graduation',
    name: 'Graduation Gold',
    color: '#FFD700',
    price: 20,
    image: '🎓',
  },
  {
    id: 'holiday',
    name: 'Holiday Red',
    color: '#FF6B6B',
    price: 18,
    image: '🎄',
  },
  {
    id: 'luxury',
    name: 'Luxury Black',
    color: '#2C2C2C',
    price: 35,
    image: '💎',
  },
];

const RIBBON_OPTIONS = [
  {id: 'none', name: 'No Ribbon', color: 'transparent', price: 0},
  {id: 'red', name: 'Red Ribbon', color: '#FF0000', price: 5},
  {id: 'gold', name: 'Gold Ribbon', color: '#FFD700', price: 8},
  {id: 'silver', name: 'Silver Ribbon', color: '#C0C0C0', price: 8},
  {id: 'blue', name: 'Blue Ribbon', color: '#4169E1', price: 5},
  {id: 'pink', name: 'Pink Ribbon', color: '#FFC0CB', price: 5},
];

const CARD_OPTIONS = [
  {id: 'none', name: 'No Card', price: 0},
  {id: 'standard', name: 'Standard Card', price: 5},
  {id: 'premium', name: 'Premium Card', price: 12},
];

const GiftWrapScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const {itemDetails} = route.params as RouteParams;
  const toast = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedWrap, setSelectedWrap] = useState(WRAP_OPTIONS[0]);
  const [selectedRibbon, setSelectedRibbon] = useState(RIBBON_OPTIONS[0]);
  const [selectedCard, setSelectedCard] = useState(CARD_OPTIONS[0]);
  const [cardMessage, setCardMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [hideSenderInfo, setHideSenderInfo] = useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus);
    };
    checkAuth();
  }, []);

  const GoBack = () => {
    navigation.goBack();
  };

  const calculateTotal = () => {
    return selectedWrap.price + selectedRibbon.price + selectedCard.price;
  };

  const handleProceedToGift = () => {
    if (!recipientName.trim()) {
      toast.showToast('Please enter recipient name', 'error');
      return;
    }

    const giftData = {
      itemDetails,
      wrapOption: selectedWrap,
      ribbonOption: selectedRibbon,
      cardOption: selectedCard,
      cardMessage: cardMessage.trim(),
      recipientName: recipientName.trim(),
      senderName: senderName.trim(),
      hideSenderInfo,
      wrapPrice: calculateTotal(),
    };

    navigation.navigate('SendGift', {giftData});
  };

  if (!itemDetails) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Gift Wrap" onBackPress={GoBack} showBorder={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product details not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Gift Wrap" onBackPress={GoBack} showBorder={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Product Preview */}
        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Gift Item</Text>
          <View style={styles.productCard}>
            <View style={styles.productImage}>
              <Text style={styles.productEmoji}>📦</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {itemDetails.title}
              </Text>
              <Text style={styles.productPrice}>
                SAR {itemDetails.price.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Wrap Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Gift Wrap</Text>
          <View style={styles.optionsGrid}>
            {WRAP_OPTIONS.map((wrap) => (
              <TouchableOpacity
                key={wrap.id}
                style={[
                  styles.optionCard,
                  selectedWrap.id === wrap.id && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedWrap(wrap)}>
                <View
                  style={[
                    styles.wrapPreview,
                    {backgroundColor: wrap.color},
                  ]}>
                  <Text style={styles.wrapEmoji}>{wrap.image}</Text>
                </View>
                <Text style={styles.optionName}>{wrap.name}</Text>
                <Text style={styles.optionPrice}>
                  {wrap.price === 0 ? 'Free' : `+SAR ${wrap.price}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ribbon Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Ribbon</Text>
          <View style={styles.ribbonContainer}>
            {RIBBON_OPTIONS.map((ribbon) => (
              <TouchableOpacity
                key={ribbon.id}
                style={[
                  styles.ribbonOption,
                  selectedRibbon.id === ribbon.id && styles.ribbonOptionSelected,
                  {borderColor: ribbon.color},
                ]}
                onPress={() => setSelectedRibbon(ribbon)}>
                <View
                  style={[
                    styles.ribbonColor,
                    {backgroundColor: ribbon.color},
                  ]}
                />
                <Text style={styles.ribbonName}>{ribbon.name}</Text>
                <Text style={styles.ribbonPrice}>
                  {ribbon.price === 0 ? 'Free' : `+SAR ${ribbon.price}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Card Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Greeting Card</Text>
          <View style={styles.cardOptions}>
            {CARD_OPTIONS.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.cardOption,
                  selectedCard.id === card.id && styles.cardOptionSelected,
                ]}
                onPress={() => setSelectedCard(card)}>
                <Text style={styles.cardName}>{card.name}</Text>
                <Text style={styles.cardPrice}>
                  {card.price === 0 ? 'Free' : `+SAR ${card.price}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedCard.id !== 'none' && (
            <View style={styles.cardMessageSection}>
              <Text style={styles.messageLabel}>Card Message (Optional)</Text>
              <TextInput
                style={styles.messageInput}
                value={cardMessage}
                onChangeText={setCardMessage}
                placeholder="Write your personal message..."
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          )}
        </View>

        {/* Gift Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gift Details</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Recipient Name *</Text>
              <TextInput
                style={styles.input}
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="Enter recipient name"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Your Name (Optional)</Text>
              <TextInput
                style={styles.input}
                value={senderName}
                onChangeText={setSenderName}
                placeholder="Enter your name"
              />
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setHideSenderInfo(!hideSenderInfo)}>
              <View
                style={[
                  styles.checkbox,
                  hideSenderInfo && styles.checkboxChecked,
                ]}>
                {hideSenderInfo && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                Hide sender information from recipient
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Product Price</Text>
              <Text style={styles.summaryValue}>SAR {itemDetails.price.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gift Wrap</Text>
              <Text style={styles.summaryValue}>SAR {selectedWrap.price.toFixed(2)}</Text>
            </View>
            {selectedRibbon.price > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ribbon</Text>
                <Text style={styles.summaryValue}>SAR {selectedRibbon.price.toFixed(2)}</Text>
              </View>
            )}
            {selectedCard.price > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Card</Text>
                <Text style={styles.summaryValue}>SAR {selectedCard.price.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Gift Price</Text>
              <Text style={styles.totalValue}>
                SAR {(itemDetails.price + calculateTotal()).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleProceedToGift}
          activeOpacity={0.8}>
          <Text style={styles.proceedButtonText}>
            Continue to Send Gift • SAR {(itemDetails.price + calculateTotal()).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background[200],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[5],
    paddingBottom: Spacing[8],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FontSizes.base,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
  },
  productSection: {
    marginBottom: Spacing[5],
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[4],
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[4],
    shadowColor: Colors.black[100],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: r(60),
    height: r(60),
    borderRadius: r(8),
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[4],
  },
  productEmoji: {
    fontSize: r(30),
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  productPrice: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.primary,
  },
  section: {
    marginBottom: Spacing[5],
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[3],
    alignItems: 'center',
    borderWidth: r(2),
    borderColor: Colors.gray[200],
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  wrapPreview: {
    width: r(50),
    height: r(50),
    borderRadius: r(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[2],
    borderWidth: r(1),
    borderColor: Colors.gray[300],
  },
  wrapEmoji: {
    fontSize: r(24),
  },
  optionName: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    textAlign: 'center',
    marginBottom: Spacing[1],
  },
  optionPrice: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
  },
  ribbonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  ribbonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[3],
    borderRadius: r(8),
    borderWidth: r(2),
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
    flex: 1,
    minWidth: '30%',
  },
  ribbonOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  ribbonColor: {
    width: r(16),
    height: r(16),
    borderRadius: r(8),
    marginRight: Spacing[2],
  },
  ribbonName: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    flex: 1,
  },
  ribbonPrice: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
  },
  cardOptions: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  cardOption: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: r(8),
    padding: Spacing[3],
    alignItems: 'center',
    borderWidth: r(1),
    borderColor: Colors.gray[200],
  },
  cardOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  cardName: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  cardPrice: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    marginTop: Spacing[1],
  },
  cardMessageSection: {
    marginTop: Spacing[3],
  },
  messageLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[2],
  },
  messageInput: {
    backgroundColor: Colors.white,
    borderWidth: r(1),
    borderColor: Colors.gray[200],
    borderRadius: r(8),
    padding: Spacing[3],
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    minHeight: r(80),
    textAlignVertical: 'top',
  },
  detailsContainer: {
    gap: Spacing[4],
  },
  inputRow: {
    gap: Spacing[2],
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: r(1),
    borderColor: Colors.gray[200],
    borderRadius: r(8),
    padding: Spacing[3],
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  checkbox: {
    width: r(20),
    height: r(20),
    borderWidth: r(2),
    borderColor: Colors.gray[300],
    borderRadius: r(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mbold,
  },
  checkboxLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    flex: 1,
  },
  summarySection: {
    marginBottom: Spacing[6],
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[2],
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  summaryValue: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
  },
  totalRow: {
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200],
    paddingTop: Spacing[3],
    marginTop: Spacing[2],
  },
  totalLabel: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  totalValue: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.primary,
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    borderRadius: r(12),
    padding: Spacing[4],
    alignItems: 'center',
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
  },
});

export default GiftWrapScreen;
