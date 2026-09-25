import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {I18nManager} from 'react-native';
import {getItem, setItem} from '../utils/AsyncStorage';
import {LangCode, t as translate} from './translations';

type I18nContextValue = {
  lang: LangCode;
  isRTL: boolean;
  setLang: (code: LangCode) => Promise<void>;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider = ({children}: {children: React.ReactNode}) => {
  const [lang, setLangState] = useState<LangCode>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = (await getItem('app_lang')) as string | null;
      if (saved === 'ar' || saved === 'en') {
        setLangState(saved);
        const wantRTL = saved === 'ar';
        if (I18nManager.isRTL !== wantRTL) {
          I18nManager.allowRTL(wantRTL);
          I18nManager.forceRTL(wantRTL);
        }
      }
      setReady(true);
    })();
  }, []);

  const setLang = useCallback(async (code: LangCode) => {
    await setItem('app_lang', code);
    setLangState(code);
    const wantRTL = code === 'ar';
    if (I18nManager.isRTL !== wantRTL) {
      I18nManager.allowRTL(wantRTL);
      I18nManager.forceRTL(wantRTL);
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      isRTL: lang === 'ar',
      setLang,
      t: (key: string) => translate(lang, key),
    }),
    [lang, setLang],
  );

  if (!ready) {
    return null;
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
};
