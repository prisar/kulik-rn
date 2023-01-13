import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import moment from 'moment';
import LottieView from 'lottie-react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {PinchGestureHandler, State} from 'react-native-gesture-handler';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import * as Sentry from '@sentry/react-native';

import PostComments from '../../components/PostComments';

const {width} = Dimensions.get('window');
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const fs = RNFetchBlob.fs;

const styles = StyleSheet.create({
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'green',
  },
  image: {
    width: '100%',
    height: 250,
  },
});

interface IProps {
  item: any;
  navigation: any;
  userProfile?: any;
  scale: any;
  opacity: any;
}

export default function Post({
  item,
  navigation,
  userProfile,
  scale,
  opacity,
}: IProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [likedAnimation, setLikedAnimation] = useState(false);
  const [shares, setShares] = useState(null);
  const [imagebase64, setImagebase64] = useState(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const currentScale = new Animated.Value(1);

  const onLike = async () => {
    try {
      if (!auth().currentUser?.uid) {
        navigation.navigate('Login');
      }
      if (item?.userId === auth().currentUser?.uid) {
        return;
      }

      if (liked) {
        setLiked(false);
      } else {
        setLiked(true);
        setLikedAnimation(true);
        const notif = {
          recipientId: item.userId,
          fanId: auth().currentUser?.uid || '',
          fanDisplayName: auth().currentUser?.displayName || '',
          fanAvatar: auth().currentUser?.photoURL || '',
          createdAt: moment().format(),
          type: 'POST_LIKED',
          message: `${
            auth().currentUser ? auth().currentUser?.displayName : 'Someone'
          } liked your post`,
          read: false,
          postId: item.docId,
        };
        await firestore().collection('notifications').add(notif);

        setLikes(likes + 1);
        await firestore()
          .collection('posts')
          .doc(item.docId)
          .set(
            {
              likes: item.likes + 1,
            },
            {merge: true},
          );

        await firestore()
          .collection('postlikes')
          .doc(item.docId)
          .set(
            {
              postId: item.docId,
              userId: auth().currentUser?.uid,
              userName: auth().currentUser?.displayName || 'Agrohi user',
              userPhotoUrl: auth().currentUser?.photoURL,
              likedAt: moment().format(),
              postType: item.type,
              photoId: item.photoId,
              videoId: item.videoId, // for thumbnail
            },
            {merge: true},
          );

        setLikedAnimation(false);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const onShare = async () => {
    try {
      if (item.type !== 'photo') {
        return;
      }
      const link = imageUrl ? imageUrl : item.video;
      let imagePath: any = null;
      RNFetchBlob.config({
        fileCache: true,
      })
        .fetch('GET', link)
        // the image is now dowloaded to device's storage
        .then((resp) => {
          // the image path you can use it directly with Image component
          imagePath = resp.path();
          return resp.readFile('base64');
        })
        .then((base64Data) => {
          // here's base64 encoded image
          setImagebase64(base64Data);
          // remove the file from storage
          return fs.unlink(imagePath);
        });

      const result = await Share.open({
        title: 'Agrohi App',
        message: `${item.message} \n\n রাজবংশী এপখান ইনস্টল করি হামাক সমর্থন করো, AppLink: https://bit.ly/3gbjrBJ`,
        subject: 'Share with friends',
        url: `data:image/png;base64,${imagebase64}`,
      });

      const {app} = result;
      if (!app) {
        return;
      }

      await firestore()
        .collection('posts')
        .doc(item.docId)
        .set(
          {
            shares: (item.shares ? item.shares : 0) + 1,
          },
          {merge: true},
        );

      setShares((shares as any) + 1);
      const notif = {
        recipientId: item.userId,
        fanId: auth().currentUser?.uid || '',
        fanDisplayName: auth().currentUser?.displayName || '',
        fanAvatar: auth().currentUser?.photoURL || '',
        createdAt: moment().format(),
        type: 'POST_SHARED',
        message: `${
          auth().currentUser ? auth().currentUser?.displayName : 'Someone'
        } shared your post`,
        read: false,
        postId: item.docId,
      };
      await firestore().collection('notifications').add(notif);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

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

  // const urlify = (message) => {
  //   const urlRegex = /(https?:\/\/[^\s]+)/g;

  //   const messagesplits = message.split(/(https?:\/\/[^\s]+)/g);
  //   let result = `<Text>`;
  //   messagesplits.forEach((part, index) => {
  //     if (index === 0) {
  //       result += `${part}</Text>`;
  //       return result;
  //     }
  //     if (index % 2 !== 0) {
  //       result += `<TouchableOpacity onPress={() => }>`;
  //     }
  //   });
  // };

  const _handleMessagePress = () => {
    const messagesplits = item?.message?.split(URL_REGEX);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [begin, url = '', end = ''] = messagesplits;
    if (!url?.length) {
      return;
    }

    Linking.openURL(url);
  };

  const checkYtUrl = (url: any) => {
    let newval: string = '';
    let videoId: string = '';

    if ((newval = url.match(/(\?|&)v=([^&#]+)/))) {
      videoId = (newval as any).pop();
    } else if ((newval = url.match(/(\.be\/)+([^\/]+)/))) {
      videoId = (newval as any).pop();
    } else if ((newval = url.match(/(\embed\/)+([^\/]+)/))) {
      videoId = (newval as any).pop().replace('?rel=0', '');
    }
    const thumbnail = `https://i1.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    setImageUrl(thumbnail);
  };

  const selectPhotoUrl = async () => {
    try {
      if (item?.photoUrl) {
        setImageUrl(item?.photoUrl);
        return;
      }

      const messagesplits = item?.message?.split(URL_REGEX);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [begin, url = '', end = ''] = messagesplits;
      if (url?.length) {
        checkYtUrl(url);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const checkAvatar = () => {
    if (item.avatar) {
      setAvatar(item.avatar);
      return;
    }
    if (item.photoUrl) {
      setAvatar(item.photoUrl);
      return;
    }
    const defaultAvatar =
      'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_man_male_person-512.png';
    setAvatar(defaultAvatar);
  };

  React.useEffect(() => {
    setLikes(item?.likes);
    setShares(item?.shares);

    if (!imageUrl) {
      selectPhotoUrl();
    }

    if (!avatar) {
      checkAvatar();
    }

    return () => {
      //
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, imageUrl, avatar]);

  return (
    <Animated.View
      style={{
        borderRadius: 5,
        // backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#000',
        shadowOffset: {
          height: 10,
          width: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        transform: [{scale}],
        opacity: opacity,
      }}>
      {item?.type === 'photo' ? (
        <View>
          <View>
            <View style={{flexDirection: 'row', margin: 10}}>
              <TouchableOpacity
                onPress={() => {
                  if (!userProfile)
                    navigation.navigate('Profile', {
                      currentProfile:
                        auth().currentUser?.uid === item.userId ? true : false,
                      userId: item.userId,
                      avatar: item.avatar,
                      displayName: item.displayName,
                    });
                }}>
                <Image
                  style={styles.avatar}
                  source={{
                    uri: avatar as any,
                  }}
                />
              </TouchableOpacity>
              <View style={{flexDirection: 'column', margin: 5}}>
                <Text style={{fontWeight: 'bold', fontSize: 16}}>
                  {item.displayName}
                </Text>
                <Text>{moment(item?.createdAt).fromNow()}</Text>
              </View>
            </View>
          </View>
          <View style={{margin: 10}}>
            <Text
              style={{
                margin: 5,
                fontSize: item.photoUrl ? 18 : 26,
                color: `${URL_REGEX.test(item?.message) ? 'blue' : '#000'}`,
              }}
              onPress={_handleMessagePress}>
              {item.message}
            </Text>
            {!imageUrl ? (
              <></>
            ) : (
              <PinchGestureHandler
                onGestureEvent={onPinchEvent}
                onHandlerStateChange={onPinchStateChange}>
                <Animated.Image
                  source={{uri: imageUrl}}
                  style={[
                    styles.image,
                    {
                      transform: [{scale: currentScale}],
                    },
                  ]}
                  resizeMode="contain"></Animated.Image>
              </PinchGestureHandler>
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              margin: 10,
            }}>
            {likedAnimation ? (
              <LottieView
                source={require('../../assets/animations/like-fountain.json')}
                autoPlay
                loop
                style={{
                  right: 140,
                  bottom: 10,
                  position: 'absolute',
                  height: 72,
                  width: 72,
                }}
              />
            ) : (
              <></>
            )}
            <TouchableOpacity
              style={{width: width * 0.3, flexDirection: 'row'}}
              onPress={onLike}>
              <Image
                source={require('../../assets/like.png')}
                style={{width: 42, height: 42}}
                // color={liked ? 'red' : 'black'}
                // tintColor={liked ? 'red' : 'black'}
              />
              <Text style={{fontSize: 20, margin: 5}}>{likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{width: width * 0.3, flexDirection: 'row'}}
              onPress={onShare}>
              <Image
                source={require('../../assets/share.png')}
                style={{width: 42, height: 42}}
                // color={liked ? 'red' : 'black'}
                // tintColor={liked ? 'red' : 'black'}
              />
              <Text style={{fontSize: 20, margin: 5}}>{shares}</Text>
            </TouchableOpacity>
            <PostComments navigation={navigation} post={item} />
          </View>
        </View>
      ) : (
        <></>
      )}
    </Animated.View>
  );
}
