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
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  type RootStackParamList = {
    ResetPassword: undefined;
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const isOTPComplete = code.every(digit => digit.length === 1);

  const handleChangeText = (text: string, index: number) => {
    if (error) setError('');
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      const digits = digit.slice(0, 4).split('');
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (index + i < 4) {
          newCode[index + i] = d;
        }
      });
      setCode(newCode);

      const nextIndex = Math.min(index + digits.length, 3);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = digit;
      setCode(newCode);

      if (digit && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleNext = () => {
    const fullCode = code.join('');
    if (fullCode.length === 4) {
      setError('');
      navigation.navigate('ResetPassword');
    } else {
      setError('Please enter the complete 4-digit code');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, {fontFamily: FontFamilies.msemibold}]}>
          Enter Code
        </Text>

        <Text style={styles.instruction}>
          Enter 4-digit code we sent you on your number.
        </Text>

        <Text style={styles.phoneNumber}>
          +98*******00
        </Text>

        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : styles.otpInputEmpty,
                error ? styles.otpInputError : null,
              ]}
              value={digit}
              onChangeText={text => handleChangeText(text, index)}
              onKeyPress={({nativeEvent}) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <CustomButton
          title="Next"
          handlePress={handleNext}
          disabled={!isOTPComplete}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[5],
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
  otpInputFilled: {
    borderColor: Colors.action,
    backgroundColor: Colors.white,
  },
  otpInputEmpty: {
    borderColor: Colors.gray[300],
    backgroundColor: Colors.gray[50],
  },
  otpInputError: {
    borderColor: Colors.red[500],
  },
  errorText: {
    color: Colors.red[500],
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing[4],
    fontFamily: FontFamilies.mmedium,
  },
});

export default OTPScreen;

