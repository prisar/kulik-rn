import React, {useEffect, useState, useContext} from 'react';
import {Text, StyleSheet, TextInput} from 'react-native';
import analytics from '@react-native-firebase/analytics';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

import {LocalizationContext} from '../Translation/Translations';
import Button from '../../components/Button';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#002852',
  },
  title: {
    marginBottom: 30,
    fontSize: 28,
    color: '#fff',
  },
  email: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    color: '#fff',
  },
  password: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    marginTop: 10,
    marginBottom: 30,
    color: '#fff',
  },
  error: {
    color: 'red',
  },
});

interface IProps {
  navigation: any;
}

export default function SignupScreen({navigation}: IProps) {
  const {translations} = useContext(LocalizationContext);
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState({});
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [error, setError] = React.useState('');

  // Handle user state changes
  function onAuthStateChanged(usr: any) {
    setUser(usr);
    if (initializing) {
      setInitializing(false);
      Sentry.setUser(user);
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

  const sendEmail = async () => {
    try {
      const usr = auth().currentUser;

      await usr?.sendEmailVerification();
    } catch (err) {
      //
    }
  };

  const signup = async () => {
    try {
      setError('');
      if (!email || !password) {
        throw 'Empty fields';
      }

      await auth().createUserWithEmailAndPassword(email, password);
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
            preferredLanguage: 'rbn',
            coins: 0,
            followers: 0,
            following: 0,
          },
          {merge: true},
        );
      analytics().logEvent('Screen_UserSignedUp');
      await sendEmail();
      navigation.navigate('Home');
    } catch (err) {
      setError(err.toString());
      crashlytics().recordError(new Error(err.toString()));
      Sentry.captureException(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{translations['signup.title']}</Text>
      <TextInput
        style={styles.email}
        onChangeText={(e) => onChangeEmail(e)}
        value={email}
        placeholder={translations['signup.placeholder.email']}
        placeholderTextColor="#fff"
      />
      <TextInput
        secureTextEntry={true}
        style={styles.password}
        onChangeText={(pwd) => onChangePassword(pwd)}
        value={password}
        placeholder={translations['login.placeholder.password']}
        placeholderTextColor="#fff"
      />
      <Button
        variant="primary"
        label={translations['signup.button']}
        onPress={signup}
      />
      <Text style={styles.error}>{error}</Text>
      <Text
        style={{fontSize: 18, color: '#fff', marginTop: 50}}
        onPress={() => navigation.navigate('Login')}>
        {translations['signup.message.registered']}
      </Text>
    </SafeAreaView>
  );
}
