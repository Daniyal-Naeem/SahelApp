import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import CheckIcon from '../assets/svgs/check.svg';

interface UserMessageBubbleProps {
  text: string;
  isIssue?: boolean;
}

const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({text, isIssue = false}) => {
  return (
    <View style={styles.userMessageContainer}>
      <LinearGradient
        colors={['#FFCA28', '#F1D534']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.userMessageBubble}>
        {isIssue && (
          <View style={styles.checkmarkContainer}>
            <CheckIcon width={r(24)} height={r(24)} />
          </View>
        )}
        <Text style={styles.userMessageText}>{text}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: Spacing[2],
    paddingRight: Spacing[5],
  },
  userMessageBubble: {
    borderRadius: r(10),
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '80%',
  },
  checkmarkContainer: {
    marginRight: Spacing[2],
  },
  userMessageText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
    // flex: 1,
  },
});

export default UserMessageBubble;

