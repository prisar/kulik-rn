import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {default as ImageCropper} from 'react-native-image-crop-picker';
import * as Progress from 'react-native-progress';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import moment from 'moment';
import * as Sentry from '@sentry/react-native';
import analytics from '@react-native-firebase/analytics';

import {LocalizationContext} from '../Translation/Translations';
import {greenColor, darkColor} from '../../GlobalStyles';
import {uuid} from '../../utils/uuid';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  imageBox: {
    width: 300,
    height: 300,
    // marginTop: 20,
    // marginLeft: 45,
  },
  selectButton: {
    borderRadius: 30,
    width: 200,
    height: 50,
    margin: 5,
    backgroundColor: darkColor,
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 30,
    // marginLeft: 120,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    alignSelf: 'center',
  },
  uploadButton: {
    borderRadius: 30,
    width: 200,
    height: 50,
    backgroundColor: greenColor,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  error: {
    color: 'red',
    marginHorizontal: 30,
    fontSize: 32,
  },
});

interface IProps {
  route: any;
  navigation: any;
}

export default function AddImageScreen({route, navigation}: IProps) {
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [error, setError] = useState('');

  const {translations} = useContext(LocalizationContext);

  const options = {
    title: translations['addimage.picker.title'],
    mediaType: 'photo',
    allowsEditing: true,
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const wait = (timeout: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  };

  const selectImage = () => {
    try {
      setCroppedImage(null);
      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          // console.log('User cancelled image picker');
        } else if (response.error) {
          // console.log('launchImageLibrary Error: ', response.error);
        } else if (response.customButton) {
          // console.log('User tapped custom button: ', response.customButton);
        } else {
          // const source = {uri: response.uri};

          setImage(response as any);
        }
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const updateProfilePhoto = async () => {
    try {
      const reference = storage().ref(
        `images/users/${auth().currentUser?.uid}/profilePicture.png`,
      );
      const photoUrl = await reference.getDownloadURL();
      const user = auth().currentUser;
      user
        ?.updateProfile({
          photoURL: photoUrl,
        })
        .then(function () {
          // Update successful.
          navigation.navigate('Profile', {
            currentProfile: true,
            userId: auth().currentUser?.uid,
          });
        })
        .catch((err) => {
          // An error happened.
          Sentry.captureException(err);
        });
      await firestore().collection('users').doc(auth().currentUser?.uid).set(
        {
          photoUrl: photoUrl,
          avatar: photoUrl,
          updatedAt: moment().format(),
          lastActivityAt: moment().format(),
          photoInBucket: true,
        },
        {merge: true},
      );
      analytics().logEvent('profile_photo_upload');
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const updateImagePost = async (photoId: string, filename: string) => {
    try {
      setTransferred(0.75);
      await wait(5000); // TODO need to do without delay
      const reference = storage().ref(
        `images/posts/${auth().currentUser?.uid}/${photoId}.jpg`,
      );
      const photoUrl = await reference.getDownloadURL();
      if (photoUrl) {
        const savedPost = await firestore().collection('posts').add({
          userId: auth().currentUser?.uid,
          displayName: auth().currentUser?.displayName,
          avatar: auth().currentUser?.photoURL,
          createdAt: moment().format(),
          type: 'photo',
          statuscode: 1, // draft
          photoId: photoId,
          photoUrl: photoUrl,
          filename: filename,
          likes: 0,
          shares: 0,
          comments: 0,
          views: 0,
          inBucket: true,
        });
        setTransferred(1);
        setUploading(false);
        setImage(null);
        navigation.navigate('AddPost', {
          postId: savedPost.path.substring(savedPost.path.lastIndexOf('/') + 1),
        });
      }
      analytics().logEvent('image_upload');
    } catch (err) {
      setError(':(');
      setUploading(false);
      Sentry.captureException(err);
    }
  };

  const monitorFileUpload = async (uploadTask: any) => {
    let downloadURL;
    uploadTask.on('state_changed', async (snapshot: any) => {
      switch (snapshot.state) {
        case 'running':
          setUploading(true);
          break;
        case 'success':
          downloadURL = await snapshot.ref.getDownloadURL();
          break;
        default:
          break;
      }
    });
    return downloadURL;
  };

  const onCrop = async () => {
    try {
      const cimage = await ImageCropper.openCropper({
        path: (image as any)?.uri,
        width: 400,
        height: 300,
      } as any);
      setCroppedImage(cimage as any);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const uploadImage = async () => {
    try {
      if (uploading) {
        return;
      }

      if (!croppedImage) {
        Alert.alert('Crop the image');
        return;
      }

      setUploading(true);

      const {path} = croppedImage as any;
      const filename = path?.substring(path?.lastIndexOf('/') + 1); // uri.substring(uri.lastIndexOf('/') + 1);
      const photoId = uuid();
      setTransferred(0);

      if (route.params?.action === 'PROFILE_PHOTO') {
        const reference = storage().ref(
          `images/users/${auth().currentUser?.uid}/profilePicture.png`,
        );
        const uploadTask = reference.putFile(path, {
          contentType: (image as any)?.type,
        });
        await monitorFileUpload(uploadTask);
        await updateProfilePhoto();
      } else if (route.params?.action === 'IMAGE_POST') {
        const reference = storage().ref(
          `images/posts/${auth().currentUser?.uid}/${photoId}.jpg`,
        );
        const uploadTask = reference.putFile(path, {
          contentType: (image as any)?.type,
        });
        setTransferred(0.5);
        await monitorFileUpload(uploadTask);
        await updateImagePost(photoId, filename);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  return (
    <View style={styles.container}>
      {!(image as any)?.uri && (
        <TouchableOpacity style={styles.selectButton} onPress={selectImage}>
          <Text style={styles.buttonText}>
            {translations['addimage.action.choosepic']}
          </Text>
        </TouchableOpacity>
      )}
      <View style={{margin: 5}}>
        {image !== null ? (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Image
              source={{uri: (croppedImage as any)?.path || (image as any).uri}}
              style={styles.imageBox}
            />
            <TouchableOpacity style={styles.uploadButton} onPress={onCrop}>
              <Text style={styles.buttonText}>
                {croppedImage
                  ? translations['addimage.action.cropagain']
                  : translations['addimage.action.crop']}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      {uploading ? (
        <View style={styles.progressBarContainer}>
          <Progress.Bar progress={transferred} width={300} />
        </View>
      ) : (
        croppedImage && (
          <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
            <Text style={styles.buttonText}>
              {translations['addimage.action.upload']}
            </Text>
          </TouchableOpacity>
        )
      )}
      <Text style={styles.error}>{error.toString()}</Text>
    </View>
  );
}
