import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import React, {useState} from 'react';
import {icons} from '../constants';
import {CustomButton, CustomWrapper, DetailsItem} from '../components';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteStackParamList} from '../../App';
import {Colors, Spacing, FontSizes, FontFamilies} from '../constants/styles';

type Props = {};

const SettingTab = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RouteStackParamList>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = () => {};
  const handleSignInWithProvider = () => {};
  const handleNavigateToSignUp = () => {
    navigation.navigate('Signup');
  };
  const handleEditPic = () => {};
  return (
    <CustomWrapper>
      <View style={styles.container}>
        {/* image profile */}
        <View style={styles.profileContainer}>
          <FastImage source={icons.profile} style={styles.profileImage} />
          <TouchableOpacity
            onPress={handleEditPic}
            style={styles.editButton}>
            <FastImage source={icons.pen} style={styles.editIcon} />
          </TouchableOpacity>
        </View>
        {/* Personal Details */}
        <View>
          <Text style={styles.sectionTitle}>
            Personal Details
          </Text>
          <FlatList
            data={personalDetailsData}
            renderItem={({item}) => (
              <DetailsItem title={item.title} placeholder={item.placeholder} />
            )}
            keyExtractor={item => item.id.toString()}
          />
        </View>
        <View style={styles.divider} />
        {/* Business info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Business Address Details
          </Text>
          <FlatList
            data={businessData}
            renderItem={({item}) => (
              <DetailsItem title={item.title} placeholder={item.placeholder} />
            )}
            keyExtractor={item => item.id.toString()}
          />
        </View>
        <View style={styles.divider} />
        {/* Bank Account Details */}
        <View style={styles.bankSection}>
          <Text style={styles.sectionTitle}>
            Bank Account Details
          </Text>
          <FlatList
            data={bankData}
            renderItem={({item}) => (
              <DetailsItem title={item.title} placeholder={item.placeholder} />
            )}
            keyExtractor={item => item.id.toString()}
          />
        </View>
        {/* save changes */}
        <CustomButton
          title="Login"
          handlePress={handleLogin}
          isLoading={isSubmitting}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </CustomWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing[2],
    paddingHorizontal: Spacing[5], // Consistent horizontal padding
  },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 9999,
  },
  editButton: {
    padding: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 9999,
    backgroundColor: Colors.blue[500],
    position: 'absolute',
    bottom: Spacing[3],
    right: '31%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    width: 24,
    height: 24,
  },
  sectionTitle: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  section: {
    marginTop: Spacing[4],
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: Spacing[5],
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  bankSection: {
    marginVertical: Spacing[4],
  },
  buttonContainer: {
    marginTop: 28,
    paddingVertical: Spacing[5],
  },
});

export default SettingTab;

interface personalDetailsDataType {
  id: number;
  title: string;
  placeholder: string;
}

const personalDetailsData: personalDetailsDataType[] = [
  {
    id: 0,
    title: 'Email Address',
    placeholder: 'Email Address',
  },
  {
    id: 1,
    title: 'Password',
    placeholder: 'Password',
  },
];

const businessData: personalDetailsDataType[] = [
  {
    id: 0,
    title: 'Pincode',
    placeholder: '450116',
  },
  {
    id: 1,
    title: 'Address',
    placeholder: " 216 St Paul's Rd, ",
  },
  {
    id: 2,
    title: 'City',
    placeholder: 'London',
  },
  {
    id: 3,
    title: 'State',
    placeholder: 'N1 2LL,',
  },
  {
    id: 4,
    title: 'Country',
    placeholder: 'United Kingdom',
  },
];
const bankData: personalDetailsDataType[] = [
  {
    id: 0,
    title: 'Bank Account Number',
    placeholder: '204356XXXXXXX',
  },
  {
    id: 1,
    title: 'Account Holder’s Name',
    placeholder: 'Abhiraj Sisodiya',
  },
  {
    id: 2,
    title: 'IFSC Code',
    placeholder: 'SBIN00428',
  },
];
