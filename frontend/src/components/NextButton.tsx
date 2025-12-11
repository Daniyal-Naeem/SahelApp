import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';

interface NextButtonProps {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
}

const NextButton: React.FC<NextButtonProps> = ({
  onPress,
  label = 'Next',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.nextButton, disabled && styles.nextButtonDisabled]}
      onPress={onPress}
      disabled={disabled}>
      <LinearGradient
        colors={['#FFCA28', '#F1D534']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.nextButtonGradient}>
        <Text style={styles.nextButtonText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nextButton: {
    width: '85%',
    flex: 0,
    borderRadius: r(10),
    minHeight: r(44),
    overflow: 'hidden',
    justifyContent: 'center',
    marginRight: Spacing[4],
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderRadius: r(10),
  },
  nextButtonText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
});

export default NextButton;

