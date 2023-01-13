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
  },
  videoTitle: {
    width: width - 230,
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
});

interface IProps {
  navigation: any;
  route: any;
}

export default function YoutubeVideosScreen({navigation, route}: IProps) {
  const [videoPosts, setVideoPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchYoutubeData = async () => {
    setLoading(true);
    const response = await fetch(
      `${constants.config.cloudfunctions.endpoint}/searchYoutubeVideos?searchTerm=${route.params?.searchTerm}`,
    );
    if (response.status !== 200) {
      setVideoPosts([]);
      return;
    }
    const json = await response.json();
    if (!json['items']) return;
    setVideoPosts(json['items']);
    setLoading(false);
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
    }, [route.params?.searchTerm]),
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
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  navigation.navigate('YoutubeVideo', {
                    videoId: (item as any).id.videoId,
                    title: (item as any).snippet?.title,
                  })
                }>
                <Image
                  source={{uri: (item as any).snippet.thumbnails.high.url}}
                  style={styles.image}
                />
                <View style={{flexDirection: 'column'}}>
                  <Text style={styles.videoTitle}>
                    {(item as any).snippet.title}
                  </Text>
                  <Text style={styles.channelTitle}>
                    {(item as any).snippet.channelTitle}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            style={{height: height, width: width, margin: 0.5}}
            onEndReachedThreshold={1}
            scrollEventThrottle={16}
          />
        </>
      )}
    </SafeAreaView>
  );
}
