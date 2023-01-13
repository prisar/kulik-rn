import React, {useState, useEffect} from 'react';
import {View, Image, FlatList, Dimensions, Animated} from 'react-native';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import {PinchGestureHandler, State} from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import storage from '@react-native-firebase/storage';

import {selectUserProfile} from '../../store/user/selectors';
import {User} from '../../store/user/model';

const {width, height} = Dimensions.get('window');

const Post = React.memo(({post}: any) => {
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
        backgroundColor: '#e4e6eb',
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
});

interface IProps {
  navigation: any;
}

export default function LikesTab({navigation}: IProps) {
  const userProfile: User | undefined = selectUserProfile();
  const [userId, setUserId] = useState(null);

  const [likedposts, setLikedPosts] = useState([]);

  const getImageUrl = async (post: any) => {
    try {
      let path;
      if (moment(post.createdAt).isBefore('2021-03-11T06:10:41+05:30')) {
        path = `/videos/thumbnails/${post?.videoId}.png`;
      } else {
        path = `/videos/${post?.userId}/thumbnails/${post?.videoId}.png`;
      }
      const ref = storage().ref(path);
      const url = await ref.getDownloadURL();
      return url;
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const getLikedPosts = async () => {
    try {
      if (!userId) {
        return;
      }
      const postRef = firestore().collection('posts');
      postRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
          const userposts: any = [];
          querySnapshot.forEach(async (doc) => {
            const data = doc.data();
            // only photo
            if (data.type === 'photo' && data.photoUrl) {
              userposts.push(data);
            }
            if (data.type === 'video' && data.video) {
              data.photoUrl = await getImageUrl(data);
              userposts.push(data);
            }
          });
          setLikedPosts(userposts);
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
      getLikedPosts();
      setUserId((userProfile as any)?.uid);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, userProfile]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
      {likedposts?.length ? (
        <FlatList
          horizontal={false}
          numColumns={3}
          data={likedposts}
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
