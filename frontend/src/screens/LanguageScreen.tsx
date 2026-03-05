import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {useI18n} from '../contexts/I18nContext';
import type {LocaleKey} from '../constants/locales';

type Language = {
  id: string;
  name: string;
  code: LocaleKey;
  nativeName: string;
};

const LanguageScreen = () => {
  const navigation = useNavigation<any>();
  const {language, setLanguage, t} = useI18n();

  const GoBack = () => {
    navigation.goBack();
  };

  const languages: Language[] = [
    {id: 'en', name: 'English', code: 'en', nativeName: 'English'},
    {id: 'ar', name: 'Arabic', code: 'ar', nativeName: 'العربية'},
  ];

  const handleLanguageSelect = async (code: LocaleKey) => {
    await setLanguage(code);
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title={t('navigation.language')}
        onBackPress={GoBack}
        showBorder={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('settings.language')}</Text>
          <Text style={styles.description}>
            {t('languageScreen.description')}
          </Text>

          <View style={styles.languagesContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.languageItem,
                  language === lang.code && styles.languageItemSelected,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}>
                <View style={styles.languageContent}>
                  <Text style={styles.languageName}>{lang.name}</Text>
                  <Text style={styles.languageNativeName}>{lang.nativeName}</Text>
                </View>
                {language === lang.code && (
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

