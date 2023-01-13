// In App.js in a new project

import React, {useEffect} from 'react';
import {Alert, Linking} from 'react-native';
import 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import remoteConfig from '@react-native-firebase/remote-config';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
// import {Platform, UIManager} from 'react-native';
import * as Sentry from '@sentry/react-native';
// import * as Updates from 'expo-updates';
import analytics from '@react-native-firebase/analytics';

import RootScreen from './screens/Root/RootScreen';
import RemotePushController from './services/RemotePushController';
import {rootReducer} from './store/rootReducer';
import {navigationRef} from './navigation/AppNavigator';
import constants from './config/constants';

Sentry.init({
  dsn: `${constants.config.sentry.dsn}`,
  debug: false, // false, in prod
});

const sentryEnhancer = Sentry.createReduxEnhancer();

const store = createStore(rootReducer, sentryEnhancer);

async function saveTokenToDatabase(token: string) {
  // Assume user is already signed in
  const userId = auth().currentUser?.uid;
  if (!userId) {
    return;
  }

  // Add the token to the users datastore
  await firestore()
    .collection('users')
    .doc(userId)
    .update({
      tokens: firestore.FieldValue.arrayUnion(token),
    });
  // Allow user to receive messages now setup is complete
  inAppMessaging().setMessagesDisplaySuppressed(false);
}

const getDeviceToken = async () => {
  try {
    // Get the device token
    messaging()
      .getToken()
      .then((token) => {
        return saveTokenToDatabase(token);
      })
      .catch((err) => {
        Sentry.captureException(err);
      });
  } catch (err) {
    Sentry.captureException(err);
  }
};

function displayNotification(title: string, body: string) {
  // we display notification in alert box with title and body
  if ((body as any)?.data?.type === 'CHAT') {
    Alert.alert(
      title,
      body,
      [
        {
          text: 'Ok',
          onPress: () => {
            // console.log('ok pressed'); // TODO: navigate
            (navigationRef as any).current?.navigate('HomeTabs', {
              screen: 'Chats',
              params: {
                currentProfile: true,
                senderId: auth().currentUser?.uid,
              },
            });
          },
        },
      ],
      {cancelable: false},
    );
  }
}

// if (
//   Platform.OS === 'android' &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

export function App() {
  const otaUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        // ... notify user of update ...
        Alert.alert(
          'Update is Available!',
          'Do you want to update now?',
          [
            {
              text: 'Ok',
              onPress: () => {
                Updates.reloadAsync();
              },
            },
          ],
          {cancelable: true},
        );
      }
    } catch (e) {
      // handle or log error
      Sentry.captureException(e);
    }
  };

  // react native deep links
  const handleDynamicLink = (link: any) => {
    // Handle dynamic link inside your own application
    if (
      (link as any).url === `${constants.config.dynamiclinks.urlprefix}/offer`
    ) {
      // ...navigate to your offers screen
    }
    if (
      (link as any).url === `${constants.config.dynamiclinks.urlprefix}/home`
    ) {
      (navigationRef as any).current?.navigate('HomeTabs', {
        screen: 'Home',
      });
      return;
    }
    if (
      (link as any).url === `${constants.config.dynamiclinks.urlprefix}/feed`
    ) {
      (navigationRef as any).current?.navigate('HomeTabs', {
        screen: 'Feed',
      });
      return;
    }
    if (
      (link as any).url === `${constants.config.dynamiclinks.urlprefix}/addpost`
    ) {
      (navigationRef as any).current?.navigate('HomeTabs', {
        screen: 'AddPost',
      });
      return;
    }
    if (
      (link as any).url ===
      `${constants.config.dynamiclinks.urlprefix}/voicesearch`
    ) {
      (navigationRef as any).current?.navigate('HomeTabs', {
        screen: 'VoiceSearch',
      });
      return;
    }
    const [, , , screen] = link?.url?.split('/');
    if (!screen.includes('?')) {
      (navigationRef as any).current?.navigate('HomeTabs', {
        screen: screen,
      });
      return;
    }
  };

  const checkNotificationOpen = async () => {
    try {
      const notificationOpen = await messaging().getInitialNotification();
      if (notificationOpen) {
        const {data} = notificationOpen;
        const {type, link}: any = data;
        if (type === 'EXTERNAL_LINK') {
          Linking.canOpenURL(link).then((supported) => {
            if (supported) {
              analytics().logEvent('notification_link_open');
              Linking.openURL(link);
            } else {
              console.log("Don't know how to open URI: " + link);
            }
          });
        }
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    getDeviceToken();

    // notif received when the app is closed
    checkNotificationOpen();

    // // ask user to update only if the user is logged in, this condition is just to delay update
    // if (auth().currentUser?.uid) {
    //   otaUpdate();
    // }

    // If using other push notification providers (ie Amazon SNS, etc)
    // you may need to get the APNs token instead for iOS:
    // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }

    // Listen to whether the token changes
    messaging().onTokenRefresh((token) => {
      saveTokenToDatabase(token);
    });

    // background events using reactnative firebase
    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        if (link?.url === `${constants.config.dynamiclinks.urlprefix}/offer`) {
          // ...set initial route as offers screen
        }
      })
      .catch((err) => {
        Sentry.captureException(err);
      });

    remoteConfig()
      .setDefaults({
        app_ota_update_screen: false,
        home_awesome_new_voice_search: true,
        home_show_display_name: false,
        home_show_dramas: false,
        home_show_memes: true,
        home_show_tvshows: false,
        home_direct_navigation_to_stickers: false,
        discover_show_users: false,
        discover_show_recent_videos: false,
        discover_show_searchbar: false,
        login_show_email_login: false,
      })
      .then(() => remoteConfig().fetchAndActivate())
      .then((fetchedRemotely) => {
        if (fetchedRemotely) {
          // console.log('Configs were retrieved from the backend and activated.');
        } else {
          // console.log(
          //   'No configs were fetched from the backend, and the local configs were already activated',
          // );
        }
      })
      .catch((err) => {
        Sentry.captureException(err);
      });

    // Fetch and cache for 5 minutes
    const setConfigCache = async () => {
      try {
        await remoteConfig().fetch(300);
      } catch (err) {
        Sentry.captureException(err);
      }
    };
    setConfigCache();

    const setMinimumFetchInterval = async () => {
      try {
        await remoteConfig().setConfigSettings({
          minimumFetchIntervalMillis: 30000,
        });
      } catch (err) {
        Sentry.captureException(err);
      }
    };
    setMinimumFetchInterval();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      // console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      // console.log('remoteMessage', remoteMessage.notification);
      displayNotification(
        `${remoteMessage?.notification?.title} sent a message`,
        (remoteMessage as any)?.notification?.body,
      );
    });

    const unsubscribeDynamicLinks = dynamicLinks().onLink(handleDynamicLink);

    return () => {
      unsubscribe;
      unsubscribeDynamicLinks;
    };
  }, []);

  return (
    <>
      <Provider store={store}>
        <RemotePushController />
        <RootScreen />
      </Provider>
    </>
  );
}

export default App;
