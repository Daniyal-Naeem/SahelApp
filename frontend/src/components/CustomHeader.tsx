import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {images} from '../constants';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import { backIcon } from '../assets/svgs/backIcon';
import { cartIcon } from '../assets/svgs/cartIcon';

type CustomHeaderProps = {
  title?: string;
  showLogo?: boolean;
  onBackPress: () => void;
  rightComponent?: React.ReactNode;
  showCart?: boolean;
  onCartPress?: () => void;
  containerStyle?: ViewStyle;
  showBorder?: boolean;
};

const CustomHeader = ({
  title,
  showLogo = false,
  onBackPress,
  rightComponent,
  showCart = false,
  onCartPress,
  containerStyle,
  showBorder = true,
}: CustomHeaderProps) => {
  return (
    <View
      style={[
        styles.header,
        showBorder && styles.headerWithBorder,
        containerStyle,
      ]}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
       <SvgXml xml={backIcon} />
      </TouchableOpacity>

      {showLogo ? (
        <FastImage
          source={images.homeLogo}
          style={styles.logo}
          resizeMode={FastImage.resizeMode.contain}
        />
      ) : title ? (
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      ) : (
        <View style={styles.headerCenter} />
      )}

      {rightComponent ? (
        rightComponent
      ) : showCart ? (
        <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
          <SvgXml xml={cartIcon}  />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerRight} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
  },
  headerWithBorder: {
    borderBottomWidth: r(1),
    borderBottomColor: Colors.gray[200] || '#E5E7EB',
  },
  backButton: {
    width: r(40),
    height: r(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    width: r(24),
    height: r(24),
  },
  headerCenter: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    textAlign: 'center',
  },
  logo: {
    width: r(96),
    height: r(32),
  },
  headerRight: {
    width: r(40),
  },
  cartButton: {
    width: r(40),
    height: r(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomHeader;

