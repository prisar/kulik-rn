import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableNativeFeedback,
  Platform,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-community/async-storage';
import remoteConfig from '@react-native-firebase/remote-config';
import Animated from 'react-native-reanimated';
import * as Sentry from '@sentry/react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import {User} from '../../store/user/model';
import {selectLoggedInUser} from '../../store/auth/selectors';
import {LocalizationContext} from '../Translation/Translations';
import WaStickersModule from '../../native/WaStickersModule';
import {wait} from '../../utils/wait';
const screentransition = require('../../assets/animations/screen-transition.json');

const {width, height} = Dimensions.get('window');
const IMAGE_HEIGHT = 120;
const IMAGE_WIDTH = 120;
const SPACING = 20;
const HEADER_HEIGHT =
  Platform.OS === 'ios' ? 135 : 80 + (StatusBar.currentHeight as number);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  card: {
    width: width - SPACING,
    height: 150,
    elevation: 3,
    borderRadius: 16,
    margin: 5,
    marginVertical: 10,
    padding: SPACING,
    // backgroundColor: '#f9fafc',
  },
  cardTitle: {
    fontSize: 23,
    fontWeight: '700',
    fontFamily: 'sans-serif',
    // color: '#206ec4',
  },
  cardDescription: {
    fontSize: 11,
    opacity: 0.7,
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
    right: SPACING,
  },
  voice: {
    width: IMAGE_WIDTH / 4,
    height: IMAGE_HEIGHT / 4,
    resizeMode: 'contain',
  },
});

export function HomeScreen() {
  const [coins, setCoins] = useState(0);
  const [language, setLanguage] = useState('');
  const [screentransitionanim, setScreentransitionAnim] = useState(false);
  const loggedInUser: User | undefined = selectLoggedInUser();

  const navigation = useNavigation();

  const {translations} = React.useContext(LocalizationContext);
  const configshowdisplayname = remoteConfig().getValue(
    'home_show_display_name',
  );
  const showmemes = remoteConfig().getValue('home_show_memes');
  const showdramaslist = remoteConfig().getValue('home_show_dramas');
  const showtvshows = remoteConfig().getValue('home_show_tvshows');
  const directnavigationtostickers = remoteConfig().getValue(
    'home_direct_navigation_to_stickers',
  );

  const getCoins = async () => {
    try {
      if (!auth().currentUser) {
        return;
      }
      const cref = firestore().collection('users');
      const user = await cref.doc(auth().currentUser?.uid).get();

      if (!user.exists) {
        return;
      }
      setCoins(user.data()?.coins);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const selectLanguage = async () => {
    try {
      const lang = await AsyncStorage.getItem('PREFERED_LANGUAGE');
      if (!lang || lang?.length < 2) {
        // navigation.navigate('Language');
      } else {
        setLanguage(lang);
        return lang;
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    if (!language) {
      selectLanguage();
    }

    const unsubscribe = navigation.addListener('focus', () => {
      if (directnavigationtostickers.asBoolean()) {
        setScreentransitionAnim(true);
        wait(1000)
          .then(() => {
            WaStickersModule.memes(); // navigate to stickers module
            setScreentransitionAnim(false);
          })
          .catch();
      } else {
        getCoins();
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const diffClampScrollY = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);
  const headerY = Animated.interpolateNode(diffClampScrollY, {
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
  });
  const headerHeight = Animated.interpolateNode(diffClampScrollY, {
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [HEADER_HEIGHT, 0],
    // extrapolate: 'clamp',
  });

  const headerOpacity = Animated.interpolateNode(diffClampScrollY, {
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [1, 0],
    // extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      {screentransitionanim ? (
        <LottieView
          source={screentransition}
          autoPlay
          loop
          style={{width: width + 100, height: height + 100}}
          resizeMode="cover"
          autoSize
        />
      ) : (
        <>
          <Animated.View
            style={{
              position: 'absolute',
              top: StatusBar.currentHeight,
              justifyContent: 'space-between',
              alignItems: 'center',
              width: width,
              zIndex: 1000,
              elevation: 1000,
              backgroundColor: '#fff',
              height: headerHeight,
              transform: [{translateY: headerY}],
              opacity: headerOpacity,
            }}>
            <Text
              style={{
                fontSize: 32,
                color: '#000',
                fontWeight: 'bold',
                fontFamily: 'sans-serif-medium',
                alignSelf: 'flex-start',
                marginLeft: 15,
              }}>
              {translations['home.welcome']}
              {loggedInUser?.displayName && configshowdisplayname.asBoolean()
                ? `, ${loggedInUser?.displayName}`
                : ''}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: width,
              }}>
              <TouchableNativeFeedback
                onPress={() => navigation.navigate('Coins')}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    color: 'green',
                    marginHorizontal: 10,
                  }}>
                  🏆 {coins} {translations['home.coins']}
                </Text>
              </TouchableNativeFeedback>
              <TouchableNativeFeedback
                onPress={() => navigation.navigate('VoiceSearch')}>
                <View style={{marginHorizontal: 10}}>
                  <Image
                    source={require('../../assets/images/voice-search.png')}
                    style={styles.voice}
                  />
                </View>
              </TouchableNativeFeedback>
            </View>
          </Animated.View>

          <Animated.ScrollView
            style={{flex: 1, paddingTop: HEADER_HEIGHT + 30}}
            onScroll={Animated.event([
              {
                nativeEvent: {contentOffset: {y: scrollY}},
              },
            ])}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}>
            {showmemes.asBoolean() && (
              <TouchableNativeFeedback onPress={() => WaStickersModule.memes()}>
                <View style={{...styles.card, backgroundColor: 'turquoise'}}>
                  <Text style={{...styles.cardTitle, color: '#000'}}>
                    {'stickers'}
                  </Text>
                  <Text style={{...styles.cardDescription}}>{'memes'}</Text>
                  <Image
                    source={require('../../assets/images/new.png')}
                    style={styles.image}
                  />
                </View>
              </TouchableNativeFeedback>
            )}

            <TouchableNativeFeedback
              onPress={() => {
                navigation.navigate('Channels');
              }}>
              <View style={{...styles.card, backgroundColor: 'aquamarine'}}>
                <Text style={{...styles.cardTitle, color: '#000'}}>
                  {translations['home.menu.title.popular']}
                </Text>
                <Text style={{...styles.cardDescription}}>
                  {translations['home.menu.text.popular']}
                </Text>
                <Image
                  source={require('../../assets/images/trending.png')}
                  style={styles.image}
                />
              </View>
            </TouchableNativeFeedback>

            <TouchableNativeFeedback
              onPress={() => navigation.navigate('FollowingFeed')}>
              <View style={{...styles.card, backgroundColor: 'turquoise'}}>
                <Text style={{...styles.cardTitle, color: '#000'}}>
                  {translations['home.menu.title.shorts']}
                </Text>
                <Text style={{...styles.cardDescription}}>
                  {translations['home.menu.text.shorts']}
                </Text>
                <Image
                  source={require('../../assets/images/tik-tok.png')}
                  style={styles.image}
                />
              </View>
            </TouchableNativeFeedback>

            {/* <TouchableNativeFeedback
              onPress={() => {
                navigation.navigate('Song');
              }}>
              <View style={{...styles.card, backgroundColor: 'tomato'}}>
                <Text style={{...styles.cardTitle, color: '#000'}}>
                  {translations['home.menu.title.songs']}
                </Text>
                <Text style={{...styles.cardDescription}}>
                  {translations['home.menu.text.songs']}
                </Text>
                <Image
                  source={require('../../assets/images/musical-notes.png')}
                  style={styles.image}
                />
              </View>
            </TouchableNativeFeedback> */}

            <TouchableNativeFeedback
              onPress={() => {
                navigation.navigate('Snaps', {screen: 'Snap'});
              }}>
              <View style={{...styles.card, backgroundColor: '#fbee4f'}}>
                <Text style={{...styles.cardTitle, color: '#000'}}>
                  {translations['home.menu.title.snack']}
                </Text>
                <Text style={{...styles.cardDescription}}>
                  {translations['home.menu.text.snack']}
                </Text>
                <Image
                  source={require('../../assets/images/snapchat.png')}
                  style={styles.image}
                />
              </View>
            </TouchableNativeFeedback>

            {showdramaslist.asBoolean() && (
              <TouchableNativeFeedback
                onPress={() => {
                  navigation.navigate('Dramas');
                }}>
                <View style={{...styles.card, backgroundColor: '#ff9254'}}>
                  <Text style={{...styles.cardTitle, color: '#000'}}>
                    {translations['home.menu.title.drama']}
                  </Text>
                  <Text style={{...styles.cardDescription}}>
                    {translations['home.menu.text.drama']}
                  </Text>
                  <Image
                    source={require('../../assets/images/theater.png')}
                    style={styles.image}
                  />
                </View>
              </TouchableNativeFeedback>
            )}

            {showtvshows.asBoolean() && (
              <TouchableNativeFeedback
                onPress={() => {
                  navigation.navigate('SerialList');
                }}>
                <View style={{...styles.card, backgroundColor: '#ff9254'}}>
                  <Text style={{...styles.cardTitle, color: '#000'}}>
                    {translations['home.menu.title.drama']}
                  </Text>
                  <Text style={{...styles.cardDescription}}>
                    {translations['home.menu.text.drama']}
                  </Text>
                  <Image
                    source={require('../../assets/images/theater.png')}
                    style={styles.image}
                  />
                </View>
              </TouchableNativeFeedback>
            )}

            <TouchableNativeFeedback
              onPress={() => {
                navigation.navigate('FacebookVideos');
              }}>
              <View style={{...styles.card, backgroundColor: '#a531f9'}}>
                <Text style={{...styles.cardTitle, color: '#000'}}>
                  {translations['home.menu.title.live']}
                </Text>
                <Text style={{...styles.cardDescription}}>
                  {translations['home.menu.text.live']}
                </Text>
                <Image
                  source={require('../../assets/images/live-streaming.png')}
                  style={styles.image}
                />
              </View>
            </TouchableNativeFeedback>

            <View
              style={{
                width: width - SPACING,
                height: 150,
                borderRadius: 16,
                margin: 5,
                padding: SPACING,
              }}></View>
          </Animated.ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

export default HomeScreen;
