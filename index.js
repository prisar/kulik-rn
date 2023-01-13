/**
 * @format
 */

import 'expo-asset';
import 'react-native-gesture-handler';
import {Linking, AppRegistry} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import analytics from '@react-native-firebase/analytics';

import App from './app/App';
import {name as appName} from './app.json';
import {navigationRef} from './app/navigation/AppNavigator';

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  // console.log('Message handled in the background!', remoteMessage);

  /*
 If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
 */
  const notificationOpenedListener = messaging().onNotificationOpenedApp(
    (notificationOpen) => {
      try {
        const {data} = notificationOpen;
        const {type, link} = data;
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
      } catch (err) {
        // console.log(err);
      }
    },
  );
});

// To get All Recived Urls
ReceiveSharingIntent.getReceivedFiles(
  (files) => {
    // files returns as JSON Array example
    //[{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
    const {contentUri, fileName, mimeType} = files[0];
    const path = contentUri + fileName;
    if (mimeType === 'video/mp4') {
      // add post
      navigationRef.current?.navigate('HomeTabs', {
        screen: 'VideoPost',
        params: {
          sharedvideo: true,
          contenturi: contentUri,
          filename: fileName,
        },
      });
    }
  },
  (error) => {
    // console.log(error);
  },
  'ShareMedia', // share url protocol (must be unique to your app, suggest using your apple bundle id)
);

TrackPlayer.registerPlaybackService(() => require('./service'));
AppRegistry.registerComponent(appName, () => App);
