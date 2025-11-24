import {View, Text, TextInput} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CustomButton} from '../components';

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
    <View className="flex-1 bg-white">
      <View className="px-5 pt-28">
        {/* Title */}
        <Text className="text-3xl text-black mb-4" style={{fontFamily: 'Montserrat-SemiBold'}}>
          Enter Code
        </Text>

        {/* Instructions */}
        <Text className="text-base text-black/60 mb-2">
          Enter 4-digit code we sent you on your number.
        </Text>

        {/* Phone Number */}
        <Text className="text-base text-black/60 mb-10">
          +98*******00
        </Text>

        {/* OTP Input Fields */}
        <View className="flex-row justify-center items-center mb-8">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              className="w-16 h-16 rounded-full border border-gray-300 bg-gray-50 text-center text-2xl font-bold text-black mx-3"
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
          containerStyle=""
        />
      </View>
    </View>
  );
};

export default OTPScreen;

