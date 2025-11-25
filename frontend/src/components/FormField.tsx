import {
  View,
  Animated,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  Easing,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {icons, images} from '../constants';
import {Colors, Spacing, FontSizes, FontFamilies} from '../constants/styles';

type FormFieldProps = {
  title: string;
  value: string;
  placeholder: string;
  handleChangeText: (text: string) => void;
  otherStyles?: ViewStyle;
  setError?: (error: string) => void;
  error: string;
  [key: string]: any; // add more props ...props
};
// make reusable components to make our code clean
const FormField: React.FC<FormFieldProps> = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  setError,
  error,
  ...props
}) => {
  // states
  const [showPassword, setShowPassword] = useState(false);
  const [shakeAnimation] = useState(new Animated.Value(0));
  // let's handle the error
  const shake = () => {
    shakeAnimation.setValue(0);
    Animated.timing(shakeAnimation, {
      toValue: 4,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.bounce,
    }).start(() => {
      // clear the animation after a period of time
      setTimeout(() => {
        setError?.(''); // hide the error
      }, 3000);
    });
  };
  // if error shake
  useEffect(() => {
    if (error) {
      shake();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // get Icon source
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
        // handle shake here with interpolate ..
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
          },
          error && styles.inputContainerError,
        ]}>
        {/* icon => user icon, or password, or email... */}
        <Image
          source={getIconSource()}
          style={styles.icon}
          resizeMode="contain"
          tintColor="#424242"
        />
        {/* TextInput */}
        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          onChangeText={handleChangeText}
          placeholderTextColor={'#9E9E9E'}
          secureTextEntry={title === 'Password' && !showPassword}
          onBlur={() => error && shake()}
          {...props}
        />
        {/* eye switch when it's a password */}

        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              style={styles.eyeIcon}
              resizeMode="contain"
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
    height: 48,
    paddingHorizontal: Spacing[3],
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
