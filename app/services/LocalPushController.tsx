import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  // (required) Called when a remote or local notification is opened or received
  onNotification: function (notification: any) {
    // console.log('LOCAL NOTIFICATION ==>', notification);
  },
  popInitialNotification: true,
  requestPermissions: true,
});

export const LocalNotification = ({bigText, subText, title, message}: any) => {
  PushNotification.localNotification({
    autoCancel: true,
    bigText: bigText,
    subText: subText,
    title: title,
    message: message,
    vibrate: true,
    vibration: 300,
    playSound: true,
    soundName: 'default',
  });
};
