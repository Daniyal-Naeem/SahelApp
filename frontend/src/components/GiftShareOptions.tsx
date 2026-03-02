import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Linking,
} from 'react-native';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {useToast} from '../hooks/useToast';

interface GiftShareOptionsProps {
  giftId: string;
  giftTitle: string;
  recipientName?: string;
  senderName?: string;
  onShareSuccess?: () => void;
}

const GiftShareOptions: React.FC<GiftShareOptionsProps> = ({
  giftId,
  giftTitle,
  recipientName,
  senderName,
  onShareSuccess,
}) => {
  const toast = useToast();
  const [isSharing, setIsSharing] = useState(false);

  // Generate share URL (would typically come from backend)
  const shareUrl = `https://yourapp.com/gift/${giftId}`;

  // Generate share message
  const getShareMessage = () => {
    const baseMessage = `🎁 You've received a gift: ${giftTitle}`;
    const personalizedMessage = recipientName
      ? `${recipientName}, ${baseMessage}`
      : baseMessage;

    if (senderName) {
      return `${personalizedMessage}\n\nFrom: ${senderName}\n\nRedeem your gift: ${shareUrl}`;
    }

    return `${personalizedMessage}\n\nRedeem your gift: ${shareUrl}`;
  };

  // Native share (iOS/Android share sheet)
  const handleNativeShare = async () => {
    try {
      setIsSharing(true);
      const result = await Share.share({
        message: getShareMessage(),
        url: shareUrl,
      });

      if (result.action === Share.sharedAction) {
        toast.showToast('Gift shared successfully!', 'success');
        onShareSuccess?.();
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        toast.showToast('Failed to share gift', 'error');
      }
    } finally {
      setIsSharing(false);
    }
  };

  // WhatsApp share
  const handleWhatsAppShare = async () => {
    try {
      setIsSharing(true);
      const message = getShareMessage();
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        toast.showToast('Opening WhatsApp...', 'info');
        onShareSuccess?.();
      } else {
        toast.showToast('WhatsApp not installed', 'error');
      }
    } catch (error) {
      toast.showToast('Failed to open WhatsApp', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  // SMS share
  const handleSMSShare = async () => {
    try {
      setIsSharing(true);
      const message = getShareMessage();
      const smsUrl = `sms:?body=${encodeURIComponent(message)}`;

      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        toast.showToast('Opening Messages...', 'info');
        onShareSuccess?.();
      } else {
        Alert.alert(
          'SMS Not Available',
          'Please copy the message manually',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Copy Message',
              onPress: async () => {
                try {
                  const Clipboard = await import('@react-native-clipboard/clipboard');
                  Clipboard.default.setString(message);
                  toast.showToast('Message copied to clipboard', 'success');
                  onShareSuccess?.();
                } catch (error) {
                  toast.showToast('Failed to copy message', 'error');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      toast.showToast('Failed to open Messages', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  // Facebook share
  const handleFacebookShare = async () => {
    try {
      setIsSharing(true);
      const message = getShareMessage();

      // Try Facebook app first
      let facebookUrl = `fb://composer?text=${encodeURIComponent(message)}`;

      let canOpen = await Linking.canOpenURL(facebookUrl);
      if (canOpen) {
        await Linking.openURL(facebookUrl);
        toast.showToast('Opening Facebook...', 'info');
        onShareSuccess?.();
        return;
      }

      // Fallback to Facebook web
      facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`;
      canOpen = await Linking.canOpenURL(facebookUrl);

      if (canOpen) {
        await Linking.openURL(facebookUrl);
        toast.showToast('Opening Facebook...', 'info');
        onShareSuccess?.();
      } else {
        toast.showToast('Facebook not available', 'error');
      }
    } catch (error) {
      toast.showToast('Failed to open Facebook', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  // Copy link
  const handleCopyLink = async () => {
    try {
      setIsSharing(true);
      const Clipboard = await import('@react-native-clipboard/clipboard');
      Clipboard.default.setString(shareUrl);
      toast.showToast('Gift link copied to clipboard!', 'success');
      onShareSuccess?.();
    } catch (error) {
      toast.showToast('Failed to copy link', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const shareOptions = [
    {
      id: 'native',
      label: 'Share',
      icon: '📤',
      action: handleNativeShare,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: '💬',
      action: handleWhatsAppShare,
    },
    {
      id: 'sms',
      label: 'SMS',
      icon: '💬',
      action: handleSMSShare,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: '📘',
      action: handleFacebookShare,
    },
    {
      id: 'copy',
      label: 'Copy Link',
      icon: '🔗',
      action: handleCopyLink,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Gift</Text>
      <View style={styles.optionsGrid}>
        {shareOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionButton}
            onPress={option.action}
            disabled={isSharing}
            activeOpacity={0.7}>
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={styles.optionLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing[4],
    backgroundColor: Colors.white,
    borderRadius: r(12),
    marginVertical: Spacing[2],
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: Spacing[3],
  },
  optionButton: {
    alignItems: 'center',
    padding: Spacing[3],
    borderRadius: r(8),
    backgroundColor: Colors.gray[50],
    minWidth: r(70),
    borderWidth: r(1),
    borderColor: Colors.gray[200],
  },
  optionIcon: {
    fontSize: r(24),
    marginBottom: Spacing[2],
  },
  optionLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    textAlign: 'center',
  },
});

export default GiftShareOptions;
