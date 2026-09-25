import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import FastImage from 'react-native-fast-image';
import React, {useState, useRef, useEffect} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {icons} from '../constants';
import {CustomButton, CustomWrapper, FormField, ConfirmationModal} from '../components';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteStackParamList} from '../../App';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {useAppDispatch, useAppSelector} from '../store';
import {getMe, updateProfile, getCreditBalance} from '../services/authService';
import {setUser} from '../store/authSlice';
import {useI18n} from '../i18n/I18nContext';
import {formatMoney} from '../utils/formatMoney';

type Props = {};

const SettingTab = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RouteStackParamList>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {t} = useI18n();
  const authUser = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const scrollViewRef = useRef<ScrollView>(null);
  const addressSectionRef = useRef<View>(null);
  const [addressSectionY, setAddressSectionY] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);

  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '***********',
    pincode: '',
    address: '',
    city: '',
    state: '',
    country: '',
    bankAccountNumber: '',
    accountHolderName: '',
    ifscCode: '',
  });

  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [cityError, setCityError] = useState('');
  const [stateError, setStateError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [bankAccountError, setBankAccountError] = useState('');
  const [accountHolderError, setAccountHolderError] = useState('');
  const [ifscError, setIfscError] = useState('');

  useEffect(() => {
    // Guests can open Profile; prompt sign-in in-place instead of forcing Login.
    if (!isAuthenticated) {
      return;
    }
    const load = async () => {
      try {
        const user = await getMe();
        dispatch(setUser(user));
        setForm(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: (user as any).address?.street || '',
          city: (user as any).address?.city || '',
          state: (user as any).address?.state || '',
          country: (user as any).address?.country || '',
          pincode: (user as any).address?.zipCode || '',
        }));
        if ((user as any).avatar) setProfileImage((user as any).avatar);
        else if ((user as any).profilePicture) setProfileImage((user as any).profilePicture);
        const bal = await getCreditBalance();
        setCredits(bal);
      } catch {
        if (authUser) {
          setForm(prev => ({
            ...prev,
            name: authUser.name || '',
            email: authUser.email || '',
            phone: authUser.phone || '',
          }));
        }
      }
    };
    load();
  }, [isAuthenticated]);

  useFocusEffect(
    React.useCallback(() => {
      const params = (route.params as any);
      if (params?.scrollToAddress && addressSectionY !== null) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({y: addressSectionY - Spacing[4], animated: true});
        }, 300);
      }
    }, [route.params, addressSectionY])
  );

  const handleEditPic = () => {
    setShowImagePickerModal(true);
  };
  
  const handleCameraPress = () => {
    setShowImagePickerModal(false);
    openImagePicker('camera');
  };
  
  const handleGalleryPress = () => {
    setShowImagePickerModal(false);
    openImagePicker('gallery');
  };

  const openImagePicker = (source: 'camera' | 'gallery') => {
    const options = {
      width: 320,
      height: 320,
      cropping: true,
      cropperCircleOverlay: true,
      cropperToolbarTitle: 'Crop Profile Picture',
      cropperChooseText: 'Choose',
      cropperCancelText: 'Cancel',
      compressImageQuality: 0.55,
      includeBase64: true,
      forceJpg: true,
      mediaType: 'photo' as const,
    };

    const applyImage = (image: {path: string; data?: string | null; mime?: string}) => {
      // Persistable URI for MongoDB — local file paths disappear after restart.
      if (image.data) {
        const mime = image.mime || 'image/jpeg';
        setProfileImage(`data:${mime};base64,${image.data}`);
      } else {
        setProfileImage(image.path);
      }
    };

    try {
      if (source === 'camera') {
        ImagePicker.openCamera(options)
          .then(applyImage)
          .catch((error) => {
            if (error.code !== 'E_PICKER_CANCELLED') {
              if (error.code === 'E_PERMISSION_MISSING' || error.message?.includes('permission')) {
                setErrorMessage('Camera permission is required. Please enable it in your device settings.');
              } else {
                setErrorMessage(error.message || 'Failed to open camera');
              }
              setShowErrorModal(true);
            }
          });
      } else {
        ImagePicker.openPicker(options)
          .then(applyImage)
          .catch((error) => {
            if (error.code !== 'E_PICKER_CANCELLED') {
              if (error.code === 'E_PERMISSION_MISSING' || error.message?.includes('permission')) {
                setErrorMessage('Photo library permission is required. Please enable it in your device settings.');
              } else {
                setErrorMessage(error.message || 'Failed to open gallery');
              }
              setShowErrorModal(true);
            }
          });
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred');
      setShowErrorModal(true);
    }
  };

  const handleGoBack = () => {
    
    (navigation as any).navigate('Home');
  };
  const handleChangePassword = () => {
    navigation.navigate('ForgotPassword' as any);
  };

  if (!isAuthenticated) {
    return (
      <CustomWrapper>
        <View style={[styles.guestContainer, {paddingTop: insets.top + Spacing[6]}]}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.guestSubtitle}>
            Browse products freely. Sign in when you are ready to checkout or manage your account.
          </Text>
          <CustomButton
            title="Sign In"
            handlePress={() => navigation.navigate('Login')}
            containerStyle={styles.guestButton}
          />
          <CustomButton
            title="Create Account"
            handlePress={() => navigation.navigate('Signup')}
            containerStyle={styles.guestButtonSecondary}
          />
          <TouchableOpacity onPress={handleGoBack} style={styles.guestLink}>
            <Text style={styles.guestLinkText}>Continue shopping</Text>
          </TouchableOpacity>
        </View>
      </CustomWrapper>
    );
  }

  return (
    <CustomWrapper>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}>
        {/* Header with back arrow and title */}
        <View style={[styles.header, {marginTop: insets.top}]}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <FastImage
              source={icons.next1}
              style={[styles.backIcon, {transform: [{rotate: '180deg'}]}]}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Profile image below title */}
        <View style={styles.profileContainer}>
          <FastImage 
            source={profileImage ? {uri: profileImage} : icons.profile} 
            style={styles.profileImage} 
          />
          <TouchableOpacity
            onPress={handleEditPic}
            style={styles.editButton}>
            <FastImage source={icons.pen} style={styles.editIcon} />
          </TouchableOpacity>
        </View>

        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Personal Details
          </Text>
          <Text style={styles.creditsLine}>
            {t('wallet')}: SAR {formatMoney(credits)}
          </Text>
          <TouchableOpacity
            style={styles.buyCreditsBtn}
            onPress={() => navigation.navigate('BuyCredits' as any)}>
            <Text style={styles.buyCreditsBtnText}>{t('buyCredits')}</Text>
          </TouchableOpacity>
          <FormField
            title="Name"
            value={form.name}
            placeholder="Full Name"
            handleChangeText={(text: string) => {
              setForm({...form, name: text});
            }}
            setError={() => {}}
            error=""
            otherStyles={styles.formField}
            backgroundColor="#FFFFFF"
            borderColor="#C8C8C8"
          />
          <FormField
            title="Email"
            value={form.email}
            placeholder="Email Address"
            handleChangeText={(text: string) => {
              setEmailError('');
              setForm({...form, email: text});
            }}
            setError={setEmailError}
            error={emailError}
            otherStyles={styles.formField}
            backgroundColor="#FFFFFF"
            borderColor="#C8C8C8"
          />
          <FormField
            title="Phone"
            value={form.phone}
            placeholder="Phone"
            handleChangeText={(text: string) => {
              setForm({...form, phone: text});
            }}
            setError={() => {}}
            error=""
            otherStyles={styles.formField}
            backgroundColor="#FFFFFF"
            borderColor="#C8C8C8"
          />
          <View>
            <FormField
              title="Password"
              value={form.password}
              placeholder="Password"
              handleChangeText={(text: string) => {
                setPasswordError('');
                setForm({...form, password: text});
              }}
              setError={setPasswordError}
              error={passwordError}
              otherStyles={styles.formFieldSmall}
              backgroundColor="#FFFFFF"
              borderColor="#C8C8C8"
            />
            <TouchableOpacity onPress={handleChangePassword} style={styles.changePasswordContainer}>
              <Text style={styles.changePassword}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.divider} />
        {/* Business info */}
        <View 
          ref={addressSectionRef} 
          style={styles.section}
          onLayout={(event) => {
            const {y} = event.nativeEvent.layout;
            setAddressSectionY(y);
          }}
        >
          <Text style={styles.sectionTitle}>
            Business Address Details
          </Text>
          <FormField
            title="Pincode"
            value={form.pincode}
            placeholder="Pincode"
            handleChangeText={(text: string) => {
              setPincodeError('');
              setForm({...form, pincode: text});
            }}
            setError={setPincodeError}
            error={pincodeError}
            otherStyles={styles.formField}
            backgroundColor="#FFFFFF"
            borderColor="#C8C8C8"
          />
          <FormField
            title="Address"
            value={form.address}
            placeholder="Address"
            handleChangeText={(text: string) => {
              setAddressError('');
              setForm({...form, address: text});
            }}
            setError={setAddressError}
            error={addressError}
            otherStyles={styles.formField}
            backgroundColor="#FFFFFF"
            borderColor="#C8C8C8"
          />
          <FormField
            title="City"
            value={form.city}
            placeholder="City"
            handleChangeText={(text: string) => {
              setCityError('');
              setForm({...form, city: text});
            }}
            setError={setCityError}
            error={cityError}
            otherStyles={styles.formField}
            backgroundColor="#FFFFFF"
            borderColor="#C8C8C8"
          />
          <FormField
            title="State"
            value={form.state}
            placeholder="State"
            handleChangeText={(text: string) => {
              setStateError('');
              setForm({...form, state: text});
            }}
            setError={setStateError}
            error={stateError}
            otherStyles={styles.formField}
            backgroundColor="#FFFFFF"
            borderColor="#C8C8C8"
          />
          <FormField
            title="Country"
            value={form.country}
            placeholder="Country"
            handleChangeText={(text: string) => {
              setCountryError('');
              setForm({...form, country: text});
            }}
            setError={setCountryError}
            error={countryError}
            otherStyles={styles.formField}
            backgroundColor="#FFFFFF"
            borderColor="#C8C8C8"
          />
        </View>
        <View style={styles.divider} />
        {/* Bank Account Details */}
        <View style={styles.bankSection}>
          <Text style={styles.sectionTitle}>
            Bank Account Details
          </Text>
          <FormField
            title="Bank Account Number"
            value={form.bankAccountNumber}
            placeholder="Bank Account Number"
            handleChangeText={(text: string) => {
              setBankAccountError('');
              setForm({...form, bankAccountNumber: text});
            }}
            setError={setBankAccountError}
            error={bankAccountError}
            otherStyles={styles.formField}
            backgroundColor="#FFFFFF"
            borderColor="#C8C8C8"
          />
          <FormField
            title="Account Holder's Name"
            value={form.accountHolderName}
            placeholder="Account Holder's Name"
            handleChangeText={(text: string) => {
              setAccountHolderError('');
              setForm({...form, accountHolderName: text});
            }}
            setError={setAccountHolderError}
            error={accountHolderError}
            otherStyles={styles.formField}
            backgroundColor="#FFFFFF"
            borderColor="#C8C8C8"
          />
          <FormField
            title="IFSC Code"
            value={form.ifscCode}
            placeholder="IFSC Code"
            handleChangeText={(text: string) => {
              setIfscError('');
              setForm({...form, ifscCode: text});
            }}
            setError={setIfscError}
            error={ifscError}
            otherStyles={styles.formField}
            backgroundColor="#FFFFFF"
            borderColor="#C8C8C8"
          />
        </View>
        {/* save changes */}
        <CustomButton
          title="Save Profile"
          handlePress={async () => {
            if (!authUser?._id) {
              navigation.navigate('Login');
              return;
            }
            setIsSubmitting(true);
            try {
              const updated = await updateProfile(authUser._id, {
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: {
                  street: form.address,
                  city: form.city,
                  state: form.state,
                  country: form.country,
                  zipCode: form.pincode,
                } as any,
                avatar: profileImage || undefined,
              } as any);
              dispatch(setUser(updated));
              Alert.alert('Saved', 'Profile updated successfully');
            } catch (error: any) {
              Alert.alert(
                'Update failed',
                error?.response?.data?.error || error?.message || 'Try again',
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
          isLoading={isSubmitting}
          containerStyle={styles.buttonContainer}
        />
      </ScrollView>
      
      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePickerModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImagePickerModal(false)}>
          <View style={styles.imagePickerModal}>
            <Text style={styles.imagePickerTitle}>Change Profile Picture</Text>
            <Text style={styles.imagePickerMessage}>Choose an option</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handleGalleryPress}>
              <Text style={styles.imagePickerButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handleCameraPress}>
              <Text style={styles.imagePickerButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Error Modal */}
      <ConfirmationModal
        visible={showErrorModal}
        title="Error"
        message={errorMessage}
        secondaryButtonText="OK"
        onSecondaryPress={() => setShowErrorModal(false)}
        onClose={() => setShowErrorModal(false)}
        showIcon={false}
      />
    </CustomWrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  guestContainer: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    justifyContent: 'center',
  },
  guestSubtitle: {
    marginTop: Spacing[4],
    marginBottom: Spacing[6],
    color: Colors.black[100],
    fontFamily: FontFamilies.mregular,
    fontSize: FontSizes.sm,
    lineHeight: r(22),
  },
  guestButton: {
    marginBottom: Spacing[3],
  },
  guestButtonSecondary: {
    marginBottom: Spacing[4],
    backgroundColor: Colors.black[100],
  },
  guestLink: {
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  guestLinkText: {
    color: Colors.primary,
    fontFamily: FontFamilies.mmedium,
    fontSize: FontSizes.sm,
    textDecorationLine: 'underline',
  },
  scrollViewContent: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing[4],
    marginBottom: Spacing[4],
  },
  backButton: {
    width: r(40),
    height: r(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    width: r(24),
    height: r(24),
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  headerRight: {
    width: r(40),
  },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[6],
    position: 'relative',
    width: '100%',
  },
  profileImage: {
    width: r(120),
    height: r(120),
    borderRadius: r(60),
  },
  editButton: {
    width: r(32),
    height: r(32),
    borderRadius: r(16),
    backgroundColor: '#2196F3', // Blue color for edit button
    borderWidth: r(2),
    borderColor: Colors.white,
    position: 'absolute',
    bottom: 0,
    right: '50%',
    marginRight: -r(60) + r(16), // Position at bottom-right of circular image
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    width: r(16),
    height: r(16),
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[3],
  },
  creditsLine: {
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
    marginBottom: Spacing[3],
  },
  buyCreditsBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: r(8),
    marginBottom: Spacing[4],
  },
  buyCreditsBtnText: {
    color: Colors.white,
    fontFamily: FontFamilies.msemibold,
    fontSize: FontSizes.sm,
  },
  section: {
    marginTop: Spacing[6],
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: Spacing[6],
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  bankSection: {
    marginTop: Spacing[6],
  },
  buttonContainer: {
    marginTop: Spacing[8],
    marginBottom: Spacing[4],
  },
  formField: {
    marginBottom: Spacing[6],
  },
  formFieldSmall: {
    marginBottom: Spacing[3],
  },
  changePasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: Spacing[1],
    marginBottom: Spacing[6],
  },
  changePassword: {
    color: Colors.red[600],
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.pmedium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
  },
  imagePickerModal: {
    backgroundColor: Colors.white,
    borderRadius: r(16),
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[8],
    width: '100%',
    maxWidth: r(400),
    alignItems: 'center',
  },
  imagePickerTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[2],
  },
  imagePickerMessage: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    marginBottom: Spacing[6],
  },
  imagePickerButton: {
    width: '100%',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[5],
    borderRadius: r(8),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  imagePickerButtonText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.white,
  },
});

export default SettingTab;
