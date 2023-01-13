import React, {useState, useEffect} from 'react';
import {View, Image, FlatList, Dimensions, Animated} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {PinchGestureHandler, State} from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';

import {selectUserProfile} from '../../store/user/selectors';
import {User} from '../../store/user/model';

const {width, height} = Dimensions.get('window');

const Post = ({post}: any) => {
  const currentScale = new Animated.Value(1);
  const onPinchEvent = Animated.event([{nativeEvent: {scale: currentScale}}], {
    useNativeDriver: true,
  });

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(currentScale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 1,
      }).start();
    }
  };
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3,
      }}>
      <PinchGestureHandler
        onGestureEvent={onPinchEvent}
        onHandlerStateChange={onPinchStateChange}>
        <Animated.Image
          style={{
            height: height * 0.2,
            width: width * 0.31,
            margin: 1,
            borderRadius: 2,
          }}
          source={{uri: post.photoUrl}}
        />
      </PinchGestureHandler>
    </View>
  );
};

interface IProps {
  navigation: any;
}

export default function PostsTab({navigation}: IProps) {
  const userProfile: User | undefined = selectUserProfile();

  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);

  const getPosts = async () => {
    try {
      if (!auth().currentUser) {
        return;
      }
      const postRef = firestore().collection('posts');
      const userId = userProfile?.uid;
      if (!userId) {
        return;
      }
      postRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
          const userposts: any[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // only photo
            if (data.type === 'photo' && data.photoUrl) {
              userposts.push(data);
            }
          });
          setPosts(userposts as any);
        })
        .then()
        .catch((err) => {
          Sentry.captureException(err);
        });
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    if (userId !== userProfile?.uid) {
      getPosts();
      setUserId(userProfile?.uid as any);
    }

    return () => {
      // unsubscribe;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, userProfile]);

  return (
    <View>
      {posts?.length ? (
        <FlatList
          horizontal={false}
          numColumns={3}
          data={posts}
          renderItem={({item}) => {
            return <Post post={item} />;
          }}
          keyExtractor={(item, index) => index.toString()}
          style={{
            height: 0.7 * height,
            width: width,
            alignSelf: 'center',
            backgroundColor: '#fff',
          }}
        />
      ) : (
        <View
          style={{
            height: 0.7 * height,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            width: width,
          }}>
          <Image
            source={require('../../assets/telescope.png')}
            style={{height: 0.35 * height, width: width}}
          />
        </View>
      )}
    </View>
  );
}
