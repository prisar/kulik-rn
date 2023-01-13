import React, {useState, useCallback} from 'react';
import {View, StyleSheet, Dimensions, FlatList, Text} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import {SharedElement} from 'react-navigation-shared-element';
import * as Sentry from '@sentry/react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import VideoThumbnail from './VideoThumbnail';

const pageSize = 12;

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  vidcontainer: {
    width: width * 0.3,
    height: 180,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#fbee4f',
  },
});

interface IProps {
  navigation: any;
}

export default function ShortVideoScreen({navigation}: IProps) {
  const [videoPosts, setVideoPosts] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);

  const loadVideos = async () => {
    try {
      const result = await firestore()
        .collection('posts')
        .where('type', '==', 'video')
        .orderBy('createdAt', 'desc')
        .limit(pageSize)
        .get();

      const last = result.docs[result.docs.length - 1];
      setLastDoc(last as any);

      const posts: any = [];
      result.forEach((doc) => {
        posts.push({docId: doc.id, ...doc.data()});
      });
      const thumbnails = posts?.filter((post: any) => post.videoId);
      setVideoPosts(thumbnails);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const loadMoreVideos = async () => {
    try {
      const result = await firestore()
        .collection('posts')
        .where('type', '==', 'video')
        .orderBy('createdAt', 'desc')
        .startAfter((lastDoc as any).data().createdAt)
        .limit(pageSize)
        .get();

      const last = result.docs[result.docs.length - 1];
      setLastDoc(last as any);

      const newposts: any[] = [];
      result.forEach((doc) => {
        newposts.push({docId: doc.id, ...doc.data()});
      });

      const filteredposts = [...(newposts as any[])].filter(
        (post) => post.videoId,
      );
      setVideoPosts((videoPosts as any)?.concat(filteredposts));
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      loadVideos();

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      {!(videoPosts as any)?.length && (
        <Text style={{alignSelf: 'center'}}>loading...</Text>
      )}
      <FlatList
        horizontal={false}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        data={videoPosts}
        renderItem={({item}) => {
          return (
            <View style={styles.vidcontainer}>
              <SharedElement id={`item.${item?.docId}.photo`}>
                <VideoThumbnail post={item} navigation={navigation} />
              </SharedElement>
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        style={{
          height: 0.7 * height,
          width: width,
          alignSelf: 'center',
          backgroundColor: '#fff',
        }}
        onEndReachedThreshold={0.1}
        onEndReached={loadMoreVideos}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}
