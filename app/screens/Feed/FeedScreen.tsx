import React, {useState, useContext, useEffect} from 'react';
import {View, Text, StyleSheet, Animated, Dimensions} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as Sentry from '@sentry/react-native';

import {LocalizationContext} from '../Translation/Translations';
import Post from '../Post/Post';
import {SafeAreaView} from 'react-native-safe-area-context';

const pageSize = 3;

const {height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(239, 239, 239)',
  },
});

const SPACING = 20;
const AVATAR_SIZE = height;
const ITEM_SIZE = AVATAR_SIZE + SPACING * 3;

export default function FeedScreen({navigation}: any) {
  const {translations} = useContext(LocalizationContext);

  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const loadPosts = async () => {
    try {
      const result = await firestore()
        .collection('posts')
        .where('type', '==', 'photo')
        .orderBy('createdAt', 'desc')
        .limit(pageSize)
        .get();

      // Get the last document
      const last = result.docs[result.docs.length - 1];
      setLastDoc(last as any);

      const feedposts: any = [];
      result.forEach((doc) => {
        feedposts.push({docId: doc.id, ...doc.data()});
      });
      setPosts(feedposts);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const loadMorePosts = async () => {
    try {
      const result = await firestore()
        .collection('posts')
        .where('type', '==', 'photo')
        .orderBy('createdAt', 'desc')
        .startAfter((lastDoc as any).data().createdAt)
        .limit(pageSize)
        .get();

      const last = result.docs[result.docs.length - 1];
      setLastDoc(last as any);

      const newposts: any = [];
      result.forEach((doc) => {
        newposts.push({docId: doc.id, ...doc.data()});
      });

      const allposts = [...posts];
      setPosts(allposts.concat(newposts));
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setCurrentUser(auth().currentUser as any);
      loadPosts();
    });
    return unsubscribe;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{margin: 20}}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            fontFamily: 'sans-serif-medium',
          }}>
          {translations['feed.title']}
        </Text>
      </View>
      {posts !== null ? (
        <Animated.FlatList
          contentContainerStyle={{
            padding: 10,
          }}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: true},
          )}
          horizontal={false}
          data={posts}
          renderItem={({item, index}) => {
            const inputRange = [
              -1,
              0,
              ITEM_SIZE * index,
              ITEM_SIZE * (index + 2),
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
              <View style={{margin: 10}}>
                <Post
                  item={item}
                  navigation={navigation}
                  scale={scale}
                  opacity={opacity}
                />
              </View>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          style={{height: 0.3 * height, margin: 5}}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          onEndReached={loadMorePosts}
        />
      ) : (
        <> </>
      )}
    </SafeAreaView>
  );
}
