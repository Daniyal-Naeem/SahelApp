import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';

type Language = {
  id: string;
  name: string;
  code: string;
  nativeName: string;
};

const LanguageScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const GoBack = () => {
    navigation.goBack();
  };

  const languages: Language[] = [
    {id: 'en', name: 'English', code: 'en', nativeName: 'English'},
    {id: 'ar', name: 'Arabic', code: 'ar', nativeName: 'العربية'},
  ];

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Language"
        onBackPress={GoBack}
        showBorder={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Select Language</Text>
          <Text style={styles.description}>
            Choose your preferred language for the app interface.
          </Text>

          <View style={styles.languagesContainer}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.id}
                style={[
                  styles.languageItem,
                  selectedLanguage === language.code && styles.languageItemSelected,
                ]}
                onPress={() => handleLanguageSelect(language.code)}>
                <View style={styles.languageContent}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNativeName}>{language.nativeName}</Text>
                </View>
                {selectedLanguage === language.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[3],
  },
  description: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
    lineHeight: r(24),
    marginBottom: Spacing[6],
  },
  languagesContainer: {
    marginTop: Spacing[4],
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.white,
    borderRadius: r(12),
    marginBottom: Spacing[3],
    borderWidth: r(1),
    borderColor: Colors.gray[200] || '#E5E7EB',
  },
  languageItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF0F0',
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  languageNativeName: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
  },
  checkmark: {
    width: r(24),
    height: r(24),
    borderRadius: r(12),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing[3],
  },
  checkmarkText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mbold,
  },
});

export default LanguageScreen;

