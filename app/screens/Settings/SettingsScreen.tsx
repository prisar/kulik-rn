import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';
import {useDispatch} from 'react-redux';
import Share from 'react-native-share';
import firestore from '@react-native-firebase/firestore';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import RNFetchBlob from 'rn-fetch-blob';

import {LocalizationContext} from '../Translation/Translations';
import {logout} from '../../store/auth/actions';
import constants from '../../config/constants';

const {height, width} = Dimensions.get('window');
const fs = RNFetchBlob.fs;

const styles = StyleSheet.create({
  settingsContainer: {
    height: 0.4 * height,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  linearGradient: {
    borderRadius: 3,
    borderColor: '#000',
    width: width,
    height: 0.4 * height,
    left: 0.1 * width,
    borderBottomLeftRadius: 120,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  userImage: {
    width: 80,
    height: 80,
    bottom: 0.45 * width,
    borderRadius: 80,
  },
  menuItem: {
    borderRadius: 5,
    padding: 5,
    margin: 3,
    width: 0.85 * width,
    height: 42,
    borderColor: '#000',
    fontWeight: 'bold',
    backgroundColor: '#ffff',
    elevation: 32,
  },
  menuText: {
    fontSize: 22,
    paddingLeft: 10,
    color: '#000',
  },
  menuIcon: {
    fontSize: 26,
  },
  menuArrow: {
    left: 0.7 * width,
    fontSize: 26,
    bottom: 0.04 * height,
    elevation: 10,
    color: '#000',
  },
});

interface IProps {
  navigation: any;
}

export function SettingsScreen({navigation}: IProps) {
  const [currentUser, setCurrentUser] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const {translations} = useContext(LocalizationContext);
  const dispatch = useDispatch();

  const logOut = async () => {
    try {
      await auth().signOut();
      dispatch(logout());
      navigation.navigate('Home');
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const appShare = async () => {
    try {
      let imagePath: any = null;
      const link =
        'https://firebasestorage.googleapis.com/v0/b/agrohikulik.appspot.com/o/images%2Fscreens%2Fdiscover%2Fyou_too_upload.png?alt=media';
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
          setBase64Image(base64Data);
          // remove the file from storage
          return fs.unlink(imagePath);
        })
        .catch((err) => {
          Sentry.captureException(err);
        });

      const result = await Share.open({
        title: 'Agrohi App',
        message:
          'রাজবংশী এপখান ইনস্টল করি হামাক সমর্থন করো, AppLink: https://bit.ly/3gbjrBJ',
        subject: 'Tell your friends',
        url: `data:image/png;base64,${base64Image}`,
      });

      const {app} = result;
      if (app && auth().currentUser?.uid) {
        const query = await firestore()
          .collection('users')
          .doc(auth().currentUser?.uid)
          .get();
        const user = query.data();
        await firestore()
          .collection('users')
          .doc(auth().currentUser?.uid)
          .set(
            {
              appshares: (user?.appshares ? user?.appshares : 0) + 1,
              apps: [...(user?.apps || []), app],
            },
            {merge: true},
          );
        return;
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    setCurrentUser(auth().currentUser as any);

    const unsubscribe = navigation.addListener('focus', () => {
      setCurrentUser(auth().currentUser as any);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <LinearGradient
          start={{x: 1, y: 0}}
          end={{x: 0, y: 1}}
          colors={['#002852', '#002852', '#1654f0']}
          style={styles.linearGradient}
        />
      </View>
      <Image
        style={styles.userImage}
        source={{
          uri:
            currentUser !== null
              ? (currentUser as any)?.photoURL
              : 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_man_male_person-512.png',
        }}
      />

      {!currentUser ? (
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={appShare}>
            <Text style={styles.menuText}>
              <Icon name="share" style={styles.menuIcon} />{' '}
              {translations['settings.menu.share']}
            </Text>
            <Icon name="arrow-right" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.menuText}>
              <Icon name="sign-out" style={styles.menuIcon} />
              {` ${translations['settings.menu.login']}`}
            </Text>
            <Icon name="arrow-right" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.menuText}>
              <Icon name="sign-in" style={styles.menuIcon} />{' '}
              {translations['settings.menu.signup']}
            </Text>
            <Icon name="arrow-right" style={styles.menuArrow} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.settingsContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChatList')}
            disabled={!currentUser}>
            <Text style={styles.menuText}>
              <Icon name="envelope-o" style={styles.menuIcon} />
              {'  '}
              {translations['settings.menu.messages']}
            </Text>
            <Icon name="arrow-right" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              navigation.navigate('Profile', {
                currentProfile: true,
                userId: auth().currentUser?.uid,
              })
            }
            disabled={!currentUser}>
            <Text style={styles.menuText}>
              <Icon name="user-o" style={styles.menuIcon} />
              {'   '}
              {translations['settings.menu.account']}
            </Text>
            <Icon name="arrow-right" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Account')}>
            <Text style={styles.menuText}>
              <Icon name="id-card-o" style={styles.menuIcon} />{' '}
              {translations['settings.menu.contact']}
            </Text>
            <Icon name="arrow-right" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={appShare}>
            <Text style={styles.menuText}>
              <Icon name="share" style={styles.menuIcon} />
              {'  '}
              {translations['settings.menu.share']}
            </Text>
            <Icon name="arrow-right" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={logOut}
            disabled={!currentUser}>
            <Text style={styles.menuText}>
              <Icon name="sign-out" style={styles.menuIcon} />
              {`  ${translations['settings.menu.logout']}`}
            </Text>
            <Icon name="arrow-right" style={styles.menuArrow} />
          </TouchableOpacity>
        </View>
      )}

      <View style={{flexDirection: 'row', marginBottom: 50}}>
        <Text
          style={{fontSize: 12, margin: 10}}
          onPress={() =>
            navigation.navigate('Privacy', {
              source: `${constants.config.hosting.web}/privacy.html`,
            })
          }>
          {translations['settings.menu.privacy']}
        </Text>
        <Text
          style={{fontSize: 12, margin: 10}}
          onPress={() =>
            navigation.navigate('Terms', {
              source: `${constants.config.hosting.web}/terms.html`,
            })
          }>
          {translations['settings.menu.terms']}
        </Text>
	<Text
          style={{fontSize: 12, margin: 10}}
          onPress={() => navigation.navigate('Language')}>
          {translations['settings.menu.language']}
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default SettingsScreen;
