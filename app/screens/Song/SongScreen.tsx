import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
//@ts-ignore
import TrackPlayer, {usePlaybackState} from 'react-native-track-player';
import firestore from '@react-native-firebase/firestore';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

import SongPlayer from '../../components/SongPlayer';

const SPACING = 20;
const AVATAR_SIZE = 50;
const ITEM_SIZE = AVATAR_SIZE + SPACING * 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#002852',
  },
  player: {
    marginTop: 15,
  },
  state: {
    marginTop: 20,
  },
  image: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
});

interface IProps {
  navigation: any;
}

// PlaylistScreen
export default function SongScreen({navigation}: IProps) {
  const [songs, setSongs] = useState([]);
  const [playlistData, setPlaylistData] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const playbackState = usePlaybackState();
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const loadSongs = async () => {
    try {
      const result = await firestore()
        .collection('songs')
        .limit(100)
        .orderBy('artist', 'desc')
        .get();
      const feedposts: any = [];
      result.forEach((doc) => {
        feedposts.push({docId: doc.id, ...doc.data()});
      });
      setSongs(feedposts as any);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  async function setup() {
    try {
      await TrackPlayer.setupPlayer({});
      await TrackPlayer.updateOptions({
        stopWithApp: true,
        capabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
          TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
          TrackPlayer.CAPABILITY_STOP,
        ],
        compactCapabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
        ],
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  async function togglePlayback() {
    try {
      const currentTrack = await TrackPlayer.getCurrentTrack();
      if (currentTrack == null) {
        await TrackPlayer.reset();
        await TrackPlayer.add(playlistData);
        await TrackPlayer.play();
      } else {
        if (playbackState === TrackPlayer.STATE_PAUSED) {
          await TrackPlayer.play();
        } else {
          await TrackPlayer.pause();
        }
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  const addSong = async (track: any) => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(playlistData);
      if (playlistData?.length === 0) {
        await TrackPlayer.add({
          id: track.docId,
          url: track.audio,
          title: track.title,
          artist: track.artist,
          artwork: track.artwork,
        });
      }
      await TrackPlayer.play();
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    setup();
    loadSongs();

    const unsubscribe = navigation.addListener('focus', () => {
      // setup();
      loadSongs();
    });
    return unsubscribe;
  }, [selectedTrack, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {songs?.length ? (
        <>
          <SongPlayer
            onNext={skipToNext}
            style={styles.player}
            onPrevious={skipToPrevious}
            onTogglePlayback={togglePlayback}
          />
          <Animated.FlatList
            contentContainerStyle={{
              padding: 10,
              paddingTop: StatusBar.currentHeight || 42,
            }}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: scrollY}}}],
              {useNativeDriver: true},
            )}
            horizontal={false}
            data={songs}
            renderItem={({item, index}) => {
              const inputRange = [
                -1,
                0,
                ITEM_SIZE * index,
                ITEM_SIZE * (index + 4),
              ];
              const opacityInputRange = [
                -1,
                0,
                ITEM_SIZE * index,
                ITEM_SIZE * (index + 0.5),
              ];
              const scale = scrollY.interpolate({
                inputRange,
                outputRange: [1, 1, 1, 0],
              });
              const opacity = scrollY.interpolate({
                inputRange: opacityInputRange,
                outputRange: [1, 1, 1, 0],
              });
              return (
                <>
                  <Animated.View
                    style={{
                      shadowColor: '#fff',
                      shadowOffset: {
                        height: 10,
                        width: 0,
                      },
                      shadowOpacity: 0.3,
                      shadowRadius: 20,
                      transform: [{scale}],
                      opacity: opacity,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        const track = {...(item as any)};
                        setSelectedTrack({
                          id: track.docId,
                          url: track.audio,
                          title: track.title,
                          artist: track.artist,
                          artwork: track.artwork,
                        });
                        const playlist = [...(playlistData as any)];
                        playlist.unshift({
                          id: track.docId,
                          url: track.audio,
                          title: track.title,
                          artist: track.artist,
                          artwork: track.artwork,
                        });
                        setPlaylistData(playlist as any);
                        addSong(track);
                      }}
                      style={{
                        flexDirection: 'row',
                        margin: 10,
                      }}>
                      <Image
                        source={{
                          uri: (item as any).artwork,
                        }}
                        style={styles.image}
                      />
                      <View style={{flexDirection: 'column'}}>
                        <Text
                          style={{
                            alignSelf: 'center',
                            marginLeft: 20,
                            fontSize: 18,
                            fontWeight: '600',
                            color: '#f9f9fa',
                          }}>
                          {(item as any).title_bn || (item as any).title}
                        </Text>
                        <Text
                          style={{
                            alignSelf: 'flex-start',
                            marginLeft: 20,
                            fontSize: 16,
                            color: '#a1a1a1',
                          }}>
                          {(item as any).artist === 'unknown'
                            ? ''
                            : (item as any).artist}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                </>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
            style={{marginVertical: 10, width: '95%'}}
          />
        </>
      ) : (
        <></>
      )}
    </SafeAreaView>
  );
}

SongScreen.navigationOptions = {
  title: 'Playlist',
};

// function getStateName(state: any) {
//   switch (state) {
//     case TrackPlayer.STATE_NONE:
//       return 'None';
//     case TrackPlayer.STATE_PLAYING:
//       return 'Playing';
//     case TrackPlayer.STATE_PAUSED:
//       return 'Paused';
//     case TrackPlayer.STATE_STOPPED:
//       return 'Stopped';
//     case TrackPlayer.STATE_BUFFERING:
//       return 'Buffering';
//   }
// }

async function skipToNext() {
  try {
    await TrackPlayer.skipToNext();
  } catch (_) {}
}

async function skipToPrevious() {
  try {
    await TrackPlayer.skipToPrevious();
  } catch (_) {}
}
