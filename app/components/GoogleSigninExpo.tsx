import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
  Image,
  Dimensions,
} from 'react-native';
import * as GoogleSignIn from 'expo-google-sign-in';
import auth from '@react-native-firebase/auth';
import * as Sentry from '@sentry/react-native';

import constants from '../config/constants';

const {width} = Dimensions.get('window');

interface State {
  user: any;
}

export default class GoogleSigninExpo extends Component<{}, State, any> {
  state = {user: null};

  componentDidMount() {
    this.initAsync();
  }

  initAsync = async () => {
    await GoogleSignIn.initAsync({
      // You may ommit the clientId when the firebase `googleServicesFile` is configured
      // clientId: '<YOUR_IOS_CLIENT_ID>',
      webClientId: `${constants.config.auth.google.webclient}`,
    });
    this._syncUserWithStateAsync();
  };

  _syncUserWithStateAsync = async () => {
    try {
      const user = await GoogleSignIn.signInSilentlyAsync();
      this.setState({user});

      if (user?.auth?.idToken) {
        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(
          user?.auth?.idToken as string,
        );

        // Sign-in the user with the credential
        await auth().signInWithCredential(googleCredential); // returns user details
        const uid = auth().currentUser?.uid;
        if (uid) {
          Sentry.setUser({
            uid: uid,
            email: auth().currentUser?.email as string,
          });
        }

        (this.props as any).navigation?.navigate('Feed');
      }

      Sentry.captureException(
        new Error(`idToken is not found ${JSON.stringify(user)}`),
      );
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  signOutAsync = async () => {
    await GoogleSignIn.signOutAsync();
    this.setState({user: null});
  };

  signInAsync = async () => {
    try {
      await GoogleSignIn.askForPlayServicesAsync();
      const {type, user} = await GoogleSignIn.signInAsync();
      user && Sentry.setUser(user);
      if (type === 'success') {
        this._syncUserWithStateAsync();
      }
    } catch (err) {
      // Alert.alert('login: Error:' + err.message);
      Sentry.captureException(err);
    }
  };

  onPress = () => {
    // if (this.state.user) {
    //   this.signOutAsync();
    // } else {
    //   this.signInAsync();
    // }
    this.signInAsync();
  };

  render() {
    return (
      <>
        <TouchableNativeFeedback onPress={this.onPress}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: 0.8 * width,
              height: 50,
              borderRadius: 30,
              backgroundColor: '#fff',
            }}>
            <Image
              source={require('../assets/images/google_icon.png')}
              style={{
                height: 30,
                width: 30,
                borderRadius: 25,
                margin: 15,
                resizeMode: 'cover',
              }}
            />
            <Text>Google Signin</Text>
          </View>
        </TouchableNativeFeedback>
      </>
    );
  }
}
