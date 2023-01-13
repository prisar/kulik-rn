import React from 'react';
import {Alert, Dimensions} from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-community/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import {useDispatch} from 'react-redux';
import * as Sentry from '@sentry/react-native';
import analytics from '@react-native-firebase/analytics';

// import {User} from '../store/user/model';
// import {selectLoggedInUser} from '../store/auth/selectors';
import {login} from '../store/auth/actions';
import constants from '../config/constants';

GoogleSignin.configure({
  webClientId: `${constants.config.auth.google.webcllient}`,
});

const {width} = Dimensions.get('window');

export default function GoogleSignIn({navigation}: any) {
  // const loggedInUser: User | undefined = selectLoggedInUser();
  const dispatch = useDispatch();

  async function onGoogleButtonPress() {
    try {
      // Get the users ID token
      const {idToken} = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      await auth().signInWithCredential(googleCredential);
      const result = await firestore()
        .collection('users')
        .doc(auth().currentUser?.uid)
        .get();
      if (!result?.exists) {
        await firestore()
          .collection('users')
          .doc(auth().currentUser?.uid)
          .set(
            {
              userId: auth().currentUser?.uid || '',
              displayName: auth().currentUser?.displayName || '',
              phoneNumber: auth().currentUser?.phoneNumber || '',
              phoneVerified: false,
              avatar: auth().currentUser?.photoURL,
              createdAt: moment().format(),
              updatedAt: moment().format(),
              lastSignInTime: auth().currentUser?.metadata?.lastSignInTime,
              lastActivityAt: moment().format(),
              preferredLanguage: 'bn',
              coins: 0,
              followers: 0,
              following: 0,
            },
            {merge: true},
          );
        dispatch(
          login({
            uid: auth().currentUser?.uid,
            displayName: auth().currentUser?.displayName || '',
            photoUrl: auth().currentUser?.photoURL || '',
            email: auth().currentUser?.email || '',
            phoneNumber: auth().currentUser?.phoneNumber || '',
          }),
        );
        (navigation as any).navigate('Discover');
      } else {
        await firestore()
          .collection('users')
          .doc(auth().currentUser?.uid)
          .set(
            {
              userId: auth().currentUser?.uid || '',
              displayName: auth().currentUser?.displayName || '',
              // phoneNumber: auth().currentUser?.phoneNumber || '',
              avatar: auth().currentUser?.photoURL,
              updatedAt: moment().format(),
              lastSignInTime: auth().currentUser?.metadata?.lastSignInTime,
              lastActivityAt: moment().format(),
              preferredLanguage: 'bn',
              loggedInApps: firestore.FieldValue.arrayUnion('com.agrohi.kulik'),
            },
            {merge: true},
          );
        dispatch(
          login({
            uid: auth().currentUser?.uid,
            displayName: auth().currentUser?.displayName || '',
            photoUrl: auth().currentUser?.photoURL || '',
            email: auth().currentUser?.email || '',
            phoneNumber: auth().currentUser?.phoneNumber || '',
          }),
        );
        (navigation as any).navigate('Discover');
      }
      analytics().logEvent('google_signin');
    } catch (err) {
      // console.log(err);
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (err?.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (err?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
        Alert.alert('Google signing not working. Try with email');
      }
      Sentry.captureException(err);
    }
  }

  return (
    <GoogleSigninButton
      style={{width: 0.6 * width, height: 48}}
      size={GoogleSigninButton.Size.Standard}
      color={GoogleSigninButton.Color.Dark}
      onPress={() => onGoogleButtonPress()}
      // disabled={isSigninInProgress}
    />
  );
}
