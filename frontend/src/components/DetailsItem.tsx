import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {Text, TextInput, TouchableOpacity, View, StyleSheet} from 'react-native';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {dropdownArrow} from '../assets/svgs/dropdownArrow';
interface DetailsItemProps {
  title: string;
  placeholder: string;
  defaultValue?: string;
  showDropdown?: boolean;
}
type RootStackParamList = {
  ForgotPassword: undefined;
  Signup: undefined;
};
const DetailsItem = ({title, placeholder, defaultValue = '', showDropdown = false}: DetailsItemProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [changes, setChanges] = useState(defaultValue);
  const [showPassword] = useState(false);
  const handleChangePassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={placeholder}
          style={styles.input}
          placeholderTextColor={'#0F0E0E73'}
          onChangeText={(e: string) => setChanges(e)}
          value={changes}
          secureTextEntry={title === 'Password' && !showPassword}
        />
        {showDropdown && (
          <View style={styles.dropdownIcon}>
            <SvgXml xml={dropdownArrow} width={r(16)} height={r(16)} />
          </View>
        )}
      </View>
      {title === 'Password' && (
        <TouchableOpacity onPress={handleChangePassword} style={styles.changePasswordContainer}>
          <Text style={styles.changePassword}>
            Change Password
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginTop: Spacing[3],
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '400',
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[500],
    color: Colors.black[100],
    fontFamily: FontFamilies.psemibold,
    fontSize: FontSizes.lg,
    borderRadius: 12,
    marginTop: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[4],
    flex: 1,
  },
  dropdownIcon: {
    position: 'absolute',
    right: Spacing[3],
    top: Spacing[1] + Spacing[4] + r(2),
  },
  changePasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: Spacing[1],
  },
  changePassword: {
    color: Colors.red[600],
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.pmedium,
  },
});

export default DetailsItem;
