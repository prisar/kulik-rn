import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  PixelRatio,
  Platform,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  AppState,
  StatusBar,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import YoutubePlayer from 'react-native-youtube-iframe';
import {useFocusEffect} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';

import constants from '../../config/constants';

const {height, width} = Dimensions.get('window');

const COINS_REWARDS = 5;

export default function YoutubeVideoScreen({route, navigation}) {
  const [playing, setPlaying] = useState(true); // start playing by default, but not working
  const [playbackState, setPlayBalackState] = useState('unstarted');
  const [playbackDuration, setPlaybackDuration] = useState(COINS_REWARDS);
  const [error, setError] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const playerRef = useRef();
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [screenFocused, setScreenFocused] = useState(false);

  const countRef = React.useRef();
  countRef.current = playbackDuration;

  const onStateChange = useCallback((state) => {
    setPlayBalackState(state);
    if (state === 'unstarted') {
      // Alert.alert('video has finished playing!');
    }
    if (state === 'ended') {
      // Alert.alert('video has finished playing!');
    }
  }, []);

  // const togglePlaying = useCallback(() => {
  //   playerRef.current
  //     ?.getCurrentTime()
  //     .then((currentTime) => console.log({currentTime}));

  //   setPlaying((prev) => !prev);
  // }, []);

  const fetchRelatedVideosData = async () => {
    try {
      const response = await fetch(
        `${constants.config.cloudfunctions.endpoint}/fetchRelatedYoutubeVideos?videoId=${route.params?.videoId}`,
      );
      if (response.status !== 200) {
        return;
      }
      const json = await response.json();
      if (!json['items']) return;
      setRelatedVideos(json['items']);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const addCoins = async () => {
    try {
      if (!auth().currentUser?.uid) {
        return;
      }

      const user = await firestore()
        .collection('users')
        .doc(auth().currentUser?.uid)
        .get();
      if (!user.exists) {
        return;
      }
      const usercoins = parseInt(user.data()?.coins || 0) + playbackDuration;
      setPlaybackDuration(COINS_REWARDS);

      await firestore().collection('coins').add({
        coins: playbackDuration,
        userId: auth().currentUser?.uid,
        createdAt: moment().format(),
        updatedAt: moment().format(),
        mode: 'earned', // mode can be earned, transfered, recevived
      });

      await firestore().collection('users').doc(auth().currentUser?.uid).set(
        {
          coins: usercoins,
          updatedAt: moment().format(),
        },
        {merge: true},
      );
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const _handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // console.log('App has come to the foreground!');
      if (screenFocused) {
        setPlaying(() => {
          return true;
        });
      }
    } else {
      setPlaying(() => {
        return false;
      });
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      setPlaybackDuration(COINS_REWARDS);
      if (!relatedVideos.length) {
        fetchRelatedVideosData();
      }
      setPlaying((playing) => {
        playing = true;
        return playing;
      });
      const playbackInterval = setInterval(() => {
        // console.log('This will run every second!', playbackDuration);
        if (playbackState !== 'paused') {
          setPlaybackDuration((playbackDuration) => playbackDuration + 1); // callback
        }
      }, 1000);

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
        addCoins();
        setPlaying(false); // pause if screen is changed
        clearInterval(playbackInterval);
        setScreenFocused(true);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, route.params?.videoId]),
  );

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);

    const unsubscribe = navigation.addListener('focus', () => {
      //
      setScreenFocused(true);
    });

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
      unsubscribe;
      setScreenFocused(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          height: 20,
          marginTop: StatusBar.currentHeight,
        }}>
        <Text style={{color: '#fff'}}>Back</Text>
      </TouchableOpacity>
      <YoutubePlayer
        ref={playerRef}
        height={0.35 * height}
        play={playing}
        videoId={route.params?.videoId}
        onChangeState={onStateChange}
        on
        style={styles.player}
      />

      <Text style={{color: 'white', fontSize: 18, margin: 10}}>
        {route.params?.title}
      </Text>
      <Text
        ref={(r) => {
          r = countRef;
        }}
        style={{color: 'white', fontSize: 12, alignSelf: 'center'}}>
        {playbackDuration}
      </Text>
      {/* <Button title={playing ? 'pause' : 'play'} onPress={togglePlaying} /> */}
      {/* <Text style={styles.instructions}>{error ? 'Error: ' + error : ''}</Text> */}
      <FlatList
        // horizontal
        data={relatedVideos}
        renderItem={({item, index, separators}) => {
          if (!item.snippet) {
            return;
          }
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                //TODO navigation.push()
                navigation.navigate('YoutubeVideo', {
                  videoId: item.id.videoId,
                  title: item.snippet?.title,
                })
              }>
              <Image
                source={{uri: item.snippet?.thumbnails?.high?.url}}
                style={styles.image}
              />
              <View style={{flexDirection: 'column'}}>
                <Text style={styles.videoTitle}>{item.snippet?.title}</Text>
                <Text style={styles.channelTitle}>
                  {item?.snippet?.channelTitle}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        style={{
          // height: 0.4 * height,
          width: width,
          // alignSelf: 'center',
          backgroundColor: '#fff',
        }}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#002852',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignSelf: 'center',
    paddingBottom: 5,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  player: {
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#002852',
    margin: 3,
    borderRadius: 3,
    elevation: 10,
  },
  image: {
    width: 120,
    height: 90,
    borderWidth: 1,
    margin: 5,
  },
  videoTitle: {
    width: width - 150,
    color: '#fff',
  },
  channelTitle: {
    width: width - 150,
    fontSize: 16,
    fontStyle: 'italic',
    color: 'yellow',
  },
});
