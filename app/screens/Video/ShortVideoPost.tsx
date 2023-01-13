import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  Text,
  Share,
  TouchableHighlight,
  Easing,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import Animation from 'lottie-react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SharedElement} from 'react-navigation-shared-element';
import * as Sentry from '@sentry/react-native';
import LottieView from 'lottie-react-native';

import heartanim from '../../assets/animations/like-animation.json';
import whatsappanim from '../../assets/animations/whatsapp-social-media-icon.json';
const audios = require('../../assets/animations/play-music.json');

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    margin: 20,
  },
  captureBtns: {
    // backgroundColor: '#E0E7E2',
    borderRadius: 35,
    alignSelf: 'flex-end',
    // margin: 10,
  },
  icon: {
    // width: 50,
    // height: 50,
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'green',
  },
  cancel: {
    // position: 'absolute',
    margin: 20,
    // bottom: 20,
    backgroundColor: 'transparent',
    color: '#FFF',
    fontWeight: '600',
    fontSize: 17,
  },
  playbackBtn: {
    margin: 20,
    backgroundColor: 'transparent',
    color: '#FFF',
    fontWeight: '600',
    fontSize: 17,
  },
  videoPost: {
    width: '100%',
    height: height,
    flex: 0,
    // zIndex: 100,
  },
  videoCover: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  buffering: {
    backgroundColor: '#000',
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'green',
  },
  videoDetails: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    // top: 500,
    right: 0,
    bottom: 50,
    backgroundColor: 'transparent',
  },
  videoBtns: {
    // backgroundColor: '#E0E7E2',
    borderRadius: 35,
    // alignSelf: 'center',
    margin: 20,
  },
});

interface IProps {
  route: any;
  navigation: any;
}

export default function ShortVideoPost({route, navigation}: IProps) {
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [heartAnimation, setheartAnimation] = useState(false);
  const [whatsappAnimation, setWhatsappAnimation] = useState(false);
  const [post, setPost] = useState(null);
  const animatedValue = new Animated.Value(0);
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, width],
  });

  let heartAnimationRef = useRef();
  let whatsappAnimationRef = useRef();
  let player = useRef();

  const handleLoad = () => {
    try {
      // setBuffering(false);
      // setPlaybackPaused(false);
      setLoading(true);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const onLiked = async () => {
    try {
      if (!auth().currentUser) {
        return;
      }

      // if (liked) {
      //   setLiked(false);
      // } else {
      // setLiked(true);
      setheartAnimation(true);
      const notif = {
        recipientId: (post as any).userId,
        fanId: auth().currentUser?.uid || '',
        fanDisplayName: auth().currentUser?.displayName || '',
        fanAvatar: auth().currentUser?.photoURL || '',
        createdAt: moment().format(),
        type: 'POST_LIKED',
        message: `${
          auth().currentUser ? auth().currentUser?.displayName : 'Someone'
        } liked your post`,
        read: false,
        postId: (post as any).docId,
      };
      await firestore().collection('notifications').add(notif);

      setTimeout(async () => {
        await firestore()
          .collection('posts')
          .doc((post as any).docId)
          .set(
            {
              likes: (post as any).likes + 1,
            },
            {merge: true},
          );

        setheartAnimation(false);
      }, 500);

      await firestore()
        .collection('postlikes')
        .doc((post as any)?.docId)
        .set(
          {
            postId: (post as any)?.docId,
            userId: auth().currentUser?.uid,
            userName: auth().currentUser?.displayName || 'Agrohi user',
            userPhotoUrl: auth().currentUser?.photoURL,
            likedAt: moment().format(),
            postType: (post as any)?.type,
            photoId: (post as any)?.photoId,
            videoId: (post as any)?.videoId, // for thumbnail
          },
          {merge: true},
        );
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const onShare = async () => {
    try {
      setWhatsappAnimation(true);
      const link =
        (post as any).type === 'photo'
          ? (post as any).photoUrl
          : (post as any).video;
      const result = await Share.share({
        message: `Use Agro App to get more, ${link}`,
      });
      if (result.action === Share.sharedAction) {
        await firestore()
          .collection('posts')
          .doc((post as any).docId)
          .set(
            {
              shares: ((post as any).shares ? (post as any).shares : 0) + 1,
            },
            {merge: true},
          );
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
        const notif = {
          recipientId: (post as any).userId,
          fanId: auth().currentUser?.uid || '',
          fanDisplayName: auth().currentUser?.displayName || '',
          fanAvatar: auth().currentUser?.photoURL || '',
          createdAt: moment().format(),
          type: 'POST_SHARED',
          message: `${
            auth().currentUser ? auth().currentUser?.displayName : 'Someone'
          } shared your post`,
          read: false,
          postId: (post as any).docId,
        };
        await firestore().collection('notifications').add(notif);
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
      // setWhatsappAnimation(false);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const getPost = async () => {
    try {
      const result = await firestore()
        .collection('posts')
        .doc(route?.params.postId)
        .get();

      const videoPost = {...result?.data(), docId: result?.id};
      setPost(videoPost as any);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
        setPost(null);
        setMuted(true);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, route?.params.postId]),
  );

  Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 10000,
      easing: (Easing.linear as any).inOut,
      useNativeDriver: true,
    }),
  ).start();

  useEffect(() => {
    if (!post || (post as any)?.docId !== route?.params.postId) {
      getPost();
    }
    // setMuted(true);
    const unsubscribe = navigation.addListener('focus', () => {
      setMuted(false);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, route?.params?.postId]);

  return (
    <View style={styles.container}>
      <SharedElement id={`item.${route?.params?.postId}.photo`}>
        <View>
          {post && (
            <>
              <View>
                <Video
                  muted={muted}
                  source={{
                    uri: (post as any)?.video,
                  }}
                  ref={player} // Store reference
                  // onLayout={handleVideoLayout}
                  // onLoadStart={handleLoadStart}
                  // onBuffer={handleBuffer}
                  // onProgress={handleProgress}
                  onLoad={handleLoad}
                  onReadyForDisplay={() => {
                    // console.log('onReadyForDisplay');
                    setLoading(false);
                  }}
                  // onError={this.videoError} // Callback when video cannot be loaded
                  style={styles.videoPost}
                  repeat
                  resizeMode="cover"
                />

                <View style={styles.videoDetails}>
                  <TouchableHighlight
                    style={styles.captureBtns}
                    onPress={() => {
                      navigation?.navigate('Profile', {
                        currentProfile:
                          auth().currentUser?.uid === (post as any).userId
                            ? true
                            : false,
                        userId: (post as any).userId,
                        avatar: (post as any).avatar,
                        displayName: (post as any).displayName,
                      });
                    }}>
                    <Image
                      source={{
                        uri:
                          (post as any)?.avatar !== null
                            ? (post as any).avatar
                            : 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_man_male_person-512.png',
                      }}
                      style={{
                        height: 50,
                        width: 50,
                        borderRadius: 25,
                        margin: 10,
                      }}
                    />
                  </TouchableHighlight>
                  <TouchableHighlight
                    style={styles.captureBtns}
                    onPress={onLiked}>
                    <Image
                      source={require('../../assets/heart.webp')}
                      style={{
                        height: 45,
                        width: 45,
                        borderRadius: 25,
                        margin: 15,
                        tintColor: '#fff',
                      }}
                    />
                  </TouchableHighlight>
                  <TouchableHighlight
                    style={styles.captureBtns}
                    onPress={() => {}}>
                    <Image
                      source={require('../../assets/comments.webp')}
                      style={{
                        height: 45,
                        width: 45,
                        borderRadius: 25,
                        margin: 15,
                        tintColor: '#fff',
                      }}
                    />
                  </TouchableHighlight>
                  <TouchableHighlight
                    style={styles.captureBtns}
                    onPress={onShare}>
                    <Image
                      source={require('../../assets/share.png')}
                      style={{
                        height: 45,
                        width: 45,
                        margin: 15,
                        tintColor: '#fff',
                      }}
                    />
                  </TouchableHighlight>
                  <TouchableOpacity
                    style={styles.captureBtns}
                    onPress={() => {
                      navigation.navigate('AudioUseage', {
                        videoId: (post as any)?.videoId,
                      });
                    }}>
                    <LottieView
                      source={audios}
                      autoPlay
                      loop
                      style={{width: 72, height: 72, marginHorizontal: 20}}
                    />
                  </TouchableOpacity>
                </View>
                <Animated.View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    transform: [{translateX: translateX}],
                  }}>
                  <Text style={{color: '#fff', fontSize: 18, opacity: 0.8}}>
                    {`original by - ${(post as any)?.displayName}`}
                  </Text>
                </Animated.View>
              </View>
              <View>
                {heartAnimation && (
                  <Animation
                    ref={heartAnimationRef as any}
                    style={{
                      width: 120,
                      height: 120,
                      bottom: 180,
                      left: 11,
                      // left: 100 //width * 0.5,
                      alignSelf: 'flex-end',
                    }}
                    loop={true}
                    autoPlay={true}
                    source={heartanim}
                  />
                )}
                {whatsappAnimation && (
                  <Animation
                    ref={whatsappAnimationRef as any}
                    style={{
                      width: 120,
                      height: 120,
                      bottom: 120,
                      left: 12,
                      // left: 100 //width * 0.5,
                      alignSelf: 'flex-end',
                    }}
                    loop={true}
                    autoPlay={true}
                    source={whatsappanim}
                  />
                )}
              </View>
            </>
          )}
          {loading && (
            <View
              style={{
                marginTop: 16,
                height: height,
                alignSelf: 'center',
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" color="#fafafa" />
            </View>
          )}
        </View>
      </SharedElement>
    </View>
  );
}
