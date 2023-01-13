import AsyncStorage from '@react-native-community/async-storage';
import React, {createContext, useState} from 'react';
import LocalizedStrings from 'react-native-localization';
import * as RNLocalize from 'react-native-localize';

import en from '../../localization/en.json';
import bn from '../../localization/bn.json';
import rbn from '../../localization/rbn.json';

const DEFAULT_LANGUAGE = 'bn';
const APP_LANGUAGE = 'appLanguage';

const languages = {bn, en, rbn};

const translations = new LocalizedStrings(languages);

export const LocalizationContext = createContext({
  translations,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setAppLanguage: (language: any) => {},
  appLanguage: DEFAULT_LANGUAGE,
  initializeAppLanguage: () => {},
});

export const LocalizationProvider = ({children}: any) => {
  const [appLanguage, setAppLanguage] = useState(DEFAULT_LANGUAGE);

  // 11
  const setLanguage = (language: any) => {
    translations.setLanguage(language);
    setAppLanguage(language);
    AsyncStorage.setItem(APP_LANGUAGE, language); // TODO
  };

  // 12
  const initializeAppLanguage = async () => {
    const currentLanguage = await AsyncStorage.getItem(APP_LANGUAGE);

    if (currentLanguage) {
      setLanguage(currentLanguage);
    } else {
      let localeCode = DEFAULT_LANGUAGE;
      const supportedLocaleCodes = translations.getAvailableLanguages();
      const phoneLocaleCodes = RNLocalize.getLocales().map(
        (locale) => locale.languageCode,
      );
      phoneLocaleCodes.some((code) => {
        if (supportedLocaleCodes.includes(code)) {
          localeCode = code;
          return true;
        }
      });
      setLanguage(localeCode);
    }
  };

  return (
    <LocalizationContext.Provider
      value={{
        translations,
        setAppLanguage: setLanguage as any,
        appLanguage,
        initializeAppLanguage,
      }}>
      {children}
    </LocalizationContext.Provider>
  );
};
