import {View, Text, TextInput, StyleSheet} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CustomButton} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';

type Props = {};

const OTPScreen = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  type RootStackParamList = {
    ResetPassword: undefined;
  };

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChangeText = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      // If pasting multiple digits, distribute them
      const digits = digit.slice(0, 4).split('');
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (index + i < 4) {
          newCode[index + i] = d;
        }
      });
      setCode(newCode);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + digits.length, 3);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Single digit input
      const newCode = [...code];
      newCode[index] = digit;
      setCode(newCode);
      
      // Auto-focus next input if digit entered
      if (digit && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace to go to previous input
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleNext = () => {
    // Handle next button press
    const fullCode = code.join('');
    if (fullCode.length === 4) {
      // Navigate to ResetPassword screen after OTP verification
      navigation.navigate('ResetPassword');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, {fontFamily: FontFamilies.msemibold}]}>
          Enter Code
        </Text>

        {/* Instructions */}
        <Text style={styles.instruction}>
          Enter 4-digit code we sent you on your number.
        </Text>

        {/* Phone Number */}
        <Text style={styles.phoneNumber}>
          +98*******00
        </Text>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              style={styles.otpInput}
              value={digit}
              onChangeText={text => handleChangeText(text, index)}
              onKeyPress={({nativeEvent}) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Next Button - Below OTP boxes */}
        <CustomButton
          title="Next"
          handlePress={handleNext}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[5], // Consistent horizontal padding
  },
  content: {
    paddingTop: Spacing[28],
  },
  title: {
    fontSize: FontSizes['3xl'],
    color: Colors.black[100],
    marginBottom: Spacing[6],
  },
  instruction: {
    fontSize: FontSizes.base,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: Spacing[3],
  },
  phoneNumber: {
    fontSize: FontSizes.base,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: Spacing[12],
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[10],
  },
  otpInput: {
    width: r(64),
    height: r(64),
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.gray[50],
    textAlign: 'center',
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.black[100],
    marginHorizontal: Spacing[4],
  },
});

export default OTPScreen;

