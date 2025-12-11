import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';

const VIPClubScreen = () => {
  const navigation = useNavigation<any>();

  const GoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Join VIP Club"
        onBackPress={GoBack}
        showBorder={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>VIP Club Benefits</Text>
          <Text style={styles.description}>
            Join our VIP Club and enjoy exclusive benefits, special discounts, and early access to new products.
          </Text>
          
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitItem}>• Exclusive VIP-only discounts</Text>
            <Text style={styles.benefitItem}>• Early access to new products</Text>
            <Text style={styles.benefitItem}>• Free shipping on all orders</Text>
            <Text style={styles.benefitItem}>• Priority customer support</Text>
            <Text style={styles.benefitItem}>• Special birthday offers</Text>
          </View>
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
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[4],
  },
  description: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
    lineHeight: r(24),
    marginBottom: Spacing[6],
  },
  benefitsContainer: {
    marginTop: Spacing[4],
  },
  benefitItem: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    marginBottom: Spacing[3],
    lineHeight: r(24),
  },
});

export default VIPClubScreen;





