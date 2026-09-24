import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CommonActions} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {CustomButton, FormField} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {googleIcon} from '../assets/svgs/googleIcon';
import AppleIcon from '../assets/svgs/Apple.svg';
import FacebookIcon from '../assets/svgs/Facebook.svg';
import {register} from '../services/authService';
import {useAppDispatch} from '../store';
import {setCredentials} from '../store/authSlice';
import {RouteStackParamList} from '../../App';

type Props = {};
type SignupRoute = RouteProp<RouteStackParamList, 'Signup'>;

const SignupScreen = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RouteStackParamList>>();
  const route = useRoute<SignupRoute>();
  const redirect = route.params?.redirect;
  const dispatch = useAppDispatch();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<'user' | 'vendor'>('user');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters long';
    return '';
  };

  const validateForm = () => {
    let isValid = true;
    if (!form.name.trim()) {
      setNameError('Name is required');
      isValid = false;
    }
    const emailErr = validateEmail(form.email);
    if (emailErr) {
      setEmailError(emailErr);
      isValid = false;
    }
    const passwordErr = validatePassword(form.password);
    if (passwordErr) {
      setPasswordError(passwordErr);
      isValid = false;
    }
    if (form.confirmPassword !== form.password) {
      setPasswordError('Passwords do not match');
      isValid = false;
    }
    if (role === 'vendor' && !form.businessName.trim()) {
      Alert.alert('Business name required', 'Vendors must provide a business name.');
      isValid = false;
    }
    return isValid;
  };

  const goAfterAuth = () => {
    if (redirect === 'Checkout') {
      navigation.replace('Checkout');
      return;
    }
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'HomeScreen'}],
      }),
    );
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const result = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        businessName: role === 'vendor' ? form.businessName.trim() : undefined,
      });
      dispatch(setCredentials({token: result.token, user: result.user}));
      if (role === 'vendor' && result.user.vendorStatus !== 'approved') {
        Alert.alert(
          'Vendor account created',
          'Your vendor account is pending admin approval. You can browse as a customer until then.',
        );
      }
      goAfterAuth();
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Signup failed. Please try again.';
      Alert.alert('Signup failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInWithProvider = () => {
    Alert.alert(
      'Coming soon',
      'Social login is not available in this demo. Please use email and password.',
    );
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login', redirect ? {redirect} : undefined);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, {fontFamily: FontFamilies.msemibold}]}>
        Create an account
      </Text>

      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleChip, role === 'user' && styles.roleChipActive]}
          onPress={() => setRole('user')}>
          <Text
            style={[
              styles.roleChipText,
              role === 'user' && styles.roleChipTextActive,
            ]}>
            Customer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleChip, role === 'vendor' && styles.roleChipActive]}
          onPress={() => setRole('vendor')}>
          <Text
            style={[
              styles.roleChipText,
              role === 'vendor' && styles.roleChipTextActive,
            ]}>
            Vendor
          </Text>
        </TouchableOpacity>
      </View>

      <FormField
        title="Full Name"
        value={form.name}
        setError={setNameError}
        error={nameError}
        handleChangeText={(e: any) => {
          setNameError('');
          setForm({...form, name: e});
        }}
        placeholder="Full Name"
        otherStyles={styles.formField}
      />
      <FormField
        title="Email"
        value={form.email}
        setError={setEmailError}
        error={emailError}
        handleChangeText={(e: any) => {
          setEmailError('');
          setForm({...form, email: e});
        }}
        placeholder="Email"
        otherStyles={styles.formField}
      />
      {role === 'vendor' && (
        <FormField
          title="Business Name"
          value={form.businessName}
          setError={() => {}}
          error=""
          handleChangeText={(e: any) => setForm({...form, businessName: e})}
          placeholder="Business Name"
          otherStyles={styles.formField}
        />
      )}
      <FormField
        title="Password"
        value={form.password}
        setError={setPasswordError}
        error={passwordError}
        handleChangeText={(e: any) => {
          setPasswordError('');
          setForm({...form, password: e});
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
        placeholder="Confirm Password"
        otherStyles={styles.formField}
      />

      <Text style={[styles.termsText, {fontFamily: FontFamilies.mmedium}]}>
        By clicking the <Text style={styles.termsTextPrimary}>Register</Text>{' '}
        button, you agree to the public offer
      </Text>

      <CustomButton
        title="Create Account"
        handlePress={handleSignup}
        isLoading={isSubmitting}
        containerStyle={styles.buttonContainer}
      />

      <View style={styles.centerContainer}>
        <View style={styles.dividerContainer}>
          <Text style={styles.dividerText}>- OR Continue with -</Text>
        </View>
        <View style={styles.socialContainer}>
          <TouchableOpacity
            onPress={handleSignInWithProvider}
            style={styles.socialButton}>
            <SvgXml xml={googleIcon} width={r(24)} height={r(24)} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSignInWithProvider}
            style={styles.socialButton}>
            <AppleIcon width={r(24)} height={r(24)} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSignInWithProvider}
            style={styles.socialButton}>
            <FacebookIcon width={r(24)} height={r(24)} />
          </TouchableOpacity>
        </View>
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>I Already Have an Account</Text>
          <TouchableOpacity onPress={handleNavigateToLogin}>
            <Text style={[styles.loginLink, {fontFamily: FontFamilies.mbold}]}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {flex: 1, backgroundColor: Colors.white},
  container: {
    paddingHorizontal: Spacing[5],
    backgroundColor: Colors.white,
    paddingTop: Spacing[20],
    paddingBottom: Spacing[10],
  },
  title: {
    fontSize: FontSizes['3xl'],
    marginBottom: Spacing[6],
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[6],
  },
  roleChip: {
    flex: 1,
    paddingVertical: Spacing[3],
    borderRadius: r(8),
    borderWidth: 1,
    borderColor: Colors.gray[300],
    alignItems: 'center',
  },
  roleChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  roleChipText: {
    color: '#575757',
    fontFamily: FontFamilies.mmedium,
  },
  roleChipTextActive: {
    color: Colors.white,
  },
  formField: {
    marginBottom: Spacing[4],
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
