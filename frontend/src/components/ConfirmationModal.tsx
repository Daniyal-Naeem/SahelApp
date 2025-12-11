import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {paymentCheck} from '../assets/svgs/paymentCheck';
import {paymentCheckTick} from '../assets/svgs/paymentCheckTick';

type ConfirmationModalProps = {
  visible: boolean;
  title?: string;
  message?: string;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  onClose?: () => void;
  showIcon?: boolean;
};

const ConfirmationModal = ({
  visible,
  title = 'Payment done successfully.',
  message,
  secondaryButtonText,
  onSecondaryPress,
  onClose,
  showIcon = true,
}: ConfirmationModalProps) => {
  const handleSecondaryPress = () => {
    onSecondaryPress?.();
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {showIcon && (
                <View style={styles.iconContainer}>
                  {/* Decorative dots */}
                  <View style={[styles.decorativeDot, styles.dot1]} />
                  <View style={[styles.decorativeDot, styles.dot2]} />
                  <View style={[styles.decorativeDot, styles.dot3]} />
                  <View style={[styles.decorativeDot, styles.dot4]} />
                  <View style={[styles.decorativeDot, styles.dot5]} />
                  
                  {/* Main icon circle */}
                  <View style={styles.iconCircle}>
                    <SvgXml xml={paymentCheck} width={r(98)} height={r(98)} />
                    <View style={styles.tickContainer}>
                      <SvgXml xml={paymentCheckTick} width={r(52)} height={r(33)} />
                    </View>
                  </View>
                </View>
              )}
              
              {title && (
                <Text style={styles.title}>{title}</Text>
              )}
              
              {message && (
                <Text style={styles.message}>{message}</Text>
              )}

              <View style={styles.buttonContainer}>
                {secondaryButtonText && (
                  <TouchableOpacity
                    onPress={handleSecondaryPress}
                    style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>
                      {secondaryButtonText}
                    </Text>
                  </TouchableOpacity>
                )}
             
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: r(16),
    paddingHorizontal: Spacing[6],

    paddingVertical: Spacing[10],
    width: '100%',
    maxWidth: r(400),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: Spacing[6],
    marginTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: r(98),
    height: r(98),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tickContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeDot: {
    position: 'absolute',
    width: r(12),
    height: r(12),
    borderRadius: r(6),
    backgroundColor: '#FFB6C1', // Light pink
    opacity: 0.6,
  },
  dot1: {
    top: r(-8),
    left: r(20),
  },
  dot2: {
    top: r(10),
    right: r(-5),
  },
  dot3: {
    bottom: r(-5),
    left: r(15),
  },
  dot4: {
    top: r(25),
    left: r(-8),
  },
  dot5: {
    bottom: r(15),
    right: r(10),
  },
  title: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  message: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    textAlign: 'center',
    marginTop: Spacing[2],
    marginBottom: 0,
    lineHeight: r(24),
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing[3],
    marginTop: Spacing[0],
    marginBottom: 0,
  },
  secondaryButton: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
    borderRadius: r(8),
    borderWidth: r(1),
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colors.black[100],
    fontFamily: FontFamilies.mmedium,
    fontSize: FontSizes.base,
  },
});

export default ConfirmationModal;

