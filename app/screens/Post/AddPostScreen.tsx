import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import Video from 'react-native-video';
import * as Sentry from '@sentry/react-native';

import {LocalizationContext} from '../Translation/Translations';
import {lightColor} from '../../GlobalStyles';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FlatList, TouchableNativeFeedback} from 'react-native-gesture-handler';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

interface IProps {
  route: any;
  navigation: any;
}

const AddPostScreen = ({route, navigation}: IProps) => {
  const [postMessage, onChangePostMessage] = useState('');
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [cuurentPost, setCurrentPost] = useState({});
  const [hashtags, setHashTags] = useState([]);
  const {translations} = React.useContext(LocalizationContext);
  const postId = route.params?.postId;
  const gotoAddImageScreen = () => {
    navigation.navigate('AddImage', {
      action: 'IMAGE_POST',
    });
  };

  const anim = React.useRef(new Animated.Value(1));

  const savePost = async () => {
    setError(null);
    try {
      if (!auth().currentUser) {
        navigation.navigate('Login');
        return;
      }

      if (!postMessage) {
        setError('কিছু পাঠ্য বার্তা দয়া করে লিখুন!' as any); // add some text message!
        return;
      }

      if (!route.params?.postId) {
        await firestore().collection('posts').add({
          userId: auth().currentUser?.uid,
          displayName: auth().currentUser?.displayName,
          avatar: auth().currentUser?.photoURL,
          createdAt: moment().format(),
          type: 'photo',
          statuscode: 5, // draft
          message: postMessage,
          comments: 0,
          likes: 0,
          shares: 0,
          views: 0,
        });
      } else {
        await firestore().collection('posts').doc(route.params?.postId).set(
          {
            message: postMessage,
          },
          {merge: true},
        );
      }

      // push notification
      // const notif = {
      //   bigText: 'Rajbanshi Video',
      //   subText: 'Posted',
      //   title: 'Great!',
      //   message: 'Your post is saved. Go to feed to view.',
      // };
      // LocalNotification(notif);

      // Alert.alert('Success', 'Post saved!');
      onChangePostMessage('');
      if ((cuurentPost as any)?.type === 'video') {
        navigation.navigate('FollowingFeed');
      } else {
        navigation.navigate('Feed');
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const getPostData = async () => {
    try {
      const result = await firestore().collection('posts').doc(postId).get();
      setCurrentPost(result?.data() as any);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const suggestedHashtags = async () => {
    try {
      const result = await firestore()
        .collection('hashtags')
        .orderBy('usage', 'desc')
        .get();
      if (!result.empty) {
        const tags = result.docs.map((doc) => doc.data());
        setHashTags(tags as any);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    if (!postId) {
      Animated.loop(
        // runs given animations in a sequence
        Animated.sequence([
          // increase size
          Animated.timing(anim.current, {
            toValue: 2,
            duration: 2000,
            useNativeDriver: true,
          }),
          // decrease size
          Animated.timing(anim.current, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        {
          useNativeDriver: true,
        },
      ).start();
    } else {
      Animated.timing(anim.current, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).stop();
    }

    setCurrentUser(auth().currentUser as any);
    if (!auth().currentUser) {
      navigation.navigate('Login');
    }

    if (!postId) {
      getPostData();
      suggestedHashtags();
    }

    const unsubscribe = navigation.addListener('focus', () => {
      setCurrentUser(auth().currentUser as any);
      if (!auth().currentUser) {
        navigation.navigate('Login');
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, postId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{margin: 15, alignSelf: 'flex-start'}}>
        <Text
          style={{
            color: '#000',
            fontSize: 32,
            fontWeight: 'bold',
            fontFamily: 'sans-serif-medium',
          }}>
          {translations['addpost.title']}
        </Text>
      </View>
      {currentUser && (
        <View style={{justifyContent: 'center', margin: 10}}>
          <TextInput
            style={{
              fontSize: 26,
              borderWidth: 0.5,
              borderRadius: 10,
              margin: 5,
              height: 200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onChangeText={(msg) => onChangePostMessage(msg)}
            value={postMessage}
            placeholder={translations['addpost.input.message']}
            multiline
          />
          <View
            style={{
              flexDirection: 'row',
              marginTop: 20,
              marginLeft: 5,
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              style={{
                backgroundColor: lightColor,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                width: 0.2 * width,
              }}
              onPress={gotoAddImageScreen}>
              <Animated.View style={{transform: [{scale: anim.current}]}}>
                <Icon name="image" style={{fontSize: 36}} color={'#000'} />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: lightColor,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                width: 0.2 * width,
              }}
              onPress={() => navigation.navigate('VideoPost')}>
              <Icon name="camera-retro" style={{fontSize: 36}} color={'#000'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: 60,
                width: 120,
                borderRadius: 60,
                backgroundColor: 'blue',
              }}
              onPress={savePost}>
              <Text style={{fontSize: 22, color: '#fff'}}>
                {translations['addpost.action.savepost']}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={{color: 'red'}}>{error}</Text>

          <View style={{margin: 10}}>
            <Text style={{color: '#000', fontSize: 18, fontWeight: 'bold'}}>
              Hashtags
            </Text>
          </View>
          <FlatList
            data={hashtags}
            horizontal
            // numColumns={3}
            renderItem={({item}) => {
              return (
                <View
                  style={{
                    height: 30,
                    width: 72,
                    borderRadius: 5,
                    backgroundColor: '#fbfbfb',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                  }}>
                  <TouchableNativeFeedback
                    onPress={() => {
                      const message = `${postMessage} #${(item as any)?.tag?.trim()}`;
                      onChangePostMessage(message);
                    }}>
                    <Text style={{color: '#000'}}>#{(item as any)?.tag}</Text>
                  </TouchableNativeFeedback>
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
            style={{
              height: 100,
              width: 0.9 * width,
              alignSelf: 'center',
              // backgroundColor: '#000',
            }}
          />
          <View>
            {(cuurentPost as any)?.type === 'photo' && (
              <Image
                source={{uri: (cuurentPost as any)?.photoUrl}}
                style={{width: 200, height: 200}}
              />
            )}
            {(cuurentPost as any)?.type === 'video' && (
              <Video
                source={{uri: (cuurentPost as any)?.video}}
                style={{width: 200, height: 300}}
                resizeMode="cover"
              />
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AddPostScreen;
