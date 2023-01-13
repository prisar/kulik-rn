import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

import constants from '../../config/constants';
import SkeletonComponent from './SkeletonComponent';

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#002852',
    margin: 5,
    borderRadius: 5,
    elevation: 10,
  },
  image: {
    width: 220,
    height: 120,
    borderWidth: 1,
    margin: 5,
    resizeMode: 'cover',
  },
  videoTitle: {
    width: width - 250,
    fontSize: 16,
    color: '#fff',
  },
  channelTitle: {
    width: width - 150,
    fontSize: 16,
    fontStyle: 'italic',
    color: 'yellow',
  },
  emptyAnimation: {
    alignSelf: 'center',
    width: 250,
  },
  flatList: {
    height: height,
    width: width,
    margin: 0.5,
  },
  channelDetails: {
    flexDirection: 'column',
  },
});

interface IProps {
  navigation: any;
  route: any;
}

export default function ChannelScreen({navigation, route}: IProps) {
  const [videoPosts, setVideoPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchYoutubeData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${constants.config.cloudfunctions.endpoint}/fetchYoutubeChannelVideos?channelId=${route.params?.channelId}`,
      );
      if (response.status !== 200) {
        setVideoPosts([]);
        return;
      }
      const json = await response.json();
      if (!json.items) {
        return;
      }
      setVideoPosts(json.items);
      setLoading(false);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      if (!videoPosts?.length) {
        fetchYoutubeData();
      }

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
        setVideoPosts([]);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params?.channelId]),
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <>
          <SkeletonComponent />
          <SkeletonComponent />
          <SkeletonComponent />
          <SkeletonComponent />
        </>
      ) : (
        <>
          {!videoPosts.length && (
            <>
              <LottieView
                source={require('../../assets/animations/empty-state.json')}
                autoPlay
                loop={true}
                style={styles.emptyAnimation}
              />
            </>
          )}
          <FlatList
            data={videoPosts}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  navigation.navigate('YoutubeVideo', {
                    videoId: (item as any)?.id.videoId,
                    title: (item as any)?.snippet?.title,
                  })
                }>
                <Image
                  source={{uri: (item as any).snippet.thumbnails.high.url}}
                  style={styles.image}
                />
                <View style={styles.channelDetails}>
                  <Text style={styles.videoTitle}>
                    {(item as any).snippet?.title}
                  </Text>
                  <Text style={styles.channelTitle}>
                    {(item as any).snippet?.channelTitle}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            style={styles.flatList}
            onEndReachedThreshold={1}
            scrollEventThrottle={16}
          />
        </>
      )}
    </SafeAreaView>
  );
}
