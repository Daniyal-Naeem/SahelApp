import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {CustomButton, FormField} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {googleIcon} from '../assets/svgs/googleIcon';
import AppleIcon from '../assets/svgs/Apple.svg';
import FacebookIcon from '../assets/svgs/Facebook.svg';

type Props = {};
// let's go with get started first
const SignupScreen = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, _setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  type RootStackParamList = {
    ForgotPassword: undefined;
    Login: undefined;
  };
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  const validateForm = () => {
    let isValid = true;

    const emailError = validateEmail(form.email);
    if (emailError) {
      setEmailError(emailError);
      isValid = false;
    }

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setPasswordError(passwordError);
      isValid = false;
    }

    const confirmPasswordError = validateConfirmPassword(form.confirmPassword, form.password);
    if (confirmPasswordError) {
      setPasswordError(confirmPasswordError);
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = () => {
    if (validateForm()) {
      // Proceed with signup logic
      console.log('Form is valid, proceed with signup');
    }
  };

  const handleSignInWithProvider = () => {};
  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
  };
  return (
    <View style={styles.container}>
      <Text style={[styles.title, {fontFamily: FontFamilies.msemibold}]}>
        Create an account
      </Text>
      <View>
        {/* text input */}
        <FormField
          title="Username or Email"
          value={form.email}
          setError={setEmailError}
          error={emailError}
          handleChangeText={(e: any) => {
            setEmailError('');
            setForm({...form, email: e});
          }}
          onBlur={() => {
            const error = validateEmail(form.email);
            if (error) setEmailError(error);
          }}
          placeholder="Username or Email"
          otherStyles={styles.formField}
        />
        <View>
          <FormField
            title="Password"
            value={form.password}
            setError={setPasswordError}
            error={passwordError}
            handleChangeText={(e: any) => {
              setPasswordError('');
              setForm({...form, password: e});
            }}
            onBlur={() => {
              const error = validatePassword(form.password);
              if (error) setPasswordError(error);
            }}
            placeholder="Password"
            otherStyles={styles.formField}
          />
          <FormField
            title="Confirm Password"
            value={form.confirmPassword}
            setError={setPasswordError}
            error={passwordError}
            handleChangeText={(e: any) => {
              setPasswordError('');
              setForm({...form, confirmPassword: e});
            }}
            onBlur={() => {
              const error = validateConfirmPassword(form.confirmPassword, form.password);
              if (error) setPasswordError(error);
            }}
            placeholder="Confirm Password"
            otherStyles={styles.formField}
          />

          <Text style={[styles.termsText, {fontFamily: FontFamilies.mmedium}]}>
            By clicking the <Text style={styles.termsTextPrimary}>Register</Text> button, you agree to the public offer
          </Text>
        </View>
        {/* submit btn */}
        <CustomButton
          title="Create Account"
          handlePress={handleLogin}
          isLoading={isSubmitting}
          containerStyle={styles.buttonContainer}
        />
        {/* or continue with  */}
        <View style={styles.centerContainer}>
          <View style={styles.dividerContainer}>
        
            <Text style={styles.dividerText}>
              - OR Continue with -
            </Text>
        
          </View>
          <View style={styles.socialContainer}>
            <TouchableOpacity onPress={handleSignInWithProvider} style={styles.socialButton}>
              <SvgXml xml={googleIcon} width={r(24)} height={r(24)} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignInWithProvider} style={styles.socialButton}>
              <AppleIcon width={r(24)} height={r(24)} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignInWithProvider} style={styles.socialButton}>
              <FacebookIcon width={r(24)} height={r(24)} />
            </TouchableOpacity>
          </View>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              I Already Have an Account
            </Text>
            <TouchableOpacity onPress={handleNavigateToLogin}>
              <Text style={[styles.loginLink, {fontFamily: FontFamilies.mbold}]}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Spacing[28],
  },
  title: {
    fontSize: FontSizes['3xl'],
    marginBottom: Spacing[8],
  },
  formField: {
    marginBottom: Spacing[6],
  },
  termsText: {
    color: '#676767',
    fontSize: FontSizes.xs,
    marginBottom: Spacing[6],
    marginTop: Spacing[2],
  },
  termsTextPrimary: {
    color: Colors.primary,
  },
  buttonContainer: {
    marginBottom: Spacing[8],
  },
  centerContainer: {
    alignSelf: 'center',
    marginTop: Spacing[4],
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[5],
  },
  divider: {
    flex: 1,
    height: r(1),
    backgroundColor: Colors.gray[300],
  },
  dividerText: {
    color: '#575757',
    fontSize: FontSizes.xs,
    marginHorizontal: Spacing[3],
  },
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[6],
    justifyContent: 'center',
  },
  socialButton: {
    width: r(48),
    height: r(48),
    borderRadius: r(24),
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r(4),
    justifyContent: 'center',
  },
  loginText: {
    color: '#575757',
    fontSize: FontSizes.sm,
  },
  loginLink: {
    fontSize: FontSizes.sm,
    textDecorationLine: 'underline',
    color: Colors.action,
  },
});

export default SignupScreen;
