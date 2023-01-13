import React, {useEffect, useContext} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

import {LocalizationContext} from '../Translation/Translations';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 0.653 * height,
    width: width,
  },
  title: {
    transform: [{rotate: '-90deg'}],
    fontSize: 0.15 * width,
    bottom: 0.55 * height,
    left: 0.4 * width,
    lineHeight: 76,
    color: '#fff',
  },
  linearGradient: {
    borderColor: '#000',
    width: width,
    height: 0.7333333333 * height,
    borderBottomRightRadius: 0.1875 * width,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    bottom: 0.08 * height,
  },
  footer: {
    flex: 1,
    width: width,
  },
  appdetails: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 0.1875 * width,
    justifyContent: 'center',
  },
  appname: {
    fontSize: 0.056 * height,
    bottom: 0.03 * height,
    left: 0.33 * width,
  },
});

interface IProps {
  navigation: any;
}

export default function SplashScreen({navigation}: IProps) {
  const {translations, initializeAppLanguage} = useContext(LocalizationContext);
  initializeAppLanguage();

  const gotoApp = async () => {
    try {
      setTimeout(async () => {
        const onboardingScreenShown = await AsyncStorage.getItem(
          'ONBOARDING_SCREEN_SHOWN',
        );
        if (!onboardingScreenShown || onboardingScreenShown !== 'DONE') {
          // navigation.navigate('Onboarding');
          navigation.navigate('HomeTabs'); // TODO
          // await AsyncStorage.setItem('ONBOARDING_SCREEN_SHOWN', 'DONE');
        } else {
          navigation.navigate('HomeTabs');
        }
      }, 40);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    gotoApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          colors={['#48a05e', '#48a05e', '#72cd90']}
          style={styles.linearGradient}
        />
        <Text style={styles.title}>{translations['splash.message']}</Text>
      </View>
      <View style={styles.footer}>
        <View
          style={{...StyleSheet.absoluteFillObject, backgroundColor: '#48a05e'}}
        />
        <View style={styles.appdetails}>
          <Text style={styles.appname}>{translations['appname']}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
