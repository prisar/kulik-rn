import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, Dimensions, FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import * as Sentry from '@sentry/react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import VideoThumbnail from '../Video/VideoThumbnail';

const {width, height} = Dimensions.get('window');

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
  route: any;
}

export default function AudioUseScreen({route}: IProps) {
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();

  const getPosts = async () => {
    try {
      const result = await firestore()
        .collection('audios')
        .doc(route.params.audioId)
        .get();
      const usedByPosts = result?.data()?.posts;
      if (result.exists && usedByPosts?.length > 0) {
        const query = await firestore()
          .collection('posts')
          .where(firestore.FieldPath.documentId(), 'in', usedByPosts)
          .get();
        const docs = query.docs.map((doc) => doc.data());
        setPosts(docs as any);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      getPosts();

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // React.useEffect(() => {
  //   getPosts();
  //   return () => {
  //     //
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [audioId]);

  return (
    <SafeAreaView style={styles.container}>
      {!posts?.length && <Text style={{alignSelf: 'center'}}>Empty</Text>}
      <FlatList
        horizontal={false}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        data={posts}
        renderItem={({item}) => {
          return (
            <View style={styles.vidcontainer}>
              {/* <Text>{item.videoId}</Text> */}
              {/* <SharedElement id={`item.${item?.docId}.photo`}> */}
              <VideoThumbnail post={item} navigation={navigation} />
              {/* </SharedElement> */}
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
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}
