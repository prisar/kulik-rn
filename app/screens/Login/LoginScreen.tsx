import React, {useEffect, useState, useContext} from 'react';
import {Text, StyleSheet, TextInput, Dimensions} from 'react-native';
import analytics from '@react-native-firebase/analytics';
import auth from '@react-native-firebase/auth';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import remoteConfig from '@react-native-firebase/remote-config';

import {LocalizationContext} from '../Translation/Translations';
import Button from '../../components/Button';
import GoogleSigninExpo from '../../components/GoogleSigninExpo';
import {login} from '../../store/auth/actions';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#002852',
  },
  error: {
    color: 'red',
    marginLeft: 30,
    marginRight: 30,
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
    color: '#fff',
  },
  email: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 0.6 * width,
    borderRadius: 3,
    color: '#fff',
  },
  password: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 0.6 * width,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 3,
    color: '#fff',
  },
  country: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 0.12 * width,
    margin: 10,
    borderRadius: 3,
    color: '#fff',
  },
  phone: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 0.4 * width,
    margin: 10,
    borderRadius: 3,
    color: '#fff',
  },
});

export default function LoginScreen({navigation}: any) {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [error, setError] = React.useState('');
  const showemaillogin = remoteConfig().getValue('login_show_email_login');

  const dispatch = useDispatch();

  const {translations} = useContext(LocalizationContext);

  // Handle user state changes
  function onAuthStateChanged(user: any) {
    Sentry.setUser(user);
    // dispatch user
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initializing) {
    return null;
  }

  const userLogin = async () => {
    try {
      setError('');
      if (!email || !password) {
        throw 'Empty fields';
      }
      await auth().signInWithEmailAndPassword(email, password);
      await firestore()
        .collection('users')
        .doc(auth().currentUser?.uid)
        .set(
          {
            userId: auth().currentUser?.uid || '',
            displayName: auth().currentUser?.displayName || '',
            phoneNumber: auth().currentUser?.phoneNumber || '',
            avatar: auth().currentUser?.photoURL,
            updatedAt: moment().format(),
            lastSignInTime: auth().currentUser?.metadata?.lastSignInTime,
            lastActivityAt: moment().format(),
            preferredLanguage: translations['langcode'],
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
      analytics().logEvent('user_login_email');
      navigation.navigate('Feed');
    } catch (err) {
      setError(err.toString());
      Sentry.captureException(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{fontSize: 36, marginBottom: 30, color: '#fff'}}>
        {translations['login.title']}
      </Text>

      {showemaillogin.asBoolean() && (
        <>
          <TextInput
            style={styles.email}
            onChangeText={(text) => onChangeEmail(text)}
            value={email}
            placeholder={translations['login.placeholder.email']}
            placeholderTextColor="#fff"
          />
          <TextInput
            secureTextEntry={true}
            style={styles.password}
            onChangeText={(text) => onChangePassword(text)}
            value={password}
            placeholder={translations['login.placeholder.password']}
            placeholderTextColor="#fff"
          />
          <Button
            variant="primary"
            label={translations['login.button.login']}
            onPress={userLogin}
            // disabled={!email || !password}
          />
          <Text style={{margin: 30, color: '#fff'}}>
            {translations['login.text.or']}
          </Text>
        </>
      )}

      <Button
        // title="Phone Signin"
        variant="primary"
        label={translations['login.button.phonesignin']}
        onPress={() =>
          navigation.navigate('PhoneVerification', {phoneSignIn: true})
        }
      />
      <Text style={{margin: 30, color: '#fff'}}>
        {translations['login.text.or']}
      </Text>

      <GoogleSigninExpo navigation={navigation as any} />
      <Text style={styles.error}>{error.toString()}</Text>
    </SafeAreaView>
  );
}
