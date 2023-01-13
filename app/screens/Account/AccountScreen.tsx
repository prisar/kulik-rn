import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import * as Sentry from '@sentry/react-native';
import {useNavigation} from '@react-navigation/native';

import {LocalizationContext} from '../Translation/Translations';
import {SafeAreaView} from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  title: {
    margin: 20,
    alignSelf: 'flex-start',
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
    color: '#000',
  },
  edit: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    width: '70%',
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    color: 'black',
    fontSize: 18,
  },
  heading: {
    fontSize: 32,
    color: '#000',
  },
  subheading: {
    fontSize: 22,
  },
  actionBtns: {
    margin: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fac030',
    height: 50,
    width: '90%',
    borderRadius: 30,
  },
  phone: {
    marginHorizontal: 30,
    marginVertical: 10,
  },
  phoneVer: {
    marginHorizontal: 20,
    marginVertical: 10,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    backgroundColor: 'blue',
    height: 30,
    width: 100,
    borderRadius: 15,
  },
  phoneVerText: {
    fontSize: 12,
    color: '#fff',
  },
  actionBtnText: {
    fontSize: 26,
    color: '#000',
  },
  userProfile: {
    flex: 1,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  userDetail: {
    marginVertical: 15,
  },
  email: {
    flexDirection: 'row',
  },
  emailVer: {
    marginLeft: 10,
    alignSelf: 'center',
  },
  verifiedIcon: {
    marginTop: 10,
    marginLeft: 5,
  },
  error: {
    color: 'red',
    marginLeft: 30,
    marginRight: 30,
  },
});

interface IProps {
  route: any;
}

export default function AccountScreen({route}: IProps) {
  const [currentUser, setCurrentUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(null);
  const [email, setEmail] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [error, setError] = useState('');

  const navigation = useNavigation();
  const {translations} = useContext(LocalizationContext);

  const updateProfile = async () => {
    try {
      const user = auth().currentUser;
      if (!displayName) {
        setError('Name is empty');
        return;
      }
      await user?.updateProfile({
        displayName: displayName || '',
      });
      await sendEmail();
      setEditing(false);
      setUser();
      const result = await firestore()
        .collection('users')
        .where('userId', '==', auth().currentUser?.uid)
        .get();
      const userdata = result.docs[result.docs.length - 1];
      if (!userdata) {
        await firestore().collection('users').add({
          userId: auth().currentUser?.uid,
          displayName: displayName,
          email: email,
          createdAt: moment().format(),
          updatedAt: moment().format(),
          photoUrl: auth().currentUser?.photoURL,
          lastSignInTime: auth().currentUser?.metadata?.lastSignInTime,
          lastActivityAt: moment().format(),
        });
        return;
      } else {
        await firestore().collection('users').doc(userdata.id).set(
          {
            displayName: displayName,
            email: email,
            updatedAt: moment().format(),
            photoUrl: auth().currentUser?.photoURL,
            lastSignInTime: auth().currentUser?.metadata?.lastSignInTime,
          },
          {merge: true},
        );
      }
    } catch (err) {
      setError(err.message);
      Sentry.captureException(err);
    }
  };

  const sendEmail = async () => {
    try {
      const user = auth().currentUser;
      await user?.sendEmailVerification();
    } catch (err) {
      setError(err.message);
      Sentry.captureException(err);
    }
  };

  const setUser = async () => {
    if (!auth().currentUser) {
      navigation.navigate('Home');
    }
    const dbuser = await firestore()
      .collection('users')
      .doc(auth().currentUser?.uid)
      .get();
    if (!dbuser.exists) {
      setCurrentUser(auth().currentUser as any);
      setDisplayName(auth().currentUser?.displayName as any);
      setEmail(auth().currentUser?.email as any);
      setPhoneNumber(auth().currentUser?.phoneNumber as any);
    } else {
      setCurrentUser((dbuser as any).data());
      setDisplayName((dbuser as any)?.displayName as any);
      setEmail((dbuser as any)?.email as any);
      setPhoneNumber((dbuser as any)?.phoneNumber as any);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route?.params?.editingOn) {
        setEditing(true);
      } else {
        setEditing(false);
      }
      setUser();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>{translations['account.title']}</Text>
      </View>
      {editing ? (
        <View style={styles.edit}>
          <TextInput
            value={displayName || ''}
            onChangeText={(text) => setDisplayName(text as any)}
            style={styles.input}
            placeholder={translations['account.label.name']}
          />
          <TextInput
            value={email || ''}
            onChangeText={(text) => setEmail(text as any)}
            style={styles.input}
            placeholder={translations['account.label.email']}
          />
          <Text style={styles.phone}>{(currentUser as any)?.phoneNumber}</Text>

          <TouchableOpacity
            style={styles.phoneVer}
            onPress={() => {
              navigation.navigate('PhoneVerification');
            }}>
            <Text style={styles.phoneVerText}>
              {translations['account.action.changemobile']}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtns} onPress={updateProfile}>
            <Text style={styles.actionBtnText}>
              {translations['account.action.save']}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.userProfile}>
          <View style={styles.userDetail}>
            <Text style={styles.heading}>
              {translations['account.label.name']}
            </Text>
            <Text style={styles.subheading}>{displayName}</Text>
          </View>
          <View style={styles.userDetail}>
            <Text style={styles.heading}>
              {translations['account.label.email']}
            </Text>
            <View style={styles.email}>
              <Text style={styles.subheading}>{email}</Text>
              {currentUser !== null && (currentUser as any)?.emailVerified ? (
                <Icon
                  name="check-circle"
                  color={'green'}
                  style={styles.verifiedIcon}
                />
              ) : (
                <TouchableOpacity style={styles.emailVer} onPress={sendEmail}>
                  <Text>Verify</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.userDetail}>
            <Text style={styles.heading}>
              {translations['account.label.mobile']}
            </Text>
            <Text>{!phoneNumber ? 'NA' : phoneNumber}</Text>
            {(auth().currentUser as any)?.phoneVerified ? (
              <Icon
                name="check-circle"
                color={'green'}
                style={styles.verifiedIcon}
              />
            ) : (
              <></>
            )}
          </View>

          <Text style={styles.error}>{error.toString()}</Text>

          <TouchableOpacity
            style={styles.actionBtns}
            onPress={() => setEditing(true)}>
            <Text style={styles.actionBtnText}>
              {translations['account.action.edit']}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
