import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locales, LocaleKey } from '../constants/locales';

interface I18nContextType {
  language: LocaleKey;
  t: (key: string, defaultValue?: string) => string;
  setLanguage: (language: LocaleKey) => Promise<void>;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@app_language';

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LocaleKey>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Determine if current language is RTL
  const isRTL = language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
          setLanguageState(savedLanguage as LocaleKey);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  // Update RTL layout when language changes
  useEffect(() => {
    const updateRTL = async () => {
      const currentRTL = I18nManager.isRTL;
      const shouldBeRTL = isRTL;

      if (currentRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        // Note: In a real app, you might want to restart the app or show a restart prompt
        // For now, we'll just update the layout direction
      }
    };

    updateRTL();
  }, [isRTL]);

  // Translation function
  const t = (key: string, defaultValue?: string): string => {
    try {
      const keys = key.split('.');
      let value: any = locales[language];

      // Navigate through nested object
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Key not found, return default value or key itself
          return defaultValue || key;
        }
      }

      // Return the translated value if it's a string
      if (typeof value === 'string') {
        return value;
      }

      // If value is an object or not found, return default or key
      return defaultValue || key;
    } catch (error) {
      console.error('Translation error for key:', key, error);
      return defaultValue || key;
    }
  };

  // Set language function
  const setLanguage = async (newLanguage: LocaleKey): Promise<void> => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
      throw error;
    }
  };

  const contextValue: I18nContextType = {
    language,
    t,
    setLanguage,
    isRTL,
    direction,
  };

  // Don't render children until language is loaded
  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use i18n context
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Helper hook for translation
export const useTranslation = () => {
  const { t } = useI18n();
  return { t };
};