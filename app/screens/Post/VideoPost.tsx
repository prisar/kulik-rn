import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import Video from 'react-native-video';
import {launchImageLibrary} from 'react-native-image-picker';
import analytics from '@react-native-firebase/analytics';
import RNFetchBlob from 'rn-fetch-blob';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import LottieView from 'lottie-react-native';

import {selectLoggedInUser} from '../../store/auth/selectors';
import {uuid} from '../../utils/uuid';
import AudioPlay from '../../components/AudioPlay';
import {User} from '../../store/user/model';

const audios = require('../../assets/animations/play-music.json');

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    margin: 20,
    width: 0.2 * width,
  },
  captureBtns: {
    borderRadius: 35,
    alignSelf: 'center',
    margin: 20,
  },
  icon: {
    width: 50,
    height: 50,
    tintColor: '#fff',
  },
  cancelBtn: {
    margin: 30,
    height: 40,
    width: 40,
    borderRadius: 30,
    backgroundColor: '#fac030',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
  },
  cancel: {
    alignSelf: 'center',
    color: '#000',
    fontWeight: '600',
    fontSize: 20,
  },
  playbackBtn: {
    margin: 20,
    backgroundColor: 'transparent',
    color: '#FFF',
    fontWeight: '600',
    fontSize: 17,
  },
  recordedVideo: {
    width: width,
    height: height * 0.7,
    flex: 0,
  },
  uploadBtn: {
    margin: 30,
    height: 50,
    width: 100,
    borderRadius: 10,
    backgroundColor: '#fac030',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
  },
  uploadTxt: {
    color: '#000',
    fontSize: 17,
  },
  lottie: {
    alignSelf: 'center',
    // height: '110%',
    height: '100%',
    marginLeft: 10,
    // opacity: dark ? 0.8 : 1,
  },
  // lottieProps: useAnimatedProps(() => ({
  //   speed: 0.5,
  //   autoPlay: true,
  //   // progress: scrollY.value
  //   //   ? interpolate(scrollY.value, [-200, 0, 200], [0, 0.5, 1], 'clamp')
  //   //   : withTiming(1, { duration: 5000 }),
  // })),
});

const VIDEO_MAX_DURATION = 15;

interface IProps {
  navigation: any;
  route: any;
  audio: any;
}

export default function VideoPost({navigation, route, audio}: IProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [counter, setCounter] = useState(0);
  const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.front);
  const [cameraFlash, setCameraFlash] = useState(
    RNCamera.Constants.FlashMode.off,
  );
  const [path, setPath] = useState(null);
  // const [videoPath, setVideoPath] = useState(null);
  const [playbackPaused, setPlaybackPaused] = useState(false);
  const [uploading, setUploading] = useState(false);

  const countRef = React.useRef();
  countRef.current = counter as any;

  const loggedInUser: User | undefined = selectLoggedInUser();

  let player = useRef();

  let camera = useRef();

  const reset = () => setCounter(0);

  // const takePicture = async () => {
  //   if (camera) {
  //     const options = {quality: 0.5, base64: true};
  //     const data = await camera.takePictureAsync(options);
  //   }
  // };

  const pickVideo = () => {
    try {
      const options = {
        title: 'Video Picker',
        mediaType: 'video',
        allowsEditing: true,
        durationLimit: 15,
        cameraType: 'front',
        tintColor: 'green',
        quality: 1,
      };
      launchImageLibrary(options as any, (response) => {
        if (response.didCancel) {
          // console.log('User cancelled video picker');
        } else if (response.error) {
          // console.log('Video picker Error: ', response.error);
        } else if (response.customButton) {
          // console.log('User tapped custom button: ', response.customButton);
        } else {
          setPath(response?.uri as any);
          // setVideoPath(response.path as any);
        }
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  // converts content:// to file... TODO: move to common utils
  const getFilePath = async (uri: string) => {
    let file = '';
    if (uri.startsWith('content://')) {
      const info = await RNFetchBlob.fs.stat(uri);
      file = info?.path;
    }

    if (file.startsWith('/storage')) {
      return `file://${file}`;
    }
    return uri;
  };

  const uploadVideo = async () => {
    try {
      if (!auth().currentUser?.uid) {
        navigation.navigate('Login');
        return;
      }
      setUploading(true);
      const videoId = uuid();
      const reference = storage().ref(
        `videos/${auth().currentUser?.uid}/${videoId}.mp4`,
      );
      const supportedPath = await getFilePath(path as any);
      await reference.putFile(supportedPath, {contentType: 'video/mp4'});
      const videoUrl = await reference.getDownloadURL();
      const savedPost = await firestore().collection('posts').add({
        userId: auth().currentUser?.uid,
        displayName: loggedInUser?.displayName, // auth().currentUser.displayName,
        avatar: auth().currentUser?.photoURL,
        createdAt: moment().format(),
        type: 'video',
        statuscode: 1, // draft
        video: videoUrl,
        videoId: videoId,
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0,
      });
      analytics().logEvent('video_uploaded'); // conversion
      const postId = savedPost.path.substring(
        savedPost.path.lastIndexOf('/') + 1,
      );
      navigation.navigate('AddPost', {
        postId: postId,
      });
      await firestore()
        .collection('audios')
        .doc(postId)
        .set(
          {
            title: `original - ${auth().currentUser?.displayName}`,
            createdBy: auth().currentUser?.uid,
            creatorName: auth().currentUser?.displayName,
            creatorPhoto: auth().currentUser?.photoURL,
            createdAt: moment().format(),
            updatedAt: moment().format(),
            usedByPosts: [],
            audioId: videoId,
          },
          {merge: true},
        );
      setUploading(false);
      analytics().logEvent('video_upload');
    } catch (err) {
      setUploading(false);
      Sentry.captureException(err);
    }
  };

  const takeVideo = async () => {
    try {
      if (camera) {
        const recordOptions = {
          quality: RNCamera.Constants.VideoQuality['480p'],
          maxDuration: VIDEO_MAX_DURATION,
          maxFileSize: 5242880,
          base64: true,
          videoBitrate: 100 * 1000 * 8, // ~ 100 kbps
        };
        setIsRecording(true);
        setCounter((c) => {
          c = VIDEO_MAX_DURATION;
          return c;
        });
        const data = await (camera as any).recordAsync(recordOptions);
        setIsRecording(false);
        setPath(data.uri);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const stopRec = async () => {
    try {
      await (camera as any).stopRecording();
      setCounter(reset as any);
      setIsRecording(false);
      analytics().logEvent('video_recorded');
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const changeCameraType = () => {
    if (cameraType === RNCamera.Constants.Type.back) {
      setCameraType(RNCamera.Constants.Type.front);
    } else {
      setCameraType(RNCamera.Constants.Type.back);
    }
  };

  const changeCameraFlash = () => {
    if (cameraType === RNCamera.Constants.Type.back) {
      if (cameraFlash === RNCamera.Constants.FlashMode.torch) {
        setCameraFlash(RNCamera.Constants.FlashMode.off);
      } else {
        setCameraFlash(RNCamera.Constants.FlashMode.torch);
      }
    }
  };

  const handleVideoOnLoad = (data: any) => {
    try {
      if (data?.duration > 60) {
        Alert.alert(
          ':(',
          'ভিডিও ${VIDEO_MAX_DURATION} সেকেন্ডের বেশি | \nVideo more than ${VIDEO_MAX_DURATION} seconds!',
        );
        setPath(null);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      const counterInterval = setInterval(() => {
        // console.log('This will run every second!', countRef.current);
        if ((countRef as any).current > 0) {
          setCounter((c) => c - 1); // callback
        }
      }, 1000);

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
        clearInterval(counterInterval);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, route]),
  );

  const setSharedVideo = async (uri: string) => {
    try {
      const filepath = await getFilePath(uri);
      setPath(filepath as any);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    // counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);

    if (route.params?.sharedvideo) {
      setSharedVideo(route.params?.contenturi);
    }

    const unsubscribe = navigation.addListener('focus', () => {
      // setPath(null);
    });
    return () => {
      unsubscribe;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter, route.params?.filename, path]);

  const renderCamera = () => {
    return (
      <RNCamera
        ref={(ref: any) => {
          camera = ref;
        }}
        style={styles.preview}
        type={cameraType}
        flashMode={cameraFlash as any}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        androidRecordAudioPermissionOptions={{
          title: 'Permission to use audio recording',
          message: 'We need your permission to use your audio',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        // mode={RNCamera.Constants}
      >
        <View style={{alignSelf: 'center'}}>
          <Text
            ref={countRef as any}
            style={{
              bottom: 200,
              color: 'red',
              fontSize: 42,
              lineHeight: 46,
              marginTop: 25,
            }}>
            {isRecording && counter ? counter : ' '}
          </Text>
        </View>
        <View
          style={{
            bottom: 300,
            right: 10,
            flex: 0,
            flexDirection: 'column',
            justifyContent: 'center',
            alignSelf: 'flex-end',
          }}>
          <TouchableOpacity
            style={styles.captureBtns}
            onPress={changeCameraFlash}>
            {cameraFlash === RNCamera.Constants.FlashMode.torch ? (
              <Image
                source={require('../../assets/camera-flash-off.webp')}
                style={styles.icon}
              />
            ) : (
              <Image
                source={require('../../assets/camera-flash.png')}
                style={styles.icon}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureBtns}
            onPress={changeCameraType}>
            <Image
              source={require('../../assets/flip_camera.webp')}
              style={styles.icon}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.captureBtns}
            onPress={() => {
              navigation.navigate('Song');
            }}>
            <Image
              source={require('../../assets/music.webp')}
              style={styles.icon}
              tintColor="#fff"
            />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.captureBtns}
            onPress={() => {
              navigation.navigate('AudioLibrary');
            }}>
            <LottieView
              source={audios}
              autoPlay
              loop
              style={{width: 50, height: 50}}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{width: 0.2 * width}}
            onPress={() => navigation.goBack()}>
            <Text style={{color: '#fff'}}>Back</Text>
          </TouchableOpacity>
          {!isRecording ? (
            <TouchableOpacity onPress={takeVideo} style={styles.capture}>
              <Image
                source={require('../../assets/record.png')}
                style={{width: 80, height: 80, tintColor: '#ea445a'}}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={stopRec} style={styles.capture}>
              <Image
                source={require('../../assets/stop-recording.webp')}
                style={{width: 80, height: 80, tintColor: '#ea445a'}}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: 0.2 * width,
            }}
            onPress={pickVideo}>
            <Text style={{color: 'white'}}>Album</Text>
            <Image
              source={require('../../assets/photo-album.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
          <View style={styles.captureBtns}>
            <AudioPlay
              uri={`https://firebasestorage.googleapis.com/v0/b/arohikulik.appspot.com/o/videos%2Faudios%2F${audio}.mp3?alt=media`}
              loop={true}
            />
          </View>
        </View>
      </RNCamera>
    );
  };

  const renderVideo = () => {
    return (
      <View>
        <Video
          paused={playbackPaused}
          source={{
            uri: path,
          }}
          ref={player} // Store reference
          style={styles.recordedVideo}
          repeat
          resizeMode="cover"
          onLoad={handleVideoOnLoad}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={styles.playbackBtn}
            onPress={() => {
              setPlaybackPaused(!playbackPaused);
            }}>
            <Image
              source={require('../../assets/playback.jpg')}
              style={{width: 50, height: 50, tintColor: '#fac030'}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={uploadVideo}
            disabled={uploading}>
            <Text style={styles.uploadTxt}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setPath(null);
              // setVideoPath(null);
              setCounter(reset as any);
            }}
            disabled={uploading}>
            <Text style={styles.cancel}>X</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {path && !isRecording ? renderVideo() : renderCamera()}
    </SafeAreaView>
  );
}
