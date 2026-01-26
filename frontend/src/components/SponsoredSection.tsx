import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {SvgXml} from 'react-native-svg';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import { sponsoredArrow } from '../assets/svgs/sponsoredArrow';

type SponsoredSectionProps = {
  onPress?: () => void;
};

const SponsoredSection = ({onPress}: SponsoredSectionProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.sponsoredLabel}>Sponsored</Text>
      <View style={styles.imageContainer}>
        <FastImage
          source={{
            uri: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
          }}
          style={styles.productImage}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>
      {/* Text Below Image */}
      <View style={styles.textContainer}>
        <Text style={styles.offerText}>up to 50% Off</Text>
        <TouchableOpacity>
        <SvgXml xml={sponsoredArrow}  />
        </TouchableOpacity>
      
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing[5],
    marginBottom: Spacing[5],
  },
  sponsoredLabel: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
    marginBottom: Spacing[4],
  },
  imageContainer: {
    position: 'relative',
    borderRadius: r(12),
    overflow: 'hidden',
    marginBottom: Spacing[3],
  },
  productImage: {
    width: '100%',
    height: r(250),
    borderRadius: r(12),
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[2],
  },
  offerText: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100]
  },
});

export default SponsoredSection;

