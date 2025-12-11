import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Spacing} from '../constants/styles';
import CloseIcon from '../assets/svgs/close.svg';

interface CloseButtonProps {
  onPress: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({onPress}) => {
  return (
    <TouchableOpacity style={styles.closeButton} onPress={onPress}>
      <CloseIcon />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    marginRight: Spacing[4],
  },
});

export default CloseButton;

