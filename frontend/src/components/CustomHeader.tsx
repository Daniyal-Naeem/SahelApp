import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={[
        styles.header,
        {paddingTop: insets.top},
        showBorder && styles.headerWithBorder,
        containerStyle,
      ]}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <SvgXml xml={backIcon} />
        </TouchableOpacity>
      </View>

      {showLogo ? (
        <View style={styles.logoContainer}>
          <FastImage
            source={images.homeLogo}
            style={styles.logo}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      ) : title ? (
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      ) : (
        <View style={styles.headerCenter} />
      )}

      <View style={styles.rightButtonContainer}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: Spacing[2],
    paddingRight: Spacing[5],
    paddingBottom: Spacing[3],
    minHeight: r(40),
  },
  headerWithBorder: {
    borderBottomWidth: r(1),
    borderBottomColor: Colors.gray[200] || '#E5E7EB',
  },
  backButtonContainer: {
    width: r(40),
    height: r(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: r(40),
    height: r(40),
    justifyContent: 'center',
    alignItems: 'center',
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
    height: r(40),
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButtonContainer: {
    width: r(40),
    height: r(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    textAlign: 'center',
  },
  logo: {
    width: r(130),
    height: r(46),
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

