import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {shareIcon} from '../assets/svgs/shareIcon';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  shareProduct,
  shareViaWhatsApp,
  shareViaSMS,
  shareViaFacebook,
  copyToClipboard,
  generateProductShareUrl,
  generateProductShareMessage,
  type ShareOptions,
} from '../utils/shareUtils';
import {ItemDetails} from '../constants/types';

interface ShareButtonProps {
  product: ItemDetails;
  style?: any;
  iconSize?: number;
  showLabel?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  product,
  style,
  iconSize = 24,
  showLabel = false,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleSharePress = () => {
    setShowShareModal(true);
  };

  const handleShareOption = async (option: string) => {
    setShowShareModal(false);
    
    const message = generateProductShareMessage(product);
    const url = generateProductShareUrl(product._id || '');

    try {
      switch (option) {
        case 'native':
          await shareProduct(product);
          break;
        case 'whatsapp':
          await shareViaWhatsApp(message);
          break;
        case 'sms':
          await shareViaSMS(message);
          break;
        case 'facebook':
          await shareViaFacebook(url, message);
          break;
        case 'copy':
          await copyToClipboard(url);
          break;
        default:
          await shareProduct(product);
      }
    } catch (error: any) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.shareButton, style]}
        onPress={handleSharePress}
        activeOpacity={0.7}>
        <SvgXml xml={shareIcon} width={iconSize} height={iconSize} />
        {showLabel && <Text style={styles.shareLabel}>Share</Text>}
      </TouchableOpacity>

      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Product</Text>
            <Text style={styles.modalSubtitle}>
              Choose how you want to share
            </Text>

            <View style={styles.shareOptionsContainer}>
              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('native')}>
                <Text style={styles.shareOptionIcon}>📤</Text>
                <Text style={styles.shareOptionText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('whatsapp')}>
                <Text style={styles.shareOptionIcon}>💬</Text>
                <Text style={styles.shareOptionText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('sms')}>
                <Text style={styles.shareOptionIcon}>📱</Text>
                <Text style={styles.shareOptionText}>SMS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('facebook')}>
                <Text style={styles.shareOptionIcon}>👥</Text>
                <Text style={styles.shareOptionText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('copy')}>
                <Text style={styles.shareOptionIcon}>🔗</Text>
                <Text style={styles.shareOptionText}>Copy Link</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowShareModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: r(4),
    padding: r(8),
  },
  shareLabel: {
    fontSize: FontSizes.sm,
    color: Colors.black[100],
    fontFamily: FontFamilies.mregular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: r(16),
    padding: Spacing[6],
    width: '85%',
    maxWidth: r(400),
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  modalSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
    textAlign: 'center',
    marginBottom: Spacing[6],
  },
  shareOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing[5],
  },
  shareOption: {
    width: '30%',
    alignItems: 'center',
    padding: Spacing[4],
    borderRadius: r(12),
    backgroundColor: Colors.gray[100],
    marginBottom: Spacing[3],
  },
  shareOptionIcon: {
    fontSize: r(32),
    marginBottom: Spacing[2],
  },
  shareOptionText: {
    fontSize: FontSizes.sm,
    color: Colors.black[100],
    fontFamily: FontFamilies.mregular,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: Spacing[4],
    borderRadius: r(12),
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSizes.base,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
  },
});

export default ShareButton;
