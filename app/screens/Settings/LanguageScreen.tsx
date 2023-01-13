import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

import {LocalizationContext} from '../Translation/Translations';

type languageOptions = {
  [key: string]: string;
};

const LANGUAGES: languageOptions = {
  en: 'English',
  bn: 'বাংলা',
  rbn: 'রাজবংশী (বাংলা)',
  // hi: 'हिन्दी राजबंशी',
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});

interface IProps {
  route: any;
  navigation: any;
}

export default function LanguageScreen({navigation}: IProps) {
  const {
    translations,
    // appLanguage,
    setAppLanguage,
    initializeAppLanguage,
  } = useContext(LocalizationContext);
  initializeAppLanguage();

  const onLanguageSelection = async (currentLang: any) => {
    try {
      setAppLanguage(currentLang as any);
      await AsyncStorage.setItem('PREFERED_LANGUAGE', currentLang);
      Sentry.setTag('app_locale', currentLang);
      navigation.navigate('Home');
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{margin: 15, flex: 1, alignSelf: 'flex-start'}}>
        <Text
          style={{
            fontSize: 32,
            color: '#000',
            fontWeight: 'bold',
            fontFamily: 'sans-serif-medium',
          }}>
          {translations['language.title']}
        </Text>
      </View>
      <View style={{flex: 1}}>
        <Text style={{fontSize: 22}}>
          {translations['language.current']}: {translations['language']}
        </Text>
      </View>
      <View style={{flex: 3}}>
        {translations
          .getAvailableLanguages()
          .map((currentLang: any, i: any) => (
            <View key={i}>
              <TouchableOpacity
                onPress={() => onLanguageSelection(currentLang)}
                style={{
                  width: 0.5 * width,
                  height: 50,
                  borderRadius: 50,
                  margin: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fac030',
                }}>
                <Text style={{fontSize: 18, color: '#000'}}>
                  {LANGUAGES[currentLang]}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
      </View>
    </SafeAreaView>
  );
}
