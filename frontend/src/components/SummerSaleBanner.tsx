import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {SvgXml} from 'react-native-svg';
import {rightArrow} from '../assets/svgs/rightArrow';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import { rightArrowWhite } from '../assets/svgs/rightArrowWhite';

type SummerSaleBannerProps = {
  onViewAllPress?: () => void;
};

const SummerSaleBanner = ({
  onViewAllPress,
}: SummerSaleBannerProps) => {
  return (
    <View style={styles.container}>
      {/* Banner Image */}
      <FastImage
        source={{
          uri: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=200&fit=crop',
        }}
        style={styles.bannerImage}
        resizeMode={FastImage.resizeMode.cover}
      />

      {/* Content Below Banner */}
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.newArrivalsText}>New Arrivals</Text>
          <Text style={styles.collectionText}>Summer' 25 Collections</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={onViewAllPress}>
          <Text style={styles.viewAllText}>View all</Text>
          <SvgXml xml={rightArrowWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing[5],
    marginBottom: Spacing[5],
  },
  bannerImage: {
    width: '100%',
    height: r(200),
    borderTopLeftRadius: r(12),
    borderTopRightRadius: r(12),
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[2],
    backgroundColor: '#F4F4F4',
    paddingVertical: Spacing[4],
    borderBottomLeftRadius: r(12),
    borderBottomRightRadius: r(12),
  },
  textContainer: {
    flex: 1,
  },
  newArrivalsText: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    fontWeight: '700',
    marginBottom: Spacing[1],
  },
  collectionText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  viewAllButton: {
    backgroundColor: Colors.red[500],
    borderRadius: r(8),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  viewAllText: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mmedium,
    fontWeight: '500',
  },
});

export default SummerSaleBanner;

