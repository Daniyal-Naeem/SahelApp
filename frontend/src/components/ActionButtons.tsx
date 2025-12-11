import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Spacing} from '../constants/styles';
import NextButton from './NextButton';
import CloseButton from './CloseButton';

interface ActionButtonsProps {
  onNext: () => void;
  onClose: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onNext,
  onClose,
  nextLabel,
  nextDisabled,
}) => {
  return (
    <View style={styles.actionButtonsContainer}>
      <NextButton
        onPress={onNext}
        label={nextLabel}
        disabled={nextDisabled}
      />
      <CloseButton onPress={onClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing[2],
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[2],
  },
});

export default ActionButtons;

