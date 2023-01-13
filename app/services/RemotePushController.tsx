import {useEffect} from 'react';
import PushNotification from 'react-native-push-notification';
const RemotePushController = () => {
  useEffect(() => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        // console.log('TOKEN:', token);
      },
      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        // console.log('REMOTE NOTIFICATION ==>', notification);
        // process the notification here
      },
      // Android only: GCM or FCM Sender ID
      senderID: 'FIREBASE_MESSAGING_SENDERID',
      popInitialNotification: true,
      requestPermissions: true,
      ignoreInForeground: false,
    });
  }, []);
  return null;
};
export default RemotePushController;
