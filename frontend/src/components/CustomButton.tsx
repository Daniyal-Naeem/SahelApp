import {Text, TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import React from 'react';
import {Colors, Spacing, FontSizes, FontFamilies} from '../constants/styles';

type CustomButtonProps = {
  title: string;
  handlePress: () => void;
  containerStyle?: ViewStyle;
  testStyles?: string;
  isLoading?: boolean;
  textStyle?: TextStyle;
};

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  handlePress,
  containerStyle,
  isLoading,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.button,
        isLoading && styles.buttonDisabled,
        containerStyle,
      ]}
      disabled={isLoading}>
      <Text style={[styles.buttonText, textStyle]}>
        {title}
      </Text>
      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color={'#fff'}
          style={styles.loader}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.action,
    borderRadius: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[4],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: FontFamilies.mbold,
    fontSize: FontSizes.lg,
  },
  loader: {
    marginLeft: Spacing[2],
  },
});

export default CustomButton;
