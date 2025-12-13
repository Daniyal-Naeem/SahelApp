import {
  View,
  Animated,
  TextInput,
  TouchableOpacity,
  Text,
  Easing,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import React, {useEffect, useState} from 'react';
import {icons, images} from '../constants';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';

type FormFieldProps = {
  title: string;
  value: string;
  placeholder: string;
  handleChangeText: (text: string) => void;
  otherStyles?: ViewStyle;
  setError?: (error: string) => void;
  error: string;
  backgroundColor?: string;
  borderColor?: string;
  [key: string]: any;
};
const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  setError,
  error,
  backgroundColor,
  borderColor,
  ...props
}: FormFieldProps) => {
  const isMultiline = props.multiline || false;
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [shakeAnimation] = useState(new Animated.Value(0));

  const shake = () => {
    shakeAnimation.setValue(0);
    Animated.timing(shakeAnimation, {
      toValue: 4,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.bounce,
    }).start(() => {
      setTimeout(() => {
        setError?.('');
      }, 3000);
    });
  };

  useEffect(() => {
    if (error) {
      shake();
    }
  }, [error]);

  const getIconSource = () => {
    if (title === 'Password') return icons.lock;
    if (title === 'Email') return icons.mail;
    if (title === 'Username or Email') return images.user;
    if (title === 'Confirm Password') return icons.lock;
    return images.user; //default one!
  };

  return (
    <View style={otherStyles}>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            transform: [
              {
                translateX: shakeAnimation.interpolate({
                  inputRange: [0, 1, 2, 3, 4],
                  outputRange: [0, -10, 10, -10, 0],
                }),
              },
            ],
            backgroundColor: backgroundColor || '#F5F5F5',
            borderColor: error 
              ? Colors.red[600] 
              : isFocused 
                ? Colors.primary 
                : (borderColor || '#E5E5E5'),
          },
          error && styles.inputContainerError,
        ]}>
        {/* icon => user icon, or password, or email... */}
        <FastImage
          source={getIconSource()}
          style={styles.icon}
          resizeMode={FastImage.resizeMode.contain}
          tintColor="#424242"
        />
        <TextInput
          style={[styles.input, isMultiline && styles.inputMultiline]}
          value={value}
          placeholder={placeholder}
          onChangeText={handleChangeText}
          placeholderTextColor={'#9E9E9E'}
          secureTextEntry={(title === 'Password' || title === 'Confirm Password') && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (error) {
              shake();
            }
          }}
          {...props}
        />
        {/* eye switch when it's a password */}

        {(title === 'Password' || title === 'Confirm Password') && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FastImage
              source={showPassword ? icons.eye : icons.eyeHide}
              style={styles.eyeIcon}
              resizeMode={FastImage.resizeMode.contain}
              tintColor="#424242"
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {/* display the error here if there... */}
      {error && (
        <View style={styles.errorText}>
          <Text style={styles.errorTextContent}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    width: '100%',
    minHeight: 48,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputContainerError: {
    borderWidth: 1,
    borderColor: Colors.red[600],
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: Spacing[2],
  },
  input: {
    flex: 1,
    color: Colors.black[100],
    fontFamily: FontFamilies.mmedium,
    fontSize: FontSizes.sm,
  },
  inputMultiline: {
    minHeight: r(80),
    textAlignVertical: 'top',
    paddingTop: Spacing[2],
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  errorText: {
    marginTop: Spacing[3],
    alignSelf: 'center',
  },
  errorTextContent: {
    color: Colors.red[500],
    fontFamily: FontFamilies.mregular,
    fontSize: FontSizes.sm,
  },
});

export default FormField;
